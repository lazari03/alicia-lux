import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

import { convertToLocale } from "@lib/util/money"
import DiscountCode from "@modules/checkout/components/discount-code"

type Props = {
  cart: HttpTypes.StoreCart
  variant: "mobile" | "desktop"
}

function Totals({ cart }: { cart: HttpTypes.StoreCart }) {
  const money = (amount?: number | null) =>
    convertToLocale({ amount: amount ?? 0, currency_code: cart.currency_code })

  return (
    <div className="grid gap-2">
      <dl className="lux-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{money(cart.item_subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>
            {cart.shipping_methods?.length
              ? cart.shipping_subtotal
                ? money(cart.shipping_subtotal)
                : "Free"
              : "Next step"}
          </dd>
        </div>
        {!!cart.discount_total && (
          <div className="lux-totals-discount">
            <dt>Discount</dt>
            <dd>−{money(cart.discount_total)}</dd>
          </div>
        )}
        <div className="lux-totals-total">
          <dt>Total</dt>
          <dd data-testid="checkout-total">
            <small>{cart.currency_code.toUpperCase()}</small>{" "}
            {money(cart.total)}
          </dd>
        </div>
      </dl>
      {!!cart.tax_total && (
        <p className="lux-totals-note">Including {money(cart.tax_total)} VAT</p>
      )}
    </div>
  )
}

function Body({ cart }: { cart: HttpTypes.StoreCart }) {
  const items = [...(cart.items ?? [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  return (
    <>
      <ul className="lux-summary-items">
        {items.map((item) => (
          <li key={item.id}>
            <div className="lux-summary-thumb">
              {item.thumbnail && (
                <Image
                  src={item.thumbnail}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
              <span aria-label={`Quantity ${item.quantity}`}>
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0">
              <p className="lux-summary-title">{item.product_title}</p>
              {item.variant_title &&
                item.variant_title !== "Default variant" && (
                  <p className="lux-summary-variant">{item.variant_title}</p>
                )}
            </div>
            <p className="lux-summary-price">
              {convertToLocale({
                amount: item.total ?? 0,
                currency_code: cart.currency_code,
              })}
            </p>
          </li>
        ))}
      </ul>
      <DiscountCode cart={cart as any} />
      <Totals cart={cart} />
    </>
  )
}

export default function OrderSummary({ cart, variant }: Props) {
  if (variant === "mobile") {
    return (
      <details className="lux-summary-mobile">
        <summary>
          <span className="lux-summary-toggle">
            <span
              className="lux-summary-toggle-label"
              data-open="Hide order summary"
              data-closed="Show order summary"
            />
            <span className="lux-sort-chevron" aria-hidden="true" />
          </span>
          <strong>
            {convertToLocale({
              amount: cart.total ?? 0,
              currency_code: cart.currency_code,
            })}
          </strong>
        </summary>
        <div className="lux-summary-mobile-body">
          <Body cart={cart} />
        </div>
      </details>
    )
  }

  return (
    <div className="lux-summary">
      <h2 className="lux-summary-heading">Your order</h2>
      <Body cart={cart} />
      <ul className="lux-assurances">
        <li>Secure payment processed by Stripe</li>
        <li>Delivery within Sweden</li>
        <li>14-day right of withdrawal</li>
      </ul>
    </div>
  )
}
