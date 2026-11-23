"use client"

import { AnimatePresence, motion } from "motion/react"
import { Check, ShoppingBag } from "lucide-react"
import { useState } from "react"
import { toCartLine } from "@/lib/cart-line"
import type { Product } from "@/lib/types"
import { useCart } from "@/store/cart"
import { QuantityStepper } from "./cart-drawer"

export function AddToCart({ product }: { product: Product }) {
  const add = useCart((s) => s.add)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const soldOut = product.stock <= 0

  const onAdd = () => {
    add(toCartLine(product), quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  if (soldOut) {
    return (
      <div className="grid gap-3">
        <button type="button" disabled className="btn btn-primary w-full">Sold out</button>
        <p className="text-sm text-muted">This finish is currently sold out. Check back soon.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-stretch gap-3">
        <QuantityStepper value={quantity} max={product.stock} onChange={(q) => setQuantity(Math.max(1, q))} label={product.name} />
        <button type="button" onClick={onAdd} className="btn btn-primary flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={added ? "added" : "add"}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-3"
            >
              {added ? <>Added <Check className="size-4" /></> : <>Add to bag <ShoppingBag className="size-4" strokeWidth={1.5} /></>}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      {product.stock <= 5 && <p className="text-[13px] text-gold-deep">Only {product.stock} left</p>}
    </div>
  )
}
