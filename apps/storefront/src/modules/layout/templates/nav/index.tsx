import Image from "next/image"
import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { BagIcon, UserIcon } from "@modules/common/icons/lux-icons"
import CartButton from "@modules/layout/components/cart-button"
import HeaderShell from "@modules/layout/components/header-shell"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [locales, currentLocale] = await Promise.all([listLocales(), getLocale()])

  return (
    <>
      <div className="lux-announcement" role="note">
        <p>Delivery within Sweden · Secure payment with Stripe</p>
      </div>
      <HeaderShell>
        <nav aria-label="Store navigation" className="content-container lux-nav">
          <div className="lux-nav-start">
            <SideMenu locales={locales} currentLocale={currentLocale} />
          </div>
          <LocalizedClientLink href="/" className="lux-wordmark lux-nav-brand" data-testid="nav-store-link">
            <Image src="/images/alicia-lux-mark.png" alt="" width={44} height={44} priority />
            <span>Alicia Lux</span>
          </LocalizedClientLink>
          <div className="lux-nav-shopping">
            <LocalizedClientLink
              className="lux-icon-button"
              href="/account"
              aria-label="Account"
              data-testid="nav-account-link"
            >
              <UserIcon />
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink className="lux-icon-button" href="/cart" aria-label="Shopping bag" data-testid="nav-cart-link">
                  <BagIcon />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </HeaderShell>
    </>
  )
}
