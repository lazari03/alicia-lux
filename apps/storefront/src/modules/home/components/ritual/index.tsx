import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Ritual() {
  return (
    <>
      <section id="details" className="lux-ritual" aria-labelledby="ritual-heading">
        <div className="lux-ritual-image"><Image src="/images/signature-champagne.webp" alt="Champagne Alicia Lux organizer showing its illuminated mirror, beauty compartments and jewelry drawers" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /></div>
        <div className="lux-ritual-copy"><p className="lux-eyebrow">Beauty, in the details</p><h2 id="ritual-heading">A little order.<br /><em>A daily pleasure.</em></h2><p className="lux-description">The necklace you always reach for. The ring with a story. The finishing touch before you step out. Give each one a place of its own.</p>
          <dl className="lux-details">
            <div><dt><span>01</span> Everything in its place</dt><dd>Considered compartments for jewelry and beauty essentials.</dd></div>
            <div><dt><span>02</span> A moment to reflect</dt><dd>An illuminated mirror at the heart of your daily ritual.</dd></div>
            <div><dt><span>03</span> Beautiful, inside and out</dt><dd>Soft textures, warm metallic accents, and a place for the smallest details.</dd></div>
          </dl>
          <LocalizedClientLink href="/store" className="lux-text-link">Discover Alicia Lux <span aria-hidden="true">↗</span></LocalizedClientLink>
        </div>
      </section>
      <section className="lux-brand-note content-container" aria-labelledby="brand-heading">
        <Image
          src="/images/signature-closed.webp"
          alt="Closed Champagne Alicia Lux organizer with the embossed AL monogram and pull tab"
          width={1440}
          height={960}
          sizes="(min-width: 840px) 760px, 95vw"
          className="lux-brand-note-image"
        />
        <h2 id="brand-heading">Luxury is a feeling.<br /><em>Make room for it.</em></h2>
        <p>A beautiful home for the things you treasure, down to the details you see when it’s closed.</p>
      </section>
    </>
  )
}
