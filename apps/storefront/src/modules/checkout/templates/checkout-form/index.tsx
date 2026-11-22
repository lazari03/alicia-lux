import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { hostedStripeProvider } from "@lib/util/checkout-step"
import HostedCheckout from "@modules/checkout/components/hosted-checkout"
import { HttpTypes } from "@medusajs/types"
import SignInForm from "@modules/account/components/sign-in-form"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
  step,
  showSignIn,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  step: "address" | "delivery" | "payment" | "review"
  showSignIn: boolean
}) {
  if (!cart) {
    return null
  }

  const [shippingMethods, paymentMethods] = await Promise.all([
    step === "delivery" ? listCartShippingMethods(cart.id) : [],
    step === "payment" && cart.region_id ? listCartPaymentMethods(cart.region_id) : [],
  ])

  return (
    <div className="lux-checkout-form">
      {!customer && (
        <div className="lux-guest-panel">
          <p className="font-medium">Guest checkout</p>
          <p className="mt-1 text-sm text-ui-fg-subtle">Enter your details below to continue without an account.</p>
          <details className="mt-3" open={showSignIn}>
            <summary className="cursor-pointer text-sm underline underline-offset-4">Already have an account? Sign in</summary>
            <SignInForm />
          </details>
        </div>
      )}
      <Addresses cart={cart} customer={customer} />

      {step === "delivery" && !shippingMethods?.length && (
        <p role="alert">Delivery options are unavailable for this address. Check your shipping address and try again.</p>
      )}
      <Shipping cart={cart} availableShippingMethods={shippingMethods ?? []} />

      {step === "payment" && !paymentMethods?.length && (
        <p role="alert">Payment options are unavailable. Refresh the page to try again.</p>
      )}
      {paymentMethods?.some(({ id }) => id === hostedStripeProvider) ? (
        <section className="space-y-3" aria-labelledby="stripe-payment-title">
          <h2 id="stripe-payment-title" className="text-xl font-medium">Payment</h2>
          <p className="text-sm text-ui-fg-subtle">You’ll enter your payment details on Stripe’s secure checkout page.</p>
          <HostedCheckout />
        </section>
      ) : (
        <Payment cart={cart} availablePaymentMethods={paymentMethods ?? []} />
      )}

      <Review cart={cart} />
    </div>
  )
}
