import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import Stripe from "stripe"
import { hostedProviderId, readHostedSecrets } from "../../../../../modules/stripe-hosted/service"
import { finishStripeCheckout } from "../../../../../workflows/finish-stripe-checkout"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const session_id = (req.body as { session_id?: string } | undefined)?.session_id
  if (typeof session_id !== "string" || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(session_id)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid Stripe session.")
  }
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [cart] } = await query.graph({
    entity: "cart",
    fields: ["payment_collection.payment_sessions.*"],
    filters: { id: req.params.id },
  })
  if (!cart?.payment_collection?.payment_sessions?.some(
    (payment) => payment?.provider_id === hostedProviderId && payment.data?.stripe_checkout_id === session_id
  )) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe session does not match this cart.")
  }
  const stripe = new Stripe(readHostedSecrets().STRIPE_API_KEY)
  const session = await stripe.checkout.sessions.retrieve(session_id)
  await finishStripeCheckout(req.scope, req.params.id, session)
  res.json({ confirmed: true })
}
