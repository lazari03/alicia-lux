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
  searchParams: Promise<{ step?: string }>
}) {
  const [cart, { countryCode }, { step }] = await Promise.all([
    retrieveCart(),
    params,
    searchParams,
  ])

  if (!cart?.items?.length) {
    redirect(`/${countryCode}/cart`)
  }

  const checkoutStep = getCheckoutStep(cart, step)
  if (checkoutStep !== step) {
    redirect(`/${countryCode}/checkout?step=${checkoutStep}`)
  }

  const customer = await retrieveCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} step={checkoutStep} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
