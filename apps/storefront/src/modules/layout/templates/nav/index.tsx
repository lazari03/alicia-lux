import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [locales, currentLocale] = await Promise.all([
    listLocales(),
    getLocale(),
  ])

  return (
    <header className="lux-header">
      <nav aria-label="Store navigation" className="content-container lux-nav">
        <div className="flex items-center gap-6">
          <SideMenu locales={locales} currentLocale={currentLocale} />
          <LocalizedClientLink className="lux-nav-action hidden medium:inline-flex" href="/store">
            The collection
          </LocalizedClientLink>
        </div>
        <LocalizedClientLink href="/" className="lux-wordmark uppercase" data-testid="nav-store-link">
          Alicia Lux
        </LocalizedClientLink>
        <div className="lux-nav-shopping">
          <LocalizedClientLink className="lux-nav-action hidden small:inline-flex" href="/account" data-testid="nav-account-link">
            Account
          </LocalizedClientLink>
          <Suspense
            fallback={
              <LocalizedClientLink className="lux-nav-action" href="/cart" data-testid="nav-cart-link">
                Bag
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}
