"use client"

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import type { Locale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import LanguageSelect from "../language-select"

const primary = [
  { id: "home", label: "Home", href: "/" },
  { id: "store", label: "Shop all", href: "/store" },
  { id: "account", label: "Account", href: "/account" },
  { id: "cart", label: "Bag", href: "/cart" },
]

const secondary = [
  { label: "Delivery & returns", href: "/policies/returns" },
  { label: "Terms", href: "/policies/terms" },
  { label: "Privacy", href: "/policies/privacy" },
]

type SideMenuProps = {
  locales: Locale[] | null
  currentLocale: string | null
}

export default function SideMenu({ locales, currentLocale }: SideMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const path = pathname.replace(/^\/[^/]+/, "") || "/"
  const close = () => setOpen(false)

  // Close on navigation (covers browser back/forward too).
  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        data-testid="nav-menu-button"
        data-open={open || undefined}
        className="lux-burger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="lux-burger-lines" aria-hidden="true"><span /><span /><span /></span>
        <span className="lux-burger-label">Menu</span>
      </button>

      <Dialog open={open} onClose={close} className="lux-menu-root">
        <DialogBackdrop transition className="lux-menu-backdrop" data-testid="side-menu-backdrop" />
        <DialogPanel transition className="lux-menu" data-testid="nav-menu-popup">
          <div className="lux-menu-header">
            <DialogTitle className="lux-wordmark">Alicia Lux</DialogTitle>
            <button
              type="button"
              data-autofocus
              aria-label="Close menu"
              className="lux-burger"
              data-open
              data-testid="close-menu-button"
              onClick={close}
            >
              <span className="lux-burger-lines" aria-hidden="true"><span /><span /><span /></span>
            </button>
          </div>

          <nav aria-label="Main menu" className="lux-menu-links">
            <ul>
              {primary.map(({ id, label, href }, i) => (
                <li key={id} style={{ "--i": i } as React.CSSProperties}>
                  <LocalizedClientLink
                    href={href}
                    aria-current={path === href ? "page" : undefined}
                    onClick={close}
                    data-testid={id + "-link"}
                  >
                    <span className="lux-menu-index" aria-hidden="true">0{i + 1}</span>
                    <span className="lux-menu-label">{label}</span>
                    <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" />
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>

          <LocalizedClientLink href="/store" onClick={close} className="lux-menu-feature">
            <Image
              src="/images/signature-collection-hero.webp"
              alt=""
              fill
              sizes="(min-width: 480px) 420px, 90vw"
              className="object-cover"
            />
            <span>
              <small>The Signature Collection</small>
              Coffee Brown · Champagne · Noir
            </span>
          </LocalizedClientLink>

          <div className="lux-menu-settings">
            <ul className="lux-menu-secondary">
              {secondary.map(({ label, href }) => (
                <li key={href}>
                  <LocalizedClientLink href={href} onClick={close}>{label}</LocalizedClientLink>
                </li>
              ))}
            </ul>
            <p className="lux-menu-shipping">Shipping within Sweden <span>SEK</span></p>
            {locales?.length ? <LanguageSelect locales={locales} currentLocale={currentLocale} /> : null}
          </div>
        </DialogPanel>
      </Dialog>
    </>
  )
}
