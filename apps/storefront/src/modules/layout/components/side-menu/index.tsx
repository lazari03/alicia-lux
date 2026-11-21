"use client"

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react"
import { usePathname } from "next/navigation"
import { useState } from "react"
import type { Locale } from "@lib/data/locales"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import LanguageSelect from "../language-select"

const menuItems = [
  { id: "home", label: "Home", href: "/" },
  { id: "store", label: "The collection", href: "/store" },
  { id: "account", label: "Your account", href: "/account" },
  { id: "cart", label: "Shopping bag", href: "/cart" },
]

type SideMenuProps = {
  locales: Locale[] | null
  currentLocale: string | null
}

export default function SideMenu({ locales, currentLocale }: SideMenuProps) {
  const [open, setOpen] = useState(false)
  const path = usePathname().replace(/^\/[^/]+/, "") || "/"
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open menu"
        data-testid="nav-menu-button"
        className="lux-nav-action lux-menu-trigger"
        onClick={() => setOpen(true)}
      >
        <span className="lux-hamburger" aria-hidden="true"><span /><span /></span>
        <span className="hidden small:inline">Menu</span>
      </button>

      <Dialog open={open} onClose={close} className="fixed inset-0 z-[70]">
        <DialogBackdrop transition className="lux-menu-backdrop" data-testid="side-menu-backdrop" />
        <DialogPanel transition className="lux-menu" data-testid="nav-menu-popup">
          <div className="lux-menu-header">
            <DialogTitle className="lux-wordmark uppercase">Alicia Lux</DialogTitle>
            <button
              type="button"
              data-autofocus
              aria-label="Close menu"
              className="lux-nav-action"
              data-testid="close-menu-button"
              onClick={close}
            >
              <span className="lux-hamburger lux-hamburger-close" aria-hidden="true"><span /><span /></span>
            </button>
          </div>

          <nav aria-label="Main menu" className="lux-menu-links">
            <ul>
              {menuItems.map(({ id, label, href }) => (
                <li key={id}>
                  <LocalizedClientLink href={href} aria-current={path === href ? "page" : undefined} onClick={close} data-testid={id + "-link"}>
                    {label}<span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" />
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lux-menu-settings">
            <p className="lux-menu-shipping">Shipping within Sweden <span>SEK</span></p>
            {locales?.length ? <LanguageSelect locales={locales} currentLocale={currentLocale} /> : null}
          </div>
        </DialogPanel>
      </Dialog>
    </>
  )
}
