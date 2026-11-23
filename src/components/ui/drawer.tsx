"use client"

import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

/**
 * Accessible slide-in panel: focus moves inside, Escape closes, background
 * scroll is locked, and focus returns to the trigger on close.
 */
export function Drawer({
  open,
  onClose,
  side = "left",
  label,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  side?: "left" | "right"
  label: string
  className?: string
  children: React.ReactNode
}) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    const focusTimer = setTimeout(() => panel.current?.querySelector<HTMLElement>("[data-autofocus], button, a")?.focus(), 30)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key !== "Tab" || !panel.current) return
      const focusable = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])')
      const first = focusable[0]
      const lastEl = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl?.focus() }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first?.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(focusTimer)
      document.body.style.overflow = overflow
      document.removeEventListener("keydown", onKey)
      previous?.focus?.()
    }
  }, [open, onClose])

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-night/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            className={cn(
              "absolute inset-y-0 flex h-dvh w-full max-w-[460px] flex-col overflow-y-auto overscroll-contain",
              side === "left" ? "left-0" : "right-0",
              className
            )}
            initial={{ x: side === "left" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "left" ? "-100%" : "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
