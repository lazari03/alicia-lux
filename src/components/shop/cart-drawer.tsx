"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { Lock, Minus, Plus, X } from "lucide-react"
import { Drawer } from "@/components/ui/drawer"
import { formatPrice } from "@/lib/money"
import { useHydrated } from "@/lib/use-hydrated"
import { cartSubtotal, useCart } from "@/store/cart"

export function CartDrawer() {
  const hydrated = useHydrated()
  const { lines, open, setOpen, setQuantity, remove } = useCart()
  const subtotal = cartSubtotal(lines)
  const close = () => setOpen(false)

  return (
    <Drawer open={hydrated && open} onClose={close} side="right" label="Shopping bag" className="bg-paper">
      <div className="flex min-h-16 items-center justify-between border-b border-line px-5 sm:px-7">
        <h2 className="font-serif text-[28px]">Your bag</h2>
        <button type="button" onClick={close} aria-label="Close bag" data-autofocus className="grid size-11 place-items-center rounded-full hover:bg-surface">
          <X className="size-5" strokeWidth={1.25} />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="grid flex-1 place-content-center justify-items-center gap-5 px-6 text-center">
          <p className="font-serif text-3xl">Your bag is empty</p>
          <p className="max-w-xs text-sm text-muted">Discover the Signature Collection in Coffee Brown, Champagne and Noir.</p>
          <Link href="/shop" onClick={close} className="btn btn-primary">Shop the collection</Link>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line px-5 sm:px-7">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li
                  key={line.productId}
                  layout
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24, height: 0, paddingBlock: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-[84px_1fr] gap-4 py-5"
                >
                  <Link href={`/product/${line.slug}`} onClick={close} className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-card">
                    {line.image && <Image src={line.image} alt="" fill sizes="84px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/product/${line.slug}`} onClick={close} className="font-serif text-lg leading-tight hover:text-gold-deep">{line.name}</Link>
                        {line.subtitle && <p className="text-[13px] text-muted">{line.subtitle}</p>}
                      </div>
                      <p className="text-sm whitespace-nowrap">{formatPrice(line.priceOre * line.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QuantityStepper
                        value={line.quantity}
                        max={line.maxQuantity}
                        onChange={(q) => setQuantity(line.productId, q)}
                        label={line.name}
                      />
                      <button type="button" onClick={() => remove(line.productId)} className="min-h-10 text-[13px] text-muted underline underline-offset-4 hover:text-ink">
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="sticky bottom-0 grid gap-3 border-t border-line bg-paper px-5 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:px-7">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-serif text-[26px]">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted">Including VAT. Delivery is calculated at checkout.</p>
            <Link href="/checkout" onClick={close} className="btn btn-primary w-full">
              Checkout <Lock className="size-3.5" strokeWidth={1.5} />
            </Link>
            <button type="button" onClick={close} className="btn btn-ghost w-full">Continue shopping</button>
          </div>
        </>
      )}
    </Drawer>
  )
}

export function QuantityStepper({
  value,
  max,
  onChange,
  label,
}: {
  value: number
  max: number
  onChange: (value: number) => void
  label: string
}) {
  const btn = "grid size-10 place-items-center transition-colors hover:bg-surface disabled:opacity-30"
  return (
    <div className="inline-flex items-center rounded-full border border-line" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className={btn + " rounded-l-full"} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={btn + " rounded-r-full"} onClick={() => onChange(value + 1)} disabled={value >= Math.min(max, 99)} aria-label="Increase quantity">
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
