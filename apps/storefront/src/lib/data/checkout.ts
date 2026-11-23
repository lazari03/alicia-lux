"use server"

import { hostedStripeProvider, stripeProvider } from "@lib/util/checkout-step"
import { HttpTypes } from "@medusajs/types"
import { unstable_rethrow } from "next/navigation"
import {
  initiatePaymentSession,
  placeOrder,
  retrieveCart,
  setShippingMethod,
  updateCart,
} from "./cart"
import { listCartShippingMethods } from "./fulfillment"
import { listCartPaymentMethods } from "./payment"

export type ActionResult = { error: string } | { ok: true } | null

const CHECKOUT_FIELDS =
  "*items, *region, *region.countries, *items.product, *items.variant, *items.thumbnail, +items.total, *promotions, *shipping_methods, *shipping_address, *billing_address, *payment_collection, *payment_collection.payment_sessions"

export async function retrieveCheckoutCart() {
  return retrieveCart(undefined, CHECKOUT_FIELDS)
}

const message = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readAddress(form: FormData, prefix: "shipping" | "billing", allowed: string[]) {
  const value = (field: string) => String(form.get(`${prefix}.${field}`) ?? "").trim()
  const country = (value("country_code") || allowed[0] || "").toLowerCase()

  const address = {
    first_name: value("first_name"),
    last_name: value("last_name"),
    company: value("company"),
    address_1: value("address_1"),
    address_2: value("address_2"),
    postal_code: value("postal_code").replace(/\s+/g, country === "se" ? "" : " "),
    city: value("city"),
    province: value("province"),
    phone: value("phone"),
    country_code: country,
  }

  const missing = (["first_name", "last_name", "address_1", "postal_code", "city"] as const)
    .filter((field) => !address[field])
  if (missing.length) {
    throw new Error(`Complete your ${prefix === "billing" ? "billing" : "delivery"} address to continue.`)
  }
  if (!allowed.includes(country)) {
    throw new Error("We currently deliver to the countries listed in the form only.")
  }
  if (country === "se" && !/^\d{5}$/.test(address.postal_code)) {
    throw new Error("Enter a valid Swedish postal code (5 digits).")
  }
  return address
}

/** Step 1 — contact + delivery address (+ optional separate billing address). */
export async function saveCheckoutDetails(_: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const cart = await retrieveCheckoutCart()
    if (!cart?.items?.length) return { error: "Your bag is empty." }

    const allowed = (cart.region?.countries ?? []).flatMap((c) => (c.iso_2 ? [c.iso_2] : []))
    const email = String(form.get("email") ?? "").trim().toLowerCase()
    if (!EMAIL.test(email)) return { error: "Enter a valid email address." }

    const shipping_address = readAddress(form, "shipping", allowed)
    const billing_address = form.get("billing_same") === "on"
      ? shipping_address
      : readAddress(form, "billing", allowed)

    const updated = await updateCart({ email, shipping_address, billing_address })

    // Pre-select delivery when there is exactly one option, so the shopper
    // goes straight to payment instead of confirming a single choice.
    if (!updated.shipping_methods?.length) {
      const options = (await listCartShippingMethods(updated.id)) ?? []
      if (options.length === 1) {
        await setShippingMethod({ cartId: updated.id, shippingMethodId: options[0].id })
      }
    }
    return { ok: true }
  } catch (error) {
    return { error: message(error, "We couldn't save your details. Please try again.") }
  }
}

/** Step 2 — delivery method. */
export async function selectDeliveryOption(optionId: string): Promise<ActionResult> {
  try {
    const cart = await retrieveCheckoutCart()
    if (!cart) return { error: "Your bag could not be loaded." }
    const options = (await listCartShippingMethods(cart.id)) ?? []
    if (!options.some(({ id }) => id === optionId)) {
      return { error: "This delivery option is no longer available." }
    }
    await setShippingMethod({ cartId: cart.id, shippingMethodId: optionId })
    return { ok: true }
  } catch (error) {
    return { error: message(error, "We couldn't update delivery. Please try again.") }
  }
}

export type PaymentSetup =
  | { mode: "element"; clientSecret: string; amount: number }
  | { mode: "hosted" }
  | { error: string }

/**
 * Step 3 — returns a Stripe PaymentIntent client secret for the *current*
 * cart total. A session is reused only if its amount still matches; any cart
 * change (quantity, delivery, promo code) yields a fresh PaymentIntent so the
 * shopper can never be charged a stale amount.
 */
export async function preparePayment(): Promise<PaymentSetup> {
  try {
    const cart = await retrieveCheckoutCart()
    if (!cart?.items?.length) return { error: "Your bag is empty." }
    if (!cart.email || !cart.shipping_address?.address_1 || !cart.shipping_methods?.length) {
      return { error: "Complete your details and delivery first." }
    }

    const providers = (await listCartPaymentMethods(cart.region_id!)) ?? []
    const hasElement = providers.some(({ id }) => id === stripeProvider) && !!process.env.NEXT_PUBLIC_STRIPE_KEY
    if (!hasElement) {
      return providers.some(({ id }) => id === hostedStripeProvider)
        ? { mode: "hosted" }
        : { error: "Card payments are not available right now. Please contact us." }
    }

    const current = cart.payment_collection?.payment_sessions?.find(
      (s) => s.provider_id === stripeProvider && s.status === "pending"
    )
    const reusable =
      current?.data?.client_secret &&
      Number(current.amount) === Number(cart.total) &&
      Number(cart.payment_collection?.amount) === Number(cart.total)

    let session = reusable ? current : undefined
    if (!session) {
      const { payment_collection } = await initiatePaymentSession(cart, { provider_id: stripeProvider })
      session = payment_collection.payment_sessions?.find((s) => s.provider_id === stripeProvider)
    }

    const clientSecret = session?.data?.client_secret
    if (typeof clientSecret !== "string") return { error: "Payment could not be initialised. Please try again." }
    return { mode: "element", clientSecret, amount: Number(cart.total) }
  } catch (error) {
    return { error: message(error, "Payment could not be initialised. Please try again.") }
  }
}

/**
 * Completes the cart after Stripe confirmed the PaymentIntent. Medusa
 * authorises (and, with `capture: true`, captures) the intent server-side,
 * so the order is only created when Stripe agrees the money is there.
 * Redirects to the confirmation page on success.
 */
export async function completeCheckout(paymentIntentId?: string): Promise<string | null> {
  try {
    const cart = await retrieveCheckoutCart()
    if (!cart) return "Your session expired. If you were charged, check your email for the order confirmation."

    if (paymentIntentId) {
      const matches = cart.payment_collection?.payment_sessions?.some(
        (s) => s.provider_id === stripeProvider && s.data?.id === paymentIntentId
      )
      if (!matches) return "This payment does not match your current bag. Please contact us before paying again."
    }

    await placeOrder(cart.id)
    return null
  } catch (error) {
    unstable_rethrow(error)
    return message(error, "Your payment went through but the order could not be confirmed yet. Please retry.")
  }
}

export type CheckoutShippingOption = HttpTypes.StoreCartShippingOption
