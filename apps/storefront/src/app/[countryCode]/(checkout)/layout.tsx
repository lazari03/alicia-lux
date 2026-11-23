import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lux-checkout-shell">
      <header className="lux-header lux-checkout-header">
        <nav className="content-container lux-nav" aria-label="Checkout">
          <div className="lux-nav-start">
            <LocalizedClientLink href="/cart" className="lux-back-link" data-testid="back-to-cart-link">
              <span className="lux-arrow" style={{ transform: "rotate(180deg)" }} aria-hidden="true" />
              <span>Bag</span>
            </LocalizedClientLink>
          </div>
          <LocalizedClientLink href="/" className="lux-wordmark lux-nav-brand" data-testid="store-link">
            <Image src="/images/alicia-lux-mark.png" alt="" width={44} height={44} />
            <span>Alicia Lux</span>
          </LocalizedClientLink>
          <p className="lux-secure-badge"><span className="lux-lock" aria-hidden="true" /> <span>Secure checkout</span></p>
        </nav>
      </header>
      <div data-testid="checkout-container">{children}</div>
    </div>
  )
}
