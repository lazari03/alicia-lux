import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { checkoutSchema, type CheckoutResponse } from "@/lib/checkout"
import { shippingFor, vatPortion } from "@/lib/money"
import { stripe } from "@/lib/stripe"
import { serviceClient } from "@/lib/supabase/admin"
import type { Product, StoreSettings } from "@/lib/types"

export const runtime = "nodejs"

const fail = (status: number, body: Omit<Extract<CheckoutResponse, { ok: false }>, "ok">) =>
  NextResponse.json<CheckoutResponse>({ ok: false, ...body }, { status })

// Intents in these states can still have their amount changed.
const UPDATABLE: Stripe.PaymentIntent.Status[] = ["requires_payment_method", "requires_confirmation", "requires_action"]

/**
 * Creates (or updates) a pending order and its Stripe PaymentIntent.
 * Every price is re-read from Supabase — the client cart is never trusted.
 */
export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.at(-1)
      if (issue.path[0] === "customer" && typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return fail(400, { error: parsed.error.issues[0]?.message ?? "Check your details", fieldErrors })
  }
  const { orderId, items, customer } = parsed.data
  const db = serviceClient()

  // Merge duplicate lines, then load live product data.
  const wanted = new Map<string, number>()
  for (const i of items) wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity)

  const [{ data: products, error }, { data: settingsRow }] = await Promise.all([
    db.from("products").select("*").in("id", [...wanted.keys()]).eq("active", true),
    db.from("store_settings").select("shipping_fee_ore, free_shipping_over_ore").maybeSingle(),
  ])
  if (error) return fail(500, { error: "We couldn't load your bag. Please try again." })

  const byId = new Map((products as Product[]).map((p) => [p.id, p]))
  const stock = [...wanted].flatMap(([id, qty]) => {
    const available = byId.get(id)?.stock ?? 0
    return qty > available ? [{ productId: id, available }] : []
  })
  if (stock.length) {
    return fail(409, { error: "Some items are no longer available in the quantity you selected.", stock })
  }

  const lines = [...wanted].map(([id, quantity]) => {
    const p = byId.get(id)!
    return {
      product_id: p.id,
      name: p.subtitle ? `${p.name} — ${p.subtitle}` : p.name,
      image: p.images[0] ?? null,
      unit_price_ore: p.price_ore,
      quantity,
    }
  })
  const subtotal = lines.reduce((n, l) => n + l.unit_price_ore * l.quantity, 0)
  const settings = (settingsRow as StoreSettings) ?? { shipping_fee_ore: 0, free_shipping_over_ore: null }
  const shipping = shippingFor(subtotal, settings)
  const total = subtotal + shipping
  const totals = { subtotal, shipping, total, vat: vatPortion(total) }

  const orderFields = {
    email: customer.email,
    first_name: customer.firstName,
    last_name: customer.lastName,
    phone: customer.phone || null,
    address_line1: customer.address1,
    address_line2: customer.address2 || null,
    postal_code: customer.postalCode,
    city: customer.city,
    country: "SE",
    subtotal_ore: subtotal,
    shipping_ore: shipping,
    total_ore: total,
    vat_ore: totals.vat,
  }
  const shippingDetails: Stripe.PaymentIntentCreateParams.Shipping = {
    name: `${customer.firstName} ${customer.lastName}`,
    phone: customer.phone || undefined,
    address: { line1: customer.address1, line2: customer.address2 || undefined, postal_code: customer.postalCode, city: customer.city, country: "SE" },
  }

  let createdOrderId: string | null = null
  try {
    // 1) Re-use the shopper's pending order if its intent is still editable.
    if (orderId) {
      const { data: existing } = await db.from("orders").select("id, order_number, status, stripe_payment_intent_id").eq("id", orderId).maybeSingle()
      if (existing?.status === "pending" && existing.stripe_payment_intent_id) {
        const intent = await stripe().paymentIntents.retrieve(existing.stripe_payment_intent_id)
        if (UPDATABLE.includes(intent.status)) {
          const updated = await stripe().paymentIntents.update(intent.id, {
            amount: total,
            receipt_email: customer.email,
            shipping: shippingDetails,
          })
          await db.from("orders").update(orderFields).eq("id", existing.id)
          await db.from("order_items").delete().eq("order_id", existing.id)
          await db.from("order_items").insert(lines.map((l) => ({ ...l, order_id: existing.id })))
          return NextResponse.json<CheckoutResponse>({ ok: true, orderId: existing.id, clientSecret: updated.client_secret!, totals })
        }
      }
    }

    // 2) Otherwise create a fresh pending order + intent.
    const { data: order, error: insertError } = await db.from("orders").insert(orderFields).select("id, order_number").single()
    if (insertError || !order) throw insertError ?? new Error("Order insert failed")
    createdOrderId = order.id
    await db.from("order_items").insert(lines.map((l) => ({ ...l, order_id: order.id })))

    const intent = await stripe().paymentIntents.create(
      {
        amount: total,
        currency: "sek",
        automatic_payment_methods: { enabled: true },
        receipt_email: customer.email,
        description: `Alicia Lux order #${order.order_number}`,
        shipping: shippingDetails,
        metadata: { order_id: order.id, order_number: String(order.order_number) },
      },
      { idempotencyKey: `order-${order.id}` }
    )
    await db.from("orders").update({ stripe_payment_intent_id: intent.id }).eq("id", order.id)

    return NextResponse.json<CheckoutResponse>({ ok: true, orderId: order.id, clientSecret: intent.client_secret!, totals })
  } catch (e) {
    console.error("checkout", e)
    // Don't leave an orphan order behind if Stripe failed before the intent existed.
    if (createdOrderId) await db.from("orders").delete().eq("id", createdOrderId).is("stripe_payment_intent_id", null)
    return fail(502, { error: "Payment could not be initialised. Please try again in a moment." })
  }
}
