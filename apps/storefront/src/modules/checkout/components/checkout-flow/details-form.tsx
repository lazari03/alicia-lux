"use client"

import { HttpTypes } from "@medusajs/types"
import { useActionState, useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"

import { saveCheckoutDetails, type ActionResult } from "@lib/data/checkout"
import { Field, Notice } from "./fields"

type Address = HttpTypes.StoreCartAddress | null | undefined

const countryName = (iso: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(iso.toUpperCase()) ?? iso.toUpperCase()
  } catch {
    return iso.toUpperCase()
  }
}

function AddressFields({
  prefix,
  address,
  countries,
  section,
}: {
  prefix: "shipping" | "billing"
  address: Address
  countries: string[]
  section: "shipping" | "billing"
}) {
  const ac = (token: string) => `section-${section} ${section} ${token}`
  return (
    <div className="lux-fields">
      <Field name={`${prefix}.first_name`} label="First name" autoComplete={ac("given-name")} defaultValue={address?.first_name ?? ""} required half />
      <Field name={`${prefix}.last_name`} label="Last name" autoComplete={ac("family-name")} defaultValue={address?.last_name ?? ""} required half />
      <Field name={`${prefix}.address_1`} label="Street address" autoComplete={ac("address-line1")} defaultValue={address?.address_1 ?? ""} required />
      <Field name={`${prefix}.address_2`} label="Apartment, c/o (optional)" autoComplete={ac("address-line2")} defaultValue={address?.address_2 ?? ""} />
      <Field
        name={`${prefix}.postal_code`}
        label="Postal code"
        autoComplete={ac("postal-code")}
        inputMode="numeric"
        defaultValue={address?.postal_code ?? ""}
        required
        half
      />
      <Field name={`${prefix}.city`} label="City" autoComplete={ac("address-level2")} defaultValue={address?.city ?? ""} required half />
      {countries.length > 1 ? (
        <label className="lux-field lux-field-select">
          <select name={`${prefix}.country_code`} defaultValue={address?.country_code ?? countries[0]} autoComplete={ac("country")}>
            {countries.map((c) => <option key={c} value={c}>{countryName(c)}</option>)}
          </select>
          <span>Country</span>
        </label>
      ) : (
        <>
          <input type="hidden" name={`${prefix}.country_code`} value={countries[0] ?? ""} />
          <p className="lux-field-static"><span>Country</span>{countries[0] ? countryName(countries[0]) : "—"}</p>
        </>
      )}
    </div>
  )
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="lux-button lux-button-block" disabled={pending} aria-busy={pending}>
      {pending ? "Saving…" : "Continue to delivery"}
      <span className="lux-arrow" aria-hidden="true" />
    </button>
  )
}

export default function DetailsForm({
  cart,
  customerEmail,
  onDone,
}: {
  cart: HttpTypes.StoreCart
  customerEmail?: string
  onDone: () => void
}) {
  const [state, action] = useActionState(saveCheckoutDetails, null)
  const countries = (cart.region?.countries ?? []).flatMap((c) => (c.iso_2 ? [c.iso_2] : []))
  const shipping = cart.shipping_address
  const billing = cart.billing_address
  const sameInitially =
    !billing?.address_1 ||
    (billing.address_1 === shipping?.address_1 &&
      billing.postal_code === shipping?.postal_code &&
      billing.last_name === shipping?.last_name)
  const [sameAsShipping, setSame] = useState(sameInitially)

  // Each successful submit yields a new state object; advance exactly once per submit.
  const handled = useRef<ActionResult>(null)
  useEffect(() => {
    if (state && "ok" in state && handled.current !== state) {
      handled.current = state
      onDone()
    }
  }, [state, onDone])

  return (
    <form action={action} className="lux-form" noValidate={false}>
      <fieldset>
        <legend>Contact</legend>
        <div className="lux-fields">
          <Field
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            inputMode="email"
            defaultValue={cart.email ?? customerEmail ?? ""}
            required
          />
          <Field
            name="shipping.phone"
            type="tel"
            label="Phone (for delivery updates)"
            autoComplete="section-shipping shipping tel"
            inputMode="tel"
            defaultValue={shipping?.phone ?? ""}
          />
        </div>
        <p className="lux-hint">We&apos;ll send your order confirmation here.</p>
      </fieldset>

      <fieldset>
        <legend>Delivery address</legend>
        <AddressFields prefix="shipping" section="shipping" address={shipping} countries={countries} />
      </fieldset>

      <label className="lux-checkbox">
        <input
          type="checkbox"
          name="billing_same"
          checked={sameAsShipping}
          onChange={(e) => setSame(e.target.checked)}
        />
        <span>Billing address is the same as delivery</span>
      </label>

      {!sameAsShipping && (
        <fieldset className="lux-reveal">
          <legend>Billing address</legend>
          <AddressFields prefix="billing" section="billing" address={billing} countries={countries} />
        </fieldset>
      )}

      {state && "error" in state && <Notice>{state.error}</Notice>}
      <Submit />
    </form>
  )
}
