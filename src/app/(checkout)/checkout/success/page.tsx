import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, Clock } from "lucide-react"
import { ClearCart } from "@/components/checkout/clear-cart"
import { formatPrice } from "@/lib/money"
import { stripe } from "@/lib/stripe"
import { serviceClient } from "@/lib/supabase/admin"
import type { Order, OrderItem } from "@/lib/types"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Thank you", robots: { index: false } }

type Props = { searchParams: Promise<{ order?: string; payment_intent?: string }> }

/**
 * Requires both the order id and its PaymentIntent id, so confirmations
 * can't be browsed by guessing. If the webhook hasn't arrived yet, this page
 * completes the order itself (complete_order is idempotent).
 */
export default async function SuccessPage({ searchParams }: Props) {
  const { order: orderId, payment_intent: intentId } = await searchParams
  const valid = orderId && /^[0-9a-f-]{36}$/i.test(orderId) && intentId && /^pi_[A-Za-z0-9]+$/.test(intentId)
  if (!valid) return <Problem title="We couldn’t find that order" />

  const db = serviceClient()
  const { data } = await db.from("orders").select("*, order_items(*)").eq("id", orderId).maybeSingle()
  const order = data as (Order & { order_items: OrderItem[] }) | null
  if (!order || order.stripe_payment_intent_id !== intentId) return <Problem title="We couldn’t find that order" />

  let status = order.status
  if (status === "pending") {
    const intent = await stripe().paymentIntents.retrieve(intentId).catch(() => null)
    if (intent?.status === "succeeded") {
      const { error } = await db.rpc("complete_order", { p_payment_intent: intentId, p_amount: intent.amount_received })
      if (!error) status = "paid"
    } else if (intent?.status === "requires_payment_method" || intent?.status === "canceled") {
      return <Problem title="Your payment didn’t go through" body="You have not been charged. Please try again or use another payment method." retry />
    }
  }
  const paid = status !== "pending"

  return (
    <div className="container-lux max-w-3xl py-[clamp(44px,8vw,104px)]">
      {paid && <ClearCart />}
      <div className="text-center">
        {paid ? (
          <CheckCircle2 className="mx-auto mb-5 size-12 text-gold" strokeWidth={1} />
        ) : (
          <Clock className="mx-auto mb-5 size-12 text-gold" strokeWidth={1} />
        )}
        <p className="eyebrow mb-3">Order #{order.order_number}</p>
        <h1 className="display text-[clamp(40px,6vw,72px)] leading-none">
          {paid ? <>Thank you, <em className="text-gold-deep">{order.first_name}.</em></> : "Payment processing"}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          {paid
            ? `Your order is confirmed. A receipt is on its way to ${order.email}. We’ll let you know when it ships.`
            : "Your bank is still confirming the payment. You’ll receive an email as soon as it’s complete — there’s no need to pay again."}
        </p>
      </div>

      <div className="mt-12 rounded-md border border-line bg-card p-6 sm:p-8">
        <ul className="grid gap-4">
          {order.order_items.map((item) => (
            <li key={item.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-surface">
                {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div>
                <p className="font-serif text-lg leading-tight">{item.name}</p>
                <p className="text-[13px] text-muted">Qty {item.quantity}</p>
              </div>
              <p className="text-sm">{formatPrice(item.unit_price_ore * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 grid gap-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal_ore)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.shipping_ore ? formatPrice(order.shipping_ore) : "Free"}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base"><dt>Total</dt><dd className="font-serif text-2xl">{formatPrice(order.total_ore)}</dd></div>
          <p className="text-right text-xs text-muted">Including {formatPrice(order.vat_ore)} VAT</p>
        </dl>
        <div className="mt-6 border-t border-line pt-5 text-sm">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Delivering to</p>
          <p>{order.first_name} {order.last_name}</p>
          <p className="text-muted">{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ""}, {order.postal_code} {order.city}</p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop" className="btn btn-ghost">Continue shopping</Link>
      </div>
    </div>
  )
}

function Problem({ title, body, retry }: { title: string; body?: string; retry?: boolean }) {
  return (
    <div className="container-lux grid min-h-[60vh] place-content-center justify-items-center gap-5 py-20 text-center">
      <h1 className="display text-[clamp(36px,5vw,60px)] leading-none">{title}</h1>
      {body && <p className="max-w-md text-muted">{body}</p>}
      <Link href={retry ? "/checkout" : "/shop"} className="btn btn-primary">{retry ? "Return to checkout" : "Go to the shop"}</Link>
    </div>
  )
}
