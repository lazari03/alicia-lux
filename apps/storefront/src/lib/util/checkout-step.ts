import type { HttpTypes } from "@medusajs/types"

export const hostedStripeProvider = "pp_stripe-hosted_stripe-hosted"

const steps = ["address", "delivery", "payment", "review"] as const

export function getCheckoutStep(cart: HttpTypes.StoreCart, requested?: string) {
  const next = !cart.email || !cart.shipping_address?.address_1 || !cart.billing_address?.address_1
    ? 0
    : !cart.shipping_methods?.length
      ? 1
      : !cart.payment_collection?.payment_sessions?.some(({ status, provider_id }) => status === "pending" && provider_id !== hostedStripeProvider)
        ? 2
        : 3

  const index = steps.findIndex((step) => step === requested)
  return steps[index >= 0 ? Math.min(index, next) : next]
}
