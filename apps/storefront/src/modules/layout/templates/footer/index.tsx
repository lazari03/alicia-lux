import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="lux-footer">
      <div className="content-container">
        <div className="lux-footer-main">
          <div>
            <LocalizedClientLink href="/" className="lux-footer-brand">Alicia Lux</LocalizedClientLink>
            <p>A beautiful home for the things you treasure.</p>
          </div>
          <nav aria-label="Footer">
            <ul>
              <li><LocalizedClientLink href="/store">The collection <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" /></LocalizedClientLink></li>
              <li><LocalizedClientLink href="/account">Your account <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" /></LocalizedClientLink></li>
              <li><LocalizedClientLink href="/cart">Shopping bag <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" /></LocalizedClientLink></li>
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
