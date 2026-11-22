import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getCheckoutStep } from "@lib/util/checkout-step"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ step?: string; signIn?: string }>
}) {
  const [cart, { countryCode }, { step, signIn }] = await Promise.all([
    retrieveCart(),
    params,
    searchParams,
  ])

  if (!cart?.items?.length) {
    redirect(`/${countryCode}/cart`)
  }

  const checkoutStep = getCheckoutStep(cart, step)
  if (checkoutStep !== step) {
    redirect(`/${countryCode}/checkout?step=${checkoutStep}${signIn === "1" ? "&signIn=1" : ""}`)
  }

  const customer = await retrieveCustomer()

  return (
    <div className="content-container lux-checkout-grid">
      <div className="min-w-0">
        <h1 className="lux-checkout-title mb-5">Checkout</h1>
        <PaymentWrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} step={checkoutStep} showSignIn={signIn === "1"} />
        </PaymentWrapper>
      </div>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
