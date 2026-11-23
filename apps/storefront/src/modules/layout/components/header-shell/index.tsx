"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Sticky header that condenses after the first scroll and slides away while
 * scrolling down (reappearing on any upward scroll) — more room for product
 * imagery on phones without losing quick access to the bag.
 */
export default function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const last = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const update = () => {
      const y = Math.max(window.scrollY, 0)
      const delta = y - last.current
      setScrolled(y > 8)
      if (Math.abs(delta) > 6) setHidden(delta > 0 && y > 160)
      last.current = y
      ticking.current = false
    }
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="lux-header"
      data-scrolled={scrolled || undefined}
      data-hidden={hidden || undefined}
      // Keyboard users tabbing into a hidden header bring it back.
      onFocusCapture={() => setHidden(false)}
    >
      {children}
    </header>
  )
}
