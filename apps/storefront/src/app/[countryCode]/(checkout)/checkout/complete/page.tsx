import { Metadata } from "next"

import ConfirmPayment from "@modules/checkout/components/checkout-flow/confirm-payment"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = { title: "Confirming your order", robots: { index: false } }

/**
 * Stripe redirects here after redirect-based payment methods. The intent id
 * is verified against the cart's payment session server-side before the
 * order is placed, so a forged URL cannot complete someone else's cart.
 */
export default async function CheckoutComplete({
  searchParams,
}: {
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>
}) {
  const { payment_intent, redirect_status } = await searchParams
  const valid = typeof payment_intent === "string" && /^pi_[A-Za-z0-9]+$/.test(payment_intent)
  const failed = redirect_status === "failed"

  return (
    <section className="content-container lux-confirm">
      {valid && !failed ? (
        <>
          <h1 className="lux-checkout-title">Confirming your order</h1>
          <p className="lux-hint">Please keep this page open — this only takes a moment.</p>
          <ConfirmPayment paymentIntentId={payment_intent} />
        </>
      ) : (
        <>
          <h1 className="lux-checkout-title">Payment not completed</h1>
          <p className="lux-hint">Your payment was cancelled or declined. You have not been charged.</p>
          <LocalizedClientLink href="/checkout" className="lux-button">
            Return to checkout <span className="lux-arrow" aria-hidden="true" />
          </LocalizedClientLink>
        </>
      )}
    </section>
  )
}
