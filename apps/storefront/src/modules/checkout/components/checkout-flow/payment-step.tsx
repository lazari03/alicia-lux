"use client"

import { HttpTypes } from "@medusajs/types"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe, type Appearance } from "@stripe/stripe-js"
import { useEffect, useState, useTransition } from "react"

import { completeCheckout, preparePayment, type PaymentSetup } from "@lib/data/checkout"
import { startHostedCheckout } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Notice } from "./fields"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_KEY
// Load Stripe.js once per page lifetime, and only when a key is configured.
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

const appearance: Appearance = {
  theme: "flat",
  variables: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontSizeBase: "16px",
    colorPrimary: "#2b211b",
    colorText: "#2b211b",
    colorTextSecondary: "#6f6258",
    colorBackground: "#ffffff",
    colorDanger: "#9b2c2c",
    borderRadius: "4px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #e2d9ce", boxShadow: "none", padding: "14px" },
    ".Input:focus": { border: "1px solid #a88a5f", boxShadow: "0 0 0 3px rgba(168,138,95,.15)" },
    ".AccordionItem": { border: "1px solid #e2d9ce", boxShadow: "none" },
    ".Label": { fontSize: "13px", color: "#6f6258" },
  },
}

export default function PaymentStep({ cart, countryCode }: { cart: HttpTypes.StoreCart; countryCode: string }) {
  const [setup, setSetup] = useState<PaymentSetup | null>(null)
  const [loading, start] = useTransition()

  // Re-prepare whenever the payable total changes (promo code, delivery…).
  const total = cart.total
  const deliveryId = cart.shipping_methods?.[0]?.shipping_option_id
  useEffect(() => {
    start(async () => setSetup(await preparePayment()))
  }, [total, deliveryId])

  if (!setup || loading) {
    return <div className="lux-skeleton" aria-busy="true" aria-label="Loading secure payment" />
  }
  if ("error" in setup) {
    return (
      <div className="lux-form">
        <Notice>{setup.error}</Notice>
        <button type="button" className="lux-button lux-button-ghost" onClick={() => start(async () => setSetup(await preparePayment()))}>
          Try again
        </button>
      </div>
    )
  }
  if (setup.mode === "hosted") return <HostedPayment />
  if (!stripePromise) return <Notice>Stripe is not configured (missing NEXT_PUBLIC_STRIPE_KEY).</Notice>

  return (
    <Elements
      key={setup.clientSecret}
      stripe={stripePromise}
      options={{ clientSecret: setup.clientSecret, appearance, loader: "never" }}
    >
      <PaymentForm cart={cart} amount={setup.amount} countryCode={countryCode} />
    </Elements>
  )
}

function PaymentForm({ cart, amount, countryCode }: { cart: HttpTypes.StoreCart; amount: number; countryCode: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const billing = cart.billing_address

  const pay = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!stripe || !elements || submitting) return
    setSubmitting(true)
    setError(null)

    const { error: validation } = await elements.submit()
    if (validation) {
      setError(validation.message ?? "Check your payment details.")
      setSubmitting(false)
      return
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        // Redirect-based methods (Klarna, bank redirects, 3-D Secure fallbacks)
        // come back here; the page verifies the intent and places the order.
        return_url: `${window.location.origin}/${countryCode}/checkout/complete`,
        payment_method_data: {
          billing_details: {
            name: [billing?.first_name, billing?.last_name].filter(Boolean).join(" ") || undefined,
            email: cart.email ?? undefined,
            phone: billing?.phone || cart.shipping_address?.phone || undefined,
            address: {
              line1: billing?.address_1 ?? undefined,
              line2: billing?.address_2 ?? "",
              city: billing?.city ?? undefined,
              postal_code: billing?.postal_code ?? undefined,
              state: billing?.province ?? "",
              country: billing?.country_code?.toUpperCase() ?? undefined,
            },
          },
        },
      },
    })

    // A card error can still carry an intent that succeeded (e.g. double click).
    const intent = paymentIntent ?? stripeError?.payment_intent
    if (intent && (intent.status === "succeeded" || intent.status === "requires_capture")) {
      const message = await completeCheckout(intent.id)
      if (message) setError(message)
      setSubmitting(false)
      return
    }

    setError(stripeError?.message ?? "Your payment could not be completed. Please try another method.")
    setSubmitting(false)
  }

  return (
    <form onSubmit={pay} className="lux-form">
      <div className="lux-payment-element" data-ready={ready || undefined}>
        {!ready && <div className="lux-skeleton" aria-hidden="true" />}
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: { type: "accordion", defaultCollapsed: false, radios: true, spacedAccordionItems: true },
            fields: { billingDetails: { name: "never", email: "never", phone: "auto", address: "never" } },
            wallets: { applePay: "auto", googlePay: "auto" },
            business: { name: "Alicia Lux" },
          }}
        />
      </div>

      {error && <Notice>{error}</Notice>}

      <button
        type="submit"
        className="lux-button lux-button-block lux-pay"
        disabled={!stripe || !ready || submitting}
        aria-busy={submitting}
        data-testid="submit-order-button"
      >
        {submitting ? "Processing…" : `Pay ${convertToLocale({ amount, currency_code: cart.currency_code })}`}
        <span className="lux-lock" aria-hidden="true" />
      </button>
      <p className="lux-hint lux-legal">
        By placing your order you agree to our{" "}
        <LocalizedClientLink href="/policies/terms">terms</LocalizedClientLink> and{" "}
        <LocalizedClientLink href="/policies/privacy">privacy policy</LocalizedClientLink>. Payments are encrypted and
        processed by Stripe — we never see or store your card details.
      </p>
    </form>
  )
}

function HostedPayment() {
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <div className="lux-form">
      <p className="lux-hint">You&apos;ll complete payment securely on Stripe and return here for your confirmation.</p>
      {error && <Notice>{error}</Notice>}
      <button
        type="button"
        className="lux-button lux-button-block"
        disabled={pending}
        onClick={() => start(async () => setError((await startHostedCheckout()) ?? null))}
      >
        {pending ? "Redirecting…" : "Continue to secure payment"}
        <span className="lux-lock" aria-hidden="true" />
      </button>
    </div>
  )
}
