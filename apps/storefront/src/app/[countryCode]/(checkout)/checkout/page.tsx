import { Metadata } from "next"
import { redirect } from "next/navigation"

import { retrieveCheckoutCart } from "@lib/data/checkout"
import { retrieveCustomer } from "@lib/data/customer"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { getCheckoutStep } from "@lib/util/checkout-step"
import CheckoutFlow from "@modules/checkout/components/checkout-flow"
import OrderSummary from "@modules/checkout/components/order-summary"

export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default async function Checkout({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const cart = await retrieveCheckoutCart()
  if (!cart?.items?.length) redirect(`/${countryCode}/cart`)

  const [shippingOptions, customer] = await Promise.all([
    listCartShippingMethods(cart.id),
    retrieveCustomer().catch(() => null),
  ])

  return (
    <div className="content-container lux-checkout">
      <OrderSummary cart={cart} variant="mobile" />
      <div className="lux-checkout-main">
        <CheckoutFlow
          cart={cart}
          initialStep={getCheckoutStep(cart)}
          shippingOptions={shippingOptions ?? []}
          customerEmail={customer?.email}
          countryCode={countryCode}
        />
      </div>
      <aside className="lux-checkout-aside" aria-label="Order summary">
        <OrderSummary cart={cart} variant="desktop" />
      </aside>
    </div>
  )
}
