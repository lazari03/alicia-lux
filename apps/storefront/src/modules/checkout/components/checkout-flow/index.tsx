"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"

import type { CheckoutStep } from "@lib/util/checkout-step"
import { convertToLocale } from "@lib/util/money"
import DeliveryStep from "./delivery-step"
import DetailsForm from "./details-form"
import PaymentStep from "./payment-step"

type Props = {
  cart: HttpTypes.StoreCart
  initialStep: CheckoutStep
  shippingOptions: HttpTypes.StoreCartShippingOption[]
  customerEmail?: string
  countryCode: string
}

const order: CheckoutStep[] = ["details", "delivery", "payment"]
const titles: Record<CheckoutStep, string> = {
  details: "Contact & delivery address",
  delivery: "Delivery method",
  payment: "Payment",
}

export default function CheckoutFlow({ cart, initialStep, shippingOptions, customerEmail, countryCode }: Props) {
  // `initialStep` is derived on the server from the cart, so after every
  // successful action (which revalidates the cart) we advance automatically.
  const [active, setActive] = useState<CheckoutStep>(initialStep)
  const completedUpTo = order.indexOf(initialStep)
  const sectionRefs = useRef<Partial<Record<CheckoutStep, HTMLElement | null>>>({})
  const first = useRef(true)
  const [advance, setAdvance] = useState(0)

  // Re-sync with the server-derived step whenever it changes or a step is
  // re-submitted while editing (in which case the step itself may not change).
  useEffect(() => setActive(initialStep), [initialStep, advance])

  // Keep the active step in view on small screens without jumping on load.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = sectionRefs.current[active]
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const top = el.getBoundingClientRect().top + window.scrollY - 76
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" })
  }, [active])

  const address = cart.shipping_address
  const method = cart.shipping_methods?.[0]

  const summaries: Record<CheckoutStep, React.ReactNode> = {
    details: address?.address_1 ? (
      <>
        <span>{cart.email}</span>
        <span>
          {address.first_name} {address.last_name}, {address.address_1}, {address.postal_code} {address.city}
        </span>
      </>
    ) : null,
    delivery: method ? (
      <span>
        {method.name} ·{" "}
        {method.amount ? convertToLocale({ amount: method.amount, currency_code: cart.currency_code }) : "Free"}
      </span>
    ) : null,
    payment: null,
  }

  return (
    <div className="lux-steps">
      <ol className="lux-progress" aria-label="Checkout progress">
        {order.map((step, i) => (
          <li key={step} data-state={step === active ? "current" : i < completedUpTo ? "done" : "todo"}>
            <span>{i + 1}</span>
            {step === "details" ? "Details" : step === "delivery" ? "Delivery" : "Payment"}
          </li>
        ))}
      </ol>

      {order.map((step, i) => {
        const isOpen = active === step
        const reachable = i <= completedUpTo
        const done = i < completedUpTo && !isOpen

        return (
          <section
            key={step}
            ref={(el) => { sectionRefs.current[step] = el }}
            className="lux-step"
            data-open={isOpen || undefined}
            data-done={done || undefined}
            aria-labelledby={`step-${step}`}
          >
            <header className="lux-step-header">
              <h2 id={`step-${step}`}>
                <span className="lux-step-index" aria-hidden="true">{done ? "✓" : i + 1}</span>
                {titles[step]}
              </h2>
              {done && reachable && (
                <button type="button" className="lux-step-edit" onClick={() => setActive(step)}>
                  Edit<span className="sr-only"> {titles[step].toLowerCase()}</span>
                </button>
              )}
            </header>

            {done && summaries[step] && <p className="lux-step-summary">{summaries[step]}</p>}

            <div className="lux-step-body" hidden={!isOpen}>
              {isOpen && step === "details" && (
                <DetailsForm cart={cart} customerEmail={customerEmail} onDone={() => setAdvance((n) => n + 1)} />
              )}
              {isOpen && step === "delivery" && (
                <DeliveryStep cart={cart} options={shippingOptions} onDone={() => setAdvance((n) => n + 1)} />
              )}
              {isOpen && step === "payment" && <PaymentStep cart={cart} countryCode={countryCode} />}
            </div>
          </section>
        )
      })}
    </div>
  )
}
