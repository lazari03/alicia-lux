"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * One observer for the whole page: any element with `data-reveal` fades/rises
 * into view once. Content stays visible without JS and with reduced motion,
 * because the hidden state only applies under `html[data-reveal-ready]`.
 *
 * Elements are revealed with the Web Animations API (fill: forwards) rather
 * than by toggling attributes, so streamed server HTML is never mutated
 * before React hydrates it.
 */
const revealed = new WeakSet<Element>()
export default function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      return
    }
    root.dataset.revealReady = "true"

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          io.unobserve(el)
          revealed.add(el)
          const index = Number(getComputedStyle(el).getPropertyValue("--i")) || 0
          const rise = el.dataset.reveal !== "fade"
          el.animate(
            [
              { opacity: 0, transform: rise ? "translateY(22px)" : "none" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 800, delay: index * 90, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" }
          )
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    )

    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (!revealed.has(el)) io.observe(el) // re-observing is a no-op
      })
    scan()

    // Streamed / suspended content (product grids) mounts after first paint.
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [pathname])

  return null
}
