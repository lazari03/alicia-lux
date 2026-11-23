"use client"

import { motion } from "motion/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useOptimistic, useTransition } from "react"
import type { SortKey } from "@/lib/catalog"
import { cn } from "@/lib/utils"

const options: { key: SortKey; label: string; long: string }[] = [
  { key: "featured", label: "Featured", long: "Featured" },
  { key: "newest", label: "Newest", long: "Newest arrivals" },
  { key: "price-asc", label: "Price ↑", long: "Price, low to high" },
  { key: "price-desc", label: "Price ↓", long: "Price, high to low" },
]

/** One-tap segmented sort with a sliding pill; arrow keys move between options. */
export function SortControl({ value }: { value: SortKey }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, start] = useTransition()
  const [selected, setSelected] = useOptimistic(value)

  const choose = (key: SortKey) =>
    start(() => {
      setSelected(key)
      const next = new URLSearchParams(params)
      if (key === "featured") next.delete("sort")
      else next.set("sort", key)
      router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false })
    })

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0
    if (!step) return
    e.preventDefault()
    const i = options.findIndex((o) => o.key === selected)
    const next = options[(i + step + options.length) % options.length]
    choose(next.key)
    requestAnimationFrame(() => e.currentTarget.querySelector<HTMLElement>(`[data-key="${next.key}"]`)?.focus())
  }

  return (
    <div className="flex w-full items-center gap-4 sm:w-auto">
      <span id="sort-label" className="hidden text-[11px] font-medium uppercase tracking-[0.2em] text-muted sm:inline">Sort</span>
      <div
        role="radiogroup"
        aria-labelledby="sort-label"
        aria-busy={pending}
        onKeyDown={onKeyDown}
        className={cn("grid w-full grid-cols-4 rounded-full border border-line bg-card p-1 transition-opacity sm:w-auto", pending && "opacity-70")}
      >
        {options.map((o) => {
          const active = o.key === selected
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={o.long}
              tabIndex={active ? 0 : -1}
              data-key={o.key}
              onClick={() => !active && choose(o.key)}
              className={cn("relative min-h-10 rounded-full px-2 text-[13px] whitespace-nowrap transition-colors duration-300 sm:px-5", active ? "text-paper" : "text-muted hover:text-ink")}
            >
              {active && (
                <motion.span layoutId="sort-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
              )}
              <span className="relative">{o.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
