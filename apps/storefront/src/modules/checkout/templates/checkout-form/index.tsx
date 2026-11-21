import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
  step,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  step: "address" | "delivery" | "payment" | "review"
}) {
  if (!cart) {
    return null
  }

  const [shippingMethods, paymentMethods] = await Promise.all([
    step === "delivery" ? listCartShippingMethods(cart.id) : [],
    step === "payment" && cart.region_id ? listCartPaymentMethods(cart.region_id) : [],
  ])

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      {!customer && <p className="text-sm text-ui-fg-subtle">Guest checkout. No account required.</p>}
      <Addresses cart={cart} customer={customer} />

      {step === "delivery" && !shippingMethods?.length && (
        <p role="alert">Delivery options are unavailable for this address. Check your shipping address and try again.</p>
      )}
      <Shipping cart={cart} availableShippingMethods={shippingMethods ?? []} />

      {step === "payment" && !paymentMethods?.length && (
        <p role="alert">Payment options are unavailable. Refresh the page to try again.</p>
      )}
      <Payment cart={cart} availablePaymentMethods={paymentMethods ?? []} />

      <Review cart={cart} />
    </div>
  )
}
