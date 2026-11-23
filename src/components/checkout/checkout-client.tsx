"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown, Lock, Pencil } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { CheckoutResponse, Customer } from "@/lib/checkout"
import { formatPrice, shippingFor, vatPortion } from "@/lib/money"
import type { StoreSettings } from "@/lib/types"
import { useHydrated } from "@/lib/use-hydrated"
import { cn } from "@/lib/utils"
import { cartSubtotal, useCart, type CartLine } from "@/store/cart"
import { Notice } from "@/components/ui/notice"
import { PaymentForm } from "./payment-form"

const ORDER_KEY = "alicia-lux-order"
const DETAILS_KEY = "alicia-lux-details"

type Prepared = { orderId: string; clientSecret: string; totals: Extract<CheckoutResponse, { ok: true }>["totals"]; signature: string }

const emptyCustomer: Customer = { email: "", firstName: "", lastName: "", phone: "", address1: "", address2: "", postalCode: "", city: "" }

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function CheckoutClient({ settings, publishableKey }: { settings: StoreSettings; publishableKey: string }) {
  const hydrated = useHydrated()
  const lines = useCart((s) => s.lines)
  const setQuantity = useCart((s) => s.setQuantity)
  const remove = useCart((s) => s.remove)

  const [customer, setCustomer] = useState<Customer>(emptyCustomer)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [prepared, setPrepared] = useState<Prepared | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"details" | "payment">("details")
  const paymentRef = useRef<HTMLDivElement>(null)

  // Restore details typed earlier in this session.
  useEffect(() => setCustomer(read(DETAILS_KEY, emptyCustomer)), [])
  useEffect(() => {
    try { sessionStorage.setItem(DETAILS_KEY, JSON.stringify(customer)) } catch {}
  }, [customer])

  const signature = useMemo(() => JSON.stringify(lines.map((l) => [l.productId, l.quantity])), [lines])
  const subtotal = cartSubtotal(lines)
  const shipping = prepared?.totals.shipping ?? shippingFor(subtotal, settings)
  const total = prepared && prepared.signature === signature ? prepared.totals.total : subtotal + shipping

  const prepare = useCallback(async () => {
    setLoading(true)
    setFormError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: read<string | null>(ORDER_KEY, null),
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          customer,
        }),
      })
      const data = (await res.json()) as CheckoutResponse
      if (!data.ok) {
        setErrors(data.fieldErrors ?? {})
        setFormError(data.error)
        data.stock?.forEach(({ productId, available }) => (available > 0 ? setQuantity(productId, available) : remove(productId)))
        setStep("details")
        return false
      }
      sessionStorage.setItem(ORDER_KEY, JSON.stringify(data.orderId))
      setErrors({})
      setPrepared({ orderId: data.orderId, clientSecret: data.clientSecret, totals: data.totals, signature })
      return true
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.")
      return false
    } finally {
      setLoading(false)
    }
  }, [customer, lines, signature, setQuantity, remove])

  // Bag changed while the payment form is open → refresh the amount.
  useEffect(() => {
    if (step === "payment" && prepared && prepared.signature !== signature && lines.length) prepare()
  }, [signature, step, prepared, prepare, lines.length])

  const onContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (await prepare()) {
      setStep("payment")
      requestAnimationFrame(() => paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
    }
  }

  if (!hydrated) return <div className="container-lux py-20"><div className="skeleton h-[60vh]" /></div>

  if (!lines.length) {
    return (
      <div className="container-lux grid min-h-[60vh] place-content-center justify-items-center gap-5 py-20 text-center">
        <h1 className="display text-5xl">Your bag is empty</h1>
        <Link href="/shop" className="btn btn-primary">Shop the collection</Link>
      </div>
    )
  }

  const field = (name: keyof Customer, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className={cn("field", props.className)}>
      <input
        name={name}
        placeholder=" "
        value={customer[name] ?? ""}
        onChange={(e) => setCustomer((c) => ({ ...c, [name]: e.target.value }))}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        {...props}
        className={errors[name] ? "!border-danger" : undefined}
      />
      <span>{label}{props.required && " *"}</span>
      {errors[name] && <small id={`${name}-error`} className="mt-1 block text-xs text-danger">{errors[name]}</small>}
    </label>
  )

  return (
    <div className="lg:container-lux lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:py-12">
      <MobileSummary lines={lines} total={total} shipping={shipping} subtotal={subtotal} />

      <div className="px-4 pt-6 pb-16 sm:px-6 lg:px-0 lg:pt-0">
        <h1 className="display mb-8 text-[clamp(36px,5vw,56px)] leading-none">Checkout</h1>

        <Steps step={step} />

        {/* Step 1 — details */}
        <section className="rounded-md border border-line bg-card p-5 sm:p-7">
          <header className="flex items-center justify-between">
            <h2 className="flex items-center gap-3 font-serif text-[26px]">
              <StepDot n={1} done={step === "payment"} /> Contact & delivery
            </h2>
            {step === "payment" && (
              <button type="button" onClick={() => setStep("details")} className="inline-flex min-h-10 items-center gap-1.5 text-[13px] text-muted underline underline-offset-4 hover:text-ink">
                <Pencil className="size-3.5" /> Edit
              </button>
            )}
          </header>

          <AnimatePresence initial={false} mode="wait">
            {step === "details" ? (
              <motion.form
                key="form"
                onSubmit={onContinue}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
                noValidate
              >
                <fieldset className="mt-6 grid gap-2.5">
                  <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Contact</legend>
                  {field("email", "Email", { type: "email", autoComplete: "email", inputMode: "email", required: true })}
                  {field("phone", "Phone (for delivery updates)", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
                </fieldset>
                <fieldset className="mt-7 grid grid-cols-2 gap-2.5">
                  <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">Delivery address</legend>
                  {field("firstName", "First name", { autoComplete: "shipping given-name", required: true })}
                  {field("lastName", "Last name", { autoComplete: "shipping family-name", required: true })}
                  {field("address1", "Street address", { autoComplete: "shipping address-line1", required: true, className: "col-span-2" })}
                  {field("address2", "Apartment, c/o (optional)", { autoComplete: "shipping address-line2", className: "col-span-2" })}
                  {field("postalCode", "Postal code", { autoComplete: "shipping postal-code", inputMode: "numeric", required: true })}
                  {field("city", "City", { autoComplete: "shipping address-level2", required: true })}
                  <p className="col-span-2 flex min-h-12 items-center justify-between rounded-[4px] border border-dashed border-line px-3.5 text-[15px]">
                    <span className="text-[13px] text-muted">Country</span> Sweden
                  </p>
                </fieldset>
                {formError && <Notice>{formError}</Notice>}
                <button type="submit" disabled={loading} className="btn btn-primary mt-7 w-full">
                  {loading ? "Preparing secure payment…" : "Continue to payment"}
                </button>
              </motion.form>
            ) : (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 ml-10 grid gap-0.5 text-sm text-muted">
                <span>{customer.email}</span>
                <span>{customer.firstName} {customer.lastName}, {customer.address1}{customer.address2 ? `, ${customer.address2}` : ""}, {customer.postalCode} {customer.city}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Step 2 — payment */}
        <section ref={paymentRef} className={cn("mt-3 scroll-mt-24 rounded-md border border-line bg-card p-5 transition-opacity sm:p-7", step !== "payment" && "opacity-55")}>
          <h2 className="flex items-center gap-3 font-serif text-[26px]"><StepDot n={2} active={step === "payment"} /> Payment</h2>
          {step === "payment" && prepared && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mt-6">
              {publishableKey ? (
                <PaymentForm
                  key={prepared.clientSecret}
                  publishableKey={publishableKey}
                  clientSecret={prepared.clientSecret}
                  orderId={prepared.orderId}
                  total={prepared.totals.total}
                  customer={customer}
                  stale={prepared.signature !== signature || loading}
                />
              ) : (
                <Notice>Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</Notice>
              )}
            </motion.div>
          )}
        </section>
      </div>

      <aside className="hidden lg:block" aria-label="Order summary">
        <div className="sticky top-24 rounded-md bg-surface p-8">
          <h2 className="mb-6 font-serif text-[28px]">Your order</h2>
          <SummaryBody lines={lines} subtotal={subtotal} shipping={shipping} total={total} />
        </div>
      </aside>
    </div>
  )
}

function Steps({ step }: { step: "details" | "payment" }) {
  return (
    <ol className="mb-6 flex gap-1.5" aria-label="Checkout progress">
      {["Details", "Payment"].map((label, i) => {
        const state = i === 0 ? (step === "details" ? "current" : "done") : step === "payment" ? "current" : "todo"
        return (
          <li key={label} className={cn("flex-1 border-t-2 pt-2.5 text-[11px] uppercase tracking-[0.14em] transition-colors", state === "current" ? "border-ink font-medium text-ink" : state === "done" ? "border-gold text-ink" : "border-line text-muted")}>
            {label}
          </li>
        )
      })}
    </ol>
  )
}

function StepDot({ n, done, active = !done }: { n: number; done?: boolean; active?: boolean }) {
  return (
    <span className={cn("grid size-7 place-items-center rounded-full border font-sans text-xs transition-colors", done ? "border-gold bg-gold text-white" : active ? "border-ink bg-ink text-paper" : "border-line-strong")}>
      {done ? "✓" : n}
    </span>
  )
}

function SummaryBody({ lines, subtotal, shipping, total }: { lines: CartLine[]; subtotal: number; shipping: number; total: number }) {
  return (
    <div className="grid gap-5">
      <ul className="grid gap-4">
        {lines.map((l) => (
          <li key={l.productId} className="grid grid-cols-[64px_1fr_auto] items-center gap-3.5">
            <div className="relative aspect-[4/5] rounded-[4px] border border-line bg-card">
              {l.image && <Image src={l.image} alt="" fill sizes="64px" className="rounded-[4px] object-cover" />}
              <span className="absolute -top-2 -right-2 z-10 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-ink px-1.5 text-[11px] text-paper">{l.quantity}</span>
            </div>
            <div className="min-w-0">
              <p className="font-serif text-lg leading-tight">{l.name}</p>
              {l.subtitle && <p className="text-[13px] text-muted">{l.subtitle}</p>}
            </div>
            <p className="text-sm whitespace-nowrap">{formatPrice(l.priceOre * l.quantity)}</p>
          </li>
        ))}
      </ul>
      <dl className="grid gap-2.5 border-t border-line-strong pt-5 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{shipping ? formatPrice(shipping) : "Free"}</dd></div>
        <div className="mt-1.5 flex items-baseline justify-between border-t border-line-strong pt-3.5">
          <dt className="text-base">Total</dt>
          <dd className="font-serif text-[28px]"><small className="mr-1 font-sans text-[11px] tracking-[0.1em] text-muted">SEK</small>{formatPrice(total)}</dd>
        </div>
        <p className="text-right text-xs text-muted">Including {formatPrice(vatPortion(total))} VAT</p>
      </dl>
      <p className="flex items-center gap-2 border-t border-line-strong pt-4 text-[13px] text-muted"><Lock className="size-3.5" /> Secure payment processed by Stripe</p>
    </div>
  )
}

function MobileSummary(props: { lines: CartLine[]; subtotal: number; shipping: number; total: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="sticky top-0 z-20 border-b border-line bg-surface lg:hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex min-h-14 w-full items-center justify-between px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 text-sm text-gold-deep">
          {open ? "Hide" : "Show"} order summary <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
        </span>
        <strong className="font-serif text-[22px] font-normal">{formatPrice(props.total)}</strong>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="max-h-[70dvh] overflow-y-auto px-4 pb-5 sm:px-6"><SummaryBody {...props} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
