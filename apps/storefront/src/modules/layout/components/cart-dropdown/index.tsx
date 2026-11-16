"use client"

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react"
import { updateLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { ShoppingBag, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  }
  return "payment"
}

const Quantity = ({ item }: { item: HttpTypes.StoreCartLineItem }) => {
  const [pending, startTransition] = useTransition()
  const [failed, setFailed] = useState(false)

  const change = (quantity: number) => {
    setFailed(false)
    startTransition(async () => {
      await updateLineItem({ lineId: item.id, quantity }).catch(() => setFailed(true))
    })
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className="inline-flex h-9 items-center rounded-full border border-lux-line text-sm aria-busy:opacity-50"
        aria-busy={pending}
      >
        <button
          type="button"
          className="h-full w-9 rounded-l-full disabled:opacity-30"
          aria-label={`Decrease quantity of ${item.title}`}
          disabled={pending || item.quantity <= 1}
          onClick={() => change(item.quantity - 1)}
        >
          −
        </button>
        <span
          className="min-w-6 text-center tabular-nums"
          data-testid="cart-item-quantity"
          data-value={item.quantity}
          aria-live="polite"
        >
          {item.quantity}
        </span>
        <button
          type="button"
          className="h-full w-9 rounded-r-full disabled:opacity-30"
          aria-label={`Increase quantity of ${item.title}`}
          disabled={pending}
          onClick={() => change(item.quantity + 1)}
        >
          +
        </button>
      </div>
      {failed && (
        <span role="alert" className="text-xs text-rose-700">
          Couldn&apos;t update
        </span>
      )}
    </div>
  )
}

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const pathname = usePathname()
  const onCartPage = pathname.includes("/cart")

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const subtotal = cartState?.subtotal ?? 0
  const previousTotal = useRef(totalItems)

  // Slide the bag open when something is added, except on the cart page.
  useEffect(() => {
    if (totalItems > previousTotal.current && !onCartPage) {
      setOpen(true)
    }
    previousTotal.current = totalItems
  }, [totalItems, onCartPage])

  // Never leave the drawer open across a navigation.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const items = [...(cartState?.items ?? [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  const badge = totalItems > 0 && (
    <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-lux-ink px-1 text-[10px] font-medium tabular-nums text-lux-paper">
      {totalItems}
    </span>
  )

  return (
    <>
      {onCartPage ? (
        <LocalizedClientLink
          className="lux-icon-btn"
          href="/cart"
          aria-label={`Shopping bag, ${totalItems} items`}
          data-testid="nav-cart-link"
        >
          <ShoppingBag />
          {badge}
        </LocalizedClientLink>
      ) : (
        <button
          type="button"
          className="lux-icon-btn"
          aria-label={`Open shopping bag, ${totalItems} items`}
          aria-expanded={open}
          data-testid="nav-cart-link"
          onClick={() => setOpen(true)}
        >
          <ShoppingBag />
          {badge}
        </button>
      )}

      <Dialog open={open} onClose={close} className="relative z-[60]">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-lux-ink/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel
            transition
            data-testid="nav-cart-dropdown"
            className="flex h-dvh w-[min(100vw,460px)] flex-col bg-lux-paper text-lux-ink shadow-lux-float transition-transform duration-500 ease-lux data-[closed]:translate-x-full"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-lux-line pl-6 pr-3">
              <DialogTitle className="font-serif text-2xl">
                Your bag{" "}
                <span className="font-sans text-sm text-lux-muted">({totalItems})</span>
              </DialogTitle>
              <button type="button" aria-label="Close bag" className="lux-icon-btn" onClick={close}>
                <XMark />
              </button>
            </div>

            {cartState && items.length ? (
              <>
                <ul className="flex-1 divide-y divide-lux-line overflow-y-auto overscroll-contain px-6">
                  {items.map((item) => (
                    <li key={item.id} className="grid grid-cols-[88px_1fr] gap-x-4 py-5" data-testid="cart-item">
                      <LocalizedClientLink href={`/products/${item.product_handle}`} onClick={close}>
                        <Thumbnail
                          thumbnail={item.thumbnail}
                          images={item.variant?.product?.images}
                          size="square"
                          alt={item.title ?? ""}
                        />
                      </LocalizedClientLink>
                      <div className="flex min-w-0 flex-col justify-between gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate text-[15px] leading-6">
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                onClick={close}
                                data-testid="product-link"
                              >
                                {item.title}
                              </LocalizedClientLink>
                            </h3>
                            <LineItemOptions
                              variant={item.variant}
                              data-testid="cart-item-variant"
                              data-value={item.variant}
                            />
                          </div>
                          <LineItemPrice item={item} style="tight" currencyCode={cartState.currency_code} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Quantity item={item} />
                          <DeleteButton id={item.id} data-testid="cart-item-remove-button">
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="shrink-0 border-t border-lux-line bg-lux-cream px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm">
                      Subtotal <span className="text-lux-muted">(excl. taxes)</span>
                    </span>
                    <span className="font-serif text-2xl" data-testid="cart-subtotal" data-value={subtotal}>
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-lux-muted">Shipping is calculated at checkout.</p>
                  <div className="mt-5 grid gap-2.5">
                    <LocalizedClientLink
                      href={"/checkout?step=" + getCheckoutStep(cartState)}
                      className="lux-btn w-full"
                      data-testid="drawer-checkout-button"
                    >
                      Checkout
                    </LocalizedClientLink>
                    <LocalizedClientLink href="/cart" className="lux-btn-outline w-full" data-testid="go-to-cart-button">
                      View bag
                    </LocalizedClientLink>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lux-sand">
                  <ShoppingBag />
                </span>
                <p className="font-serif text-3xl">Your bag is empty.</p>
                <p className="max-w-[26ch] text-sm leading-6 text-lux-muted">
                  Find a beautiful home for the things you treasure.
                </p>
                <LocalizedClientLink href="/store" className="lux-btn mt-2" onClick={close}>
                  Explore the collection
                </LocalizedClientLink>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default CartDropdown
