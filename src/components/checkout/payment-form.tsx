"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js"
import { Lock } from "lucide-react"
import { useEffect, useState } from "react"
import type { Customer } from "@/lib/checkout"
import { formatPrice } from "@/lib/money"
import { Notice } from "@/components/ui/notice"

let stripePromise: Promise<Stripe | null> | null = null
const getStripe = (key: string) => (stripePromise ??= loadStripe(key))

const appearance: Appearance = {
  theme: "flat",
  variables: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontSizeBase: "16px",
    colorPrimary: "#1f1915",
    colorText: "#1f1915",
    colorTextSecondary: "#6f6258",
    colorBackground: "#ffffff",
    colorDanger: "#9b2c2c",
    borderRadius: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #e2d9ce", boxShadow: "none", padding: "14px" },
    ".Input:focus": { border: "1px solid #a88a5f", boxShadow: "0 0 0 3px rgba(168,138,95,.16)" },
    ".AccordionItem": { border: "1px solid #e2d9ce", boxShadow: "none" },
    ".Label": { color: "#6f6258" },
  },
}

type Props = { publishableKey: string; clientSecret: string; orderId: string; total: number; customer: Customer; stale: boolean }

export function PaymentForm(props: Props) {
  return (
    <Elements stripe={getStripe(props.publishableKey)} options={{ clientSecret: props.clientSecret, appearance, loader: "never" }}>
      <Inner {...props} />
    </Elements>
  )
}

function Inner({ orderId, total, customer, stale }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pick up amount changes made server-side to the same PaymentIntent.
  useEffect(() => {
    if (!stale && elements) elements.fetchUpdates().catch(() => {})
  }, [stale, total, elements])

  const pay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || busy || stale) return
    setBusy(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? "Check your payment details.")
      setBusy(false)
      return
    }

    const returnUrl = `${window.location.origin}/checkout/success?order=${orderId}`
    const { error: payError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: returnUrl,
        payment_method_data: {
          billing_details: {
            name: `${customer.firstName} ${customer.lastName}`,
            email: customer.email,
            phone: customer.phone || "",
            address: { line1: customer.address1, line2: customer.address2 || "", postal_code: customer.postalCode, city: customer.city, country: "SE", state: "" },
          },
        },
      },
    })

    if (paymentIntent && ["succeeded", "processing", "requires_capture"].includes(paymentIntent.status)) {
      router.push(`/checkout/success?order=${orderId}&payment_intent=${paymentIntent.id}`)
      return
    }
    setError(payError?.message ?? "Your payment could not be completed. Please try another method.")
    setBusy(false)
  }

  return (
    <form onSubmit={pay} className="grid gap-5">
      <div className="relative min-h-[180px]">
        {!ready && <div className="skeleton absolute inset-0" aria-hidden />}
        <div className={ready ? "opacity-100 transition-opacity duration-500" : "opacity-0"}>
          <PaymentElement
            onReady={() => setReady(true)}
            options={{
              layout: { type: "accordion", defaultCollapsed: false, radios: "always", spacedAccordionItems: true },
              fields: { billingDetails: { name: "never", email: "never", phone: "never", address: "never" } },
              business: { name: "Alicia Lux" },
            }}
          />
        </div>
      </div>
      {error && <Notice>{error}</Notice>}
      <button type="submit" disabled={!stripe || !ready || busy || stale} className="btn btn-primary min-h-[58px] w-full text-[13px]" data-testid="pay-button">
        {busy ? "Processing…" : stale ? "Updating total…" : <>Pay {formatPrice(total)} <Lock className="size-4" strokeWidth={1.5} /></>}
      </button>
      <p className="text-xs leading-relaxed text-muted">
        By placing your order you agree to our <Link href="/policies/terms" className="text-ink underline underline-offset-4">terms</Link> and{" "}
        <Link href="/policies/privacy" className="text-ink underline underline-offset-4">privacy policy</Link>. Card details go directly to Stripe and are never stored by Alicia Lux.
      </p>
    </form>
  )
}
