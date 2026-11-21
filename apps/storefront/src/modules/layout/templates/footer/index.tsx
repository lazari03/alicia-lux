import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="lux-footer">
      <div className="content-container">
        <div className="lux-footer-main">
          <div>
            <LocalizedClientLink href="/" className="lux-footer-brand">
              <Image src="/images/alicia-lux-mark.png" alt="" width={84} height={84} />
              <span>Alicia Lux</span>
            </LocalizedClientLink>
            <p>A beautiful home for the things you treasure.</p>
          </div>
          <nav aria-label="Shop links">
            <ul>
              <li><LocalizedClientLink href="/store">The collection <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" /></LocalizedClientLink></li>
              <li><LocalizedClientLink href="/account">Your account <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" /></LocalizedClientLink></li>
              <li><LocalizedClientLink href="/cart">Shopping bag <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" /></LocalizedClientLink></li>
            </ul>
          </nav>
          <nav aria-label="Store policies">
            <ul>
              <li><LocalizedClientLink href="/policies/terms">Terms &amp; conditions</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/policies/privacy">Privacy policy</LocalizedClientLink></li>
              <li><LocalizedClientLink href="/policies/returns">Returns &amp; refunds</LocalizedClientLink></li>
            </ul>
          </nav>
        </div>
        <div className="lux-footer-bottom">
          <p>© {new Date().getFullYear()} Alicia Lux</p>
          <a href="#top">Back to top <span className="lux-arrow lux-arrow-up" aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  )
}
