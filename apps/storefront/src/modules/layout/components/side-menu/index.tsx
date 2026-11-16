"use client"

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react"
import { ArrowRightMini, BarsThree, XMark } from "@medusajs/icons"
import { clx, useToggleState } from "@medusajs/ui"
import { useState } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { HttpTypes } from "@medusajs/types"
import { Locale } from "@lib/data/locales"

type MenuLink = { label: string; href: string }

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories?: MenuLink[]
  collections?: MenuLink[]
}

const primaryLinks: (MenuLink & { testId: string })[] = [
  { label: "Home", href: "/", testId: "home-link" },
  { label: "Shop all", href: "/store", testId: "store-link" },
  { label: "Finishes", href: "/#finishes", testId: "finishes-link" },
  { label: "The ritual", href: "/#details", testId: "ritual-link" },
]

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  categories = [],
  collections = [],
}: SideMenuProps) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()
  const browse = [...categories, ...collections]

  return (
    <>
      <button
        type="button"
        className="lux-icon-btn"
        aria-label="Open menu"
        aria-expanded={open}
        data-testid="nav-menu-button"
        onClick={() => setOpen(true)}
      >
        <BarsThree />
      </button>

      <Dialog open={open} onClose={close} className="relative z-[60]">
        <DialogBackdrop
          transition
          data-testid="side-menu-backdrop"
          className="fixed inset-0 bg-lux-ink/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            data-testid="nav-menu-popup"
            className="flex h-dvh w-[min(88vw,400px)] flex-col bg-lux-paper shadow-lux-float transition-transform duration-500 ease-lux data-[closed]:-translate-x-full"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-lux-line pl-6 pr-3">
              <DialogTitle className="lux-eyebrow">Menu</DialogTitle>
              <button
                type="button"
                aria-label="Close menu"
                className="lux-icon-btn"
                data-testid="close-menu-button"
                onClick={close}
              >
                <XMark />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-8">
              <ul className="flex flex-col">
                {primaryLinks.map((link) => (
                  <li key={link.href} className="border-b border-lux-line/70">
                    <LocalizedClientLink
                      href={link.href}
                      className="flex items-center justify-between py-4 font-serif text-[1.75rem] leading-9 text-lux-ink"
                      onClick={close}
                      data-testid={link.testId}
                    >
                      {link.label}
                      <ArrowRightMini className="text-lux-taupe" />
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>

              {browse.length > 0 && (
                <div className="mt-9">
                  <p className="lux-eyebrow mb-4">Browse</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-[15px] text-lux-muted">
                    {browse.map((link) => (
                      <li key={link.href}>
                        <LocalizedClientLink href={link.href} onClick={close} className="hover:text-lux-ink">
                          {link.label}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ul className="mt-9 flex flex-col gap-3 text-[15px] text-lux-muted">
                <li>
                  <LocalizedClientLink href="/account" onClick={close} className="hover:text-lux-ink" data-testid="account-link">
                    Account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/cart" onClick={close} className="hover:text-lux-ink" data-testid="cart-link">
                    Shopping bag
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            <div className="flex shrink-0 flex-col gap-y-4 border-t border-lux-line bg-lux-cream px-6 py-5 text-lux-ink">
              {!!locales?.length && (
                <div
                  className="flex justify-between"
                  onMouseEnter={languageToggleState.open}
                  onMouseLeave={languageToggleState.close}
                >
                  <LanguageSelect
                    toggleState={languageToggleState}
                    locales={locales}
                    currentLocale={currentLocale}
                  />
                  <ArrowRightMini
                    className={clx(
                      "transition-transform duration-150",
                      languageToggleState.state ? "-rotate-90" : ""
                    )}
                  />
                </div>
              )}
              {regions && (
                <div
                  className="flex justify-between"
                  onMouseEnter={countryToggleState.open}
                  onMouseLeave={countryToggleState.close}
                >
                  <CountrySelect toggleState={countryToggleState} regions={regions} />
                  <ArrowRightMini
                    className={clx(
                      "transition-transform duration-150",
                      countryToggleState.state ? "-rotate-90" : ""
                    )}
                  />
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default SideMenu
