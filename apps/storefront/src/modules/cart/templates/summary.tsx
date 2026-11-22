import { Heading } from "@medusajs/ui"

import HostedCheckout from "@modules/checkout/components/hosted-checkout"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const Summary = ({ cart }: SummaryProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <HostedCheckout />
      <p className="text-sm text-ui-fg-subtle">Enter your delivery and billing details securely on Stripe. Delivery is available within Sweden.</p>
    </div>
  )
}

export default Summary
