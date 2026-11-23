"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type CartLine = {
  productId: string
  slug: string
  name: string
  subtitle: string | null
  image: string | null
  priceOre: number
  quantity: number
  maxQuantity: number
}

type CartState = {
  lines: CartLine[]
  open: boolean
  setOpen: (open: boolean) => void
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
}

const clamp = (n: number, max: number) => Math.max(1, Math.min(n, Math.max(1, Math.min(max, 99))))

/**
 * Client cart. Prices here are display-only snapshots — the server re-reads
 * every product from Supabase when the shopper continues to payment.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId)
          const lines = existing
            ? state.lines.map((l) =>
                l.productId === line.productId
                  ? { ...l, ...line, quantity: clamp(l.quantity + quantity, line.maxQuantity) }
                  : l
              )
            : [...state.lines, { ...line, quantity: clamp(quantity, line.maxQuantity) }]
          return { lines, open: true }
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.productId === productId ? { ...l, quantity: clamp(quantity, l.maxQuantity) } : l)),
        })),
      remove: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "alicia-lux-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    }
  )
)

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0)
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.priceOre * l.quantity, 0)
