import { Suspense } from "react"
import Image from "next/image"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { ShoppingBag, User } from "@medusajs/icons"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export type NavLink = { label: string; href: string }

const finishes = [
  { name: "Coffee Brown", image: "coffee" },
  { name: "Champagne", image: "champagne" },
]

export default async function Nav() {
  const [regions, locales, currentLocale, categories, collections] =
    await Promise.all([
      listRegions().then((regions: StoreRegion[]) => regions),
      listLocales(),
      getLocale(),
      listCategories().catch(() => []),
      listCollections({ fields: "id,handle,title" })
        .then(({ collections }) => collections)
        .catch(() => []),
    ])

  const categoryLinks: NavLink[] = (categories ?? [])
    .filter((category) => !category.parent_category)
    .slice(0, 8)
    .map((category) => ({
      label: category.name,
      href: `/categories/${category.handle}`,
    }))

  const collectionLinks: NavLink[] = (collections ?? [])
    .slice(0, 6)
    .map((collection) => ({
      label: collection.title,
      href: `/collections/${collection.handle}`,
    }))

  return (
    <>
      <AnnouncementBar />
      <header className="lux-header sticky inset-x-0 top-0 z-50">
        <nav
          aria-label="Main"
          className="content-container grid h-full grid-cols-[1fr_auto_1fr] items-center"
        >
          <div className="flex h-full items-center">
            <div className="-ml-2.5 small:hidden">
              <SideMenu
                regions={regions}
                locales={locales}
                currentLocale={currentLocale}
                categories={categoryLinks}
                collections={collectionLinks}
              />
            </div>

            <ul className="hidden h-full items-center gap-9 small:flex">
              <li className="lux-nav-item h-full">
                <LocalizedClientLink href="/store" className="lux-nav-link" data-testid="nav-shop-link">
                  Shop
                </LocalizedClientLink>
                <div className="lux-mega">
                  <div className="content-container grid grid-cols-12 gap-10 py-12">
                    <div className="col-span-3">
                      <p className="lux-eyebrow mb-5">Shop</p>
                      <ul className="flex flex-col gap-3">
                        <li>
                          <LocalizedClientLink href="/store" className="font-serif text-2xl leading-8 transition-colors hover:text-lux-gold">
                            Shop all
                          </LocalizedClientLink>
                        </li>
                        {categoryLinks.map((link) => (
                          <li key={link.href}>
                            <LocalizedClientLink href={link.href} className="font-serif text-2xl leading-8 transition-colors hover:text-lux-gold">
                              {link.label}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-span-3">
                      {collectionLinks.length > 0 && (
                        <>
                          <p className="lux-eyebrow mb-5">Collections</p>
                          <ul className="flex flex-col gap-3 text-sm text-lux-muted">
                            {collectionLinks.map((link) => (
                              <li key={link.href}>
                                <LocalizedClientLink href={link.href} className="transition-colors hover:text-lux-ink">
                                  {link.label}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                    <div className="col-span-6 grid grid-cols-2 gap-5">
                      {finishes.map((finish) => (
                        <LocalizedClientLink key={finish.image} href="/store" className="group/tile block">
                          <span className="relative block aspect-[4/3] overflow-hidden rounded-[10px] bg-lux-sand">
                            <Image
                              src={`/images/signature-${finish.image}.webp`}
                              alt=""
                              fill
                              sizes="320px"
                              className="object-cover transition-transform duration-1000 ease-lux group-hover/tile:scale-105"
                            />
                          </span>
                          <span className="mt-3 flex items-center justify-between text-[12px] font-medium uppercase tracking-label">
                            {finish.name}
                            <span aria-hidden="true">→</span>
                          </span>
                        </LocalizedClientLink>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
              <li className="h-full">
                <LocalizedClientLink href="/#finishes" className="lux-nav-link">
                  Finishes
                </LocalizedClientLink>
              </li>
              <li className="h-full">
                <LocalizedClientLink href="/#details" className="lux-nav-link">
                  The ritual
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <LocalizedClientLink
            href="/"
            className="whitespace-nowrap font-serif text-[1.35rem] font-medium uppercase tracking-[0.28em] text-lux-ink small:text-[1.6rem]"
            data-testid="nav-store-link"
          >
            Alicia Lux
          </LocalizedClientLink>

          <div className="-mr-2.5 flex h-full items-center justify-end gap-1">
            <LocalizedClientLink
              className="lux-icon-btn hidden xsmall:inline-flex"
              href="/account"
              aria-label="Account"
              data-testid="nav-account-link"
            >
              <User />
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="lux-icon-btn"
                  href="/cart"
                  aria-label="Shopping bag"
                  data-testid="nav-cart-link"
                >
                  <ShoppingBag />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </>
  )
}
