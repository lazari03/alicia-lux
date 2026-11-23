"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { track } from "@/lib/analytics/track"

/** Sends one pageview per route change. Mounted only in the storefront layouts. */
export function Pageviews() {
  const pathname = usePathname()
  const last = useRef<string | null>(null)
  useEffect(() => {
    if (last.current === pathname) return
    last.current = pathname
    track("pageview")
  }, [pathname])
  return null
}

/** Fires a single named event when mounted (e.g. product_view, purchase). */
export function TrackOnMount({ event, productId, valueOre }: { event: "product_view" | "purchase"; productId?: string; valueOre?: number }) {
  const sent = useRef(false)
  useEffect(() => {
    if (sent.current) return
    sent.current = true
    track(event, { productId, valueOre })
  }, [event, productId, valueOre])
  return null
}
