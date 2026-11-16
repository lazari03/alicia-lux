import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const details = [
  { title: "Everything in its place", body: "Considered compartments for jewelry and beauty essentials." },
  { title: "A moment to reflect", body: "An illuminated mirror at the heart of your daily ritual." },
  { title: "Beautiful, inside and out", body: "Soft textures, warm metallic accents, and a place for the smallest details." },
]

export default function Ritual() {
  return (
    <>
      <section id="details" className="grid bg-lux-paper small:grid-cols-2" aria-labelledby="ritual-heading">
        <div className="relative aspect-square overflow-hidden small:aspect-auto small:min-h-[720px]">
          <Image
            src="/images/signature-champagne.webp"
            alt="Champagne Alicia Lux organizer showing its illuminated mirror, beauty compartments and jewelry drawers"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="lux-parallax object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-[clamp(1.25rem,4vw,3.5rem)] py-16 small:px-[clamp(2.5rem,6vw,6rem)] small:py-24">
          <p className="lux-eyebrow mb-5">Beauty, in the details</p>
          <h2 id="ritual-heading" className="lux-h2">
            A little order.
            <br />
            <em>A daily pleasure.</em>
          </h2>
          <p className="lux-lede mt-6 max-w-[44ch]">
            The necklace you always reach for. The ring with a story. The finishing touch before you step out. Give
            each one a place of its own.
          </p>
          <dl className="mt-10 border-t border-lux-line">
            {details.map((detail, index) => (
              <div key={detail.title} className="lux-reveal grid grid-cols-[2.5rem_1fr] border-b border-lux-line py-5">
                <span className="pt-1.5 text-[11px] font-medium tabular-nums tracking-label text-lux-gold" aria-hidden="true">
                  0{index + 1}
                </span>
                <div>
                  <dt className="font-serif text-[1.375rem] leading-7">{detail.title}</dt>
                  <dd className="mt-1.5 text-sm leading-6 text-lux-muted">{detail.body}</dd>
                </div>
              </div>
            ))}
          </dl>
          <LocalizedClientLink href="/store" className="lux-btn-outline mt-10 self-start">
            Discover Alicia Lux
          </LocalizedClientLink>
        </div>
      </section>

      <section className="bg-lux-ink text-lux-paper" aria-labelledby="brand-heading">
        <div className="content-container lux-reveal py-24 text-center small:py-36">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-label text-lux-gold-soft">The Alicia Lux philosophy</p>
          <h2
            id="brand-heading"
            className="mx-auto max-w-[18ch] font-serif font-normal"
            style={{ fontSize: "clamp(2.25rem, 1.4rem + 3.4vw, 4.75rem)", lineHeight: 1.02, letterSpacing: "-0.015em" }}
          >
            Luxury is a feeling. <em className="italic text-lux-gold-soft">Make room for it.</em>
          </h2>
          <p className="mx-auto mt-8 max-w-[52ch] text-[15px] leading-8 text-lux-paper/70">
            We believe the things you treasure deserve a beautiful home. Thoughtful organization. Understated beauty.
            A ritual that is entirely yours.
          </p>
          <LocalizedClientLink href="/store" className="lux-btn-light mt-10">
            Shop the collection
          </LocalizedClientLink>
        </div>
      </section>
    </>
  )
}
