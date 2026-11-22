import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"
import { hostedProviderId, sekMinorUnits } from "../modules/stripe-hosted/service"

completeCartWorkflow.hooks.validate(async ({ cart }) => {
  const session = cart.payment_collection?.payment_sessions?.find(
    (session) => session.provider_id === hostedProviderId && session.status !== "canceled"
  )
  if (session && (
    cart.currency_code !== "sek" ||
    sekMinorUnits(cart.total) !== session.data?.amount_minor ||
    !cart.email ||
    cart.shipping_address?.country_code !== "se" ||
    !cart.shipping_address.address_1 ||
    !cart.billing_address?.address_1 ||
    !cart.shipping_methods?.length
  )) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "The cart changed. Review your details and restart Stripe Checkout.")
  }
})
