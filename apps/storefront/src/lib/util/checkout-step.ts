import type { HttpTypes } from "@medusajs/types"

/** Medusa's native Stripe provider — powers the on-site Payment Element. */
export const stripeProvider = "pp_stripe_stripe"
/** Legacy redirect-to-Stripe provider, kept as a fallback during migration. */
export const hostedStripeProvider = "pp_stripe-hosted_stripe-hosted"

export type CheckoutStep = "details" | "delivery" | "payment"

export function getCheckoutStep(cart: HttpTypes.StoreCart): CheckoutStep {
  if (!cart.email || !cart.shipping_address?.address_1 || !cart.billing_address?.address_1) {
    return "details"
  }
  if (!cart.shipping_methods?.length) return "delivery"
  return "payment"
}
