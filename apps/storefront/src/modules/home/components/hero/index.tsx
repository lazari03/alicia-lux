import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="lux-hero">
      <div className="lux-hero-copy">
        <p className="lux-eyebrow">The signature collection</p>
        <h1 id="hero-heading">For all that you <em>treasure.</em></h1>
        <LocalizedClientLink href="/store" className="lux-button">
          Shop the collection
          <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" />
        </LocalizedClientLink>
      </div>
      <div className="lux-hero-art">
        <Image
          src="/images/signature-collection-hero.webp"
          alt="Three open Alicia Lux jewelry and beauty organizers in Coffee Brown, Champagne, and Noir"
          width={1536}
          height={1024}
          priority
          sizes="(min-width: 1536px) 1536px, 100vw"
        />
      </div>
    </section>
  )
}
