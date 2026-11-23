"use client"

import { useEffect } from "react"
import { useCart } from "@/store/cart"

/** Empties the bag and forgets the pending order once payment is confirmed. */
export function ClearCart() {
  const clear = useCart((s) => s.clear)
  useEffect(() => {
    clear()
    try {
      sessionStorage.removeItem("alicia-lux-order")
    } catch {}
  }, [clear])
  return null
}
