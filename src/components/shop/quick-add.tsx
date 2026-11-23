"use client"

import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { toCartLine } from "@/lib/cart-line"
import type { Product } from "@/lib/types"
import { useCart } from "@/store/cart"

/** Floating "+" over the card image — desktop hover, always visible on touch. */
export function QuickAdd({ product }: { product: Product }) {
  const add = useCart((s) => s.add)
  const t = useTranslations("product")
  return (
    <button
      type="button"
      onClick={() => add(toCartLine(product))}
      aria-label={t("quickAdd", { name: `${product.name} ${product.subtitle ?? ""}`.trim() })}
      className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-paper/90 text-ink shadow-sm backdrop-blur transition-all duration-300 ease-lux hover:bg-ink hover:text-paper [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 focus-visible:opacity-100"
    >
      <Plus className="size-4" />
    </button>
  )
}
