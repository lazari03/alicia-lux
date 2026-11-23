import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { serviceClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

/**
 * Stripe → Supabase. Subscribe to: payment_intent.succeeded, charge.refunded.
 * Handlers are idempotent, so Stripe retries are safe.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!secret || !signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const db = serviceClient()

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object
      const { error } = await db.rpc("complete_order", { p_payment_intent: intent.id, p_amount: intent.amount_received })
      if (error) {
        console.error("complete_order", intent.id, error.message)
        // Unknown intents (e.g. created in the Stripe dashboard) are acknowledged, not retried forever.
        if (!error.message.includes("No order")) return NextResponse.json({ error: "Retry" }, { status: 500 })
      }
      break
    }
    case "charge.refunded": {
      const charge = event.data.object
      const intentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id
      if (intentId && charge.amount_refunded >= charge.amount) {
        await db.from("orders").update({ status: "refunded" }).eq("stripe_payment_intent_id", intentId).in("status", ["paid", "fulfilled", "cancelled"])
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
