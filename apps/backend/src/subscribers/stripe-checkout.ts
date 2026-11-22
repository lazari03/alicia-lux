import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import type { ProviderWebhookPayload } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, PaymentWebhookEvents } from "@medusajs/framework/utils"
import Stripe from "stripe"
import { readHostedSecrets } from "../modules/stripe-hosted/service"
import { finishStripeCheckout } from "../workflows/finish-stripe-checkout"

export default async function stripeCheckout({ event, container }: SubscriberArgs<ProviderWebhookPayload>) {
  if (event.data.provider !== "stripe-hosted_stripe-hosted") return
  const { rawData, headers } = event.data.payload
  const signature = headers["stripe-signature"]
  if (typeof signature !== "string") return
  const secrets = readHostedSecrets()
  const stripe = new Stripe(secrets.STRIPE_API_KEY)
  const body = typeof rawData === "string" ? rawData : Buffer.from(rawData as Uint8Array)
  const verified = stripe.webhooks.constructEvent(body, signature, secrets.STRIPE_WEBHOOK_SECRET)
  if (verified.type !== "checkout.session.completed") return
  const session = verified.data.object
  const paymentId = session.metadata?.medusa_payment_session_id
  if (session.metadata?.direct_checkout !== "true" || !paymentId) return

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [payment] } = await query.graph({
    entity: "payment_session",
    fields: ["payment_collection_id"],
    filters: { id: paymentId },
  })
  if (!payment) return
  const { data: [link] } = await query.graph({
    entity: "cart_payment_collection",
    fields: ["cart_id"],
    filters: { payment_collection_id: payment.payment_collection_id },
  })
  if (link) {
    await finishStripeCheckout(container, link.cart_id, await stripe.checkout.sessions.retrieve(session.id))
  }
}

export const config: SubscriberConfig = {
  event: PaymentWebhookEvents.WebhookReceived,
  context: { subscriberId: "alicia-stripe-checkout" },
}
