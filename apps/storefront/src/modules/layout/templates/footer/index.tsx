import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const columns = [
  {
    title: "Shop",
    links: [
      { label: "The collection", href: "/store" },
      { label: "Shopping bag", href: "/cart" },
      { label: "Your account", href: "/account" },
    ],
  },
  {
    title: "Customer care",
    links: [
      { label: "Delivery & returns", href: "/policies/returns" },
      { label: "Terms & conditions", href: "/policies/terms" },
      { label: "Privacy policy", href: "/policies/privacy" },
    ],
  },
]

export default function Footer() {
  const email = process.env.STORE_SUPPORT_EMAIL

  return (
    <footer className="lux-footer">
      <div className="content-container">
        <div className="lux-footer-top" data-reveal>
          <LocalizedClientLink href="/" className="lux-footer-brand">
            <Image src="/images/alicia-lux-mark.png" alt="" width={84} height={84} />
            <span>Alicia Lux</span>
          </LocalizedClientLink>
          <p className="lux-footer-tagline">A beautiful home for the things you treasure.</p>
        </div>

        <div className="lux-footer-grid">
          {columns.map((col) => (
            // <details> gives a zero-JS accordion on phones; from tablet width
            // CSS shows the content and hides the toggle affordance.
            <details key={col.title} className="lux-footer-col">
              <summary>
                {col.title}
                <span className="lux-footer-plus" aria-hidden="true" />
              </summary>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <LocalizedClientLink href={l.href}>{l.label}</LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </details>
          ))}
          <div className="lux-footer-col lux-footer-contact">
            <p className="lux-footer-heading">Contact</p>
            {email ? (
              <a href={`mailto:${email}`}>{email}</a>
            ) : (
              <LocalizedClientLink href="/policies/terms">Seller information</LocalizedClientLink>
            )}
            <p className="lux-footer-small">Delivery within Sweden · Prices in SEK</p>
          </div>
        </div>

        <div className="lux-footer-bottom">
          <p>© {new Date().getFullYear()} Alicia Lux</p>
          <p className="lux-payments"><span className="lux-lock" aria-hidden="true" /> Payments secured by Stripe</p>
          <a href="#main-content" className="lux-to-top">
            Back to top <span className="lux-arrow lux-arrow-up" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
