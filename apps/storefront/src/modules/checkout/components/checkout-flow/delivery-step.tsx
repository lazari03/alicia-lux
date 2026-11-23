"use client"

import { HttpTypes } from "@medusajs/types"
import { useOptimistic, useState, useTransition } from "react"

import { selectDeliveryOption } from "@lib/data/checkout"
import { convertToLocale } from "@lib/util/money"
import { Notice } from "./fields"

export default function DeliveryStep({
  cart,
  options,
  onDone,
}: {
  cart: HttpTypes.StoreCart
  options: HttpTypes.StoreCartShippingOption[]
  onDone: () => void
}) {
  const current = cart.shipping_methods?.[0]?.shipping_option_id
  const [selected, setSelected] = useOptimistic(current)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const choose = (id: string) =>
    start(async () => {
      setError(null)
      setSelected(id)
      const result = await selectDeliveryOption(id)
      if (result && "error" in result) setError(result.error)
    })

  if (!options.length) {
    return <Notice>No delivery options are available for this address. Please check your address or contact us.</Notice>
  }

  const sorted = [...options].sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0))

  return (
    <div className="lux-form">
      <div role="radiogroup" aria-label="Delivery method" className="lux-choices" aria-busy={pending}>
        {sorted.map((option) => {
          const checked = selected === option.id
          const free = !option.amount
          return (
            <label key={option.id} className="lux-choice" data-checked={checked || undefined}>
              <input
                type="radio"
                name="delivery"
                value={option.id}
                checked={checked}
                disabled={pending}
                onChange={() => choose(option.id)}
              />
              <span className="lux-choice-dot" aria-hidden="true" />
              <span className="lux-choice-label">{option.name}</span>
              <span className="lux-choice-price">
                {free ? "Free" : convertToLocale({ amount: option.amount ?? 0, currency_code: cart.currency_code })}
              </span>
            </label>
          )
        })}
      </div>
      {error && <Notice>{error}</Notice>}
      <button
        type="button"
        className="lux-button lux-button-block"
        disabled={!selected || pending}
        aria-busy={pending}
        onClick={onDone}
      >
        {pending ? "Updating…" : "Continue to payment"}
        <span className="lux-arrow" aria-hidden="true" />
      </button>
    </div>
  )
}
