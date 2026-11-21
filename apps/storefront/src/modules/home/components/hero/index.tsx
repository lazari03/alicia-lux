import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="lux-hero">
      <div className="lux-hero-copy">
        <p className="lux-eyebrow">The signature collection</p>
        <h1 id="hero-heading">For all that<br />you <em>treasure.</em></h1>
        <p className="lux-description">Your favourite pieces. Your daily rituals. A beautiful place to keep them together.</p>
        <LocalizedClientLink href="/store" className="lux-button">Discover the collection <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" /></LocalizedClientLink>
        <a href="#details" className="lux-text-link">A closer look <span className="lux-arrow lux-arrow-down" aria-hidden="true" /></a>
      </div>
      <div className="lux-hero-art">
        <Image src="/images/signature-coffee.webp" alt="Open Alicia Lux coffee-brown jewelry box with an illuminated mirror and organized jewelry drawers" fill priority sizes="(min-width: 1024px) 56vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
        <span className="lux-image-label">Coffee Brown</span>
      </div>
    </section>
  )
}
