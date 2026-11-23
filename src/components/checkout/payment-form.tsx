"use client"

import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
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

type Props = { publishableKey: string; clientSecret: string; orderId: string; total: number; customer: Customer; stale: boolean; locale: string }

export function PaymentForm(props: Props) {
  return (
    <Elements stripe={getStripe(props.publishableKey)} options={{ clientSecret: props.clientSecret, appearance, loader: "never", locale: props.locale === "en" ? "en" : "sv" }}>
      <Inner {...props} />
    </Elements>
  )
}

function Inner({ orderId, total, customer, stale, locale }: Props) {
  const t = useTranslations("checkout")
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
      setError(submitError.message ?? t("errors.checkDetails"))
      setBusy(false)
      return
    }

    const returnUrl = `${window.location.origin}${locale === "en" ? "/en" : ""}/checkout/success?order=${orderId}`
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
    setError(payError?.message ?? t("errors.paymentFailed"))
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
        {busy ? t("processing") : stale ? t("updatingTotal") : <>{t("pay", { amount: formatPrice(total) })} <Lock className="size-4" strokeWidth={1.5} /></>}
      </button>
      <p className="text-xs leading-relaxed text-muted">
        {t.rich("legal", {
          terms: (c) => <Link href="/policies/terms" className="text-ink underline underline-offset-4">{c}</Link>,
          privacy: (c) => <Link href="/policies/privacy" className="text-ink underline underline-offset-4">{c}</Link>,
        })}
      </p>
    </form>
  )
}
