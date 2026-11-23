"use client"

import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { AnimatePresence, motion } from "motion/react"
import { ShoppingBag } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cartCount, useCart } from "@/store/cart"
import { useHydrated } from "@/lib/use-hydrated"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { MenuDrawer } from "./menu-drawer"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const last = useRef(0)
  const pathname = usePathname()
  const hydrated = useHydrated()
  const t = useTranslations()
  const count = useCart((s) => cartCount(s.lines))
  const openCart = useCart((s) => s.setOpen)

  useEffect(() => setMenuOpen(false), [pathname])

  useEffect(() => {
    let ticking = false
    const update = () => {
      const y = Math.max(window.scrollY, 0)
      const delta = y - last.current
      setScrolled(y > 8)
      if (Math.abs(delta) > 6) setHidden(delta > 0 && y > 180)
      last.current = y
      ticking = false
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <div className="bg-night px-4 py-2 text-center text-[10px] uppercase tracking-[0.14em] text-night-text sm:text-[11px]">
        {t("announcement")}
      </div>
      <header
        onFocusCapture={() => setHidden(false)}
        className={cn(
          "sticky top-0 z-40 border-b border-transparent bg-paper/90 backdrop-blur-xl backdrop-saturate-150 transition-[transform,border-color,box-shadow] duration-300 ease-lux",
          scrolled && "border-line shadow-[0_6px_24px_-18px_rgb(31_25_21/0.35)]",
          hidden && !menuOpen && "-translate-y-full motion-reduce:translate-y-0"
        )}
      >
        <nav
          aria-label={t("nav.shop")}
          className={cn("container-lux grid grid-cols-[1fr_auto_1fr] items-center transition-[min-height] duration-300", scrolled ? "min-h-14" : "min-h-14 sm:min-h-16")}
        >
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-label={t("common.openMenu")}
              className="group -ml-1 inline-flex min-h-11 min-w-11 items-center gap-3 px-1"
            >
              <Burger open={false} />
              <span className="hidden text-[11px] font-medium uppercase tracking-[0.2em] sm:inline">{t("common.menu")}</span>
            </button>
            <Link href="/shop" className="link-underline hidden lg:inline-flex">{t("nav.shop")}</Link>
          </div>

          <Logo />

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <button
              type="button"
              onClick={() => openCart(true)}
              className="relative grid size-11 place-items-center rounded-full transition-colors hover:bg-surface"
              aria-label={t("common.openBag", { count: hydrated ? count : 0 })}
            >
              <ShoppingBag className="size-[22px]" strokeWidth={1.25} />
              <AnimatePresence>
                {hydrated && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute top-1.5 right-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-gold px-1 text-[10px] font-medium leading-none text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </header>
      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

/** Three hairlines that morph into an X. */
export function Burger({ open }: { open: boolean }) {
  const line = "absolute left-0 h-[1.25px] rounded bg-current transition-all duration-300 ease-lux"
  return (
    <span aria-hidden className="relative block h-3.5 w-6">
      <span className={cn(line, "w-full", open ? "top-[6.4px] rotate-45" : "top-0")} />
      <span className={cn(line, "top-[6.4px] group-hover:w-full", open ? "w-full -translate-x-2 opacity-0" : "w-[70%]")} />
      <span className={cn(line, open ? "top-[6.4px] w-full -rotate-45" : "top-[12.75px] w-[45%] group-hover:w-full")} />
    </span>
  )
}
