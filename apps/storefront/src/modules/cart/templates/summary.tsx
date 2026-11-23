import { Heading } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
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
      <LocalizedClientLink href="/checkout" className="lux-button lux-button-block" data-testid="checkout-button">
        Checkout <span className="lux-lock" aria-hidden="true" />
      </LocalizedClientLink>
      <p className="lux-hint">Secure payment by Stripe — card, Apple Pay and Google Pay. Delivery within Sweden.</p>
    </div>
  )
}

export default Summary
