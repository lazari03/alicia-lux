import { LuxImage } from "@/components/ui/lux-image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { HeroCopy } from "@/components/shop/hero-copy"
import { ProductCard } from "@/components/shop/product-card"
import { Reveal } from "@/components/ui/reveal"
import { listProducts } from "@/lib/catalog"

export const dynamic = "force-dynamic"

const finishes = [
  { name: "Coffee Brown", mood: "Warm. Rich. Effortlessly timeless.", image: "coffee", slug: "signature-organizer-coffee-brown" },
  { name: "Champagne", mood: "Soft light, in its most beautiful form.", image: "champagne", slug: "signature-organizer-champagne" },
  { name: "Noir", mood: "A quiet statement. An enduring classic.", image: "noir", slug: "signature-organizer-noir" },
]

const details = [
  ["Everything in its place", "Considered compartments for jewelry and beauty essentials."],
  ["A moment to reflect", "An illuminated mirror at the heart of your daily ritual."],
  ["Beautiful, inside and out", "Soft textures, warm metallic accents, and a place for the smallest details."],
]

export default async function Home() {
  const products = (await listProducts()).filter((p) => p.featured).slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[#24170f] text-center text-[#fffaf2]">
        <HeroCopy />
        <div className="relative pt-[clamp(150px,calc(250px-20vw),190px)] md:pt-0">
          <LuxImage
            src="/images/signature-collection-hero.webp"
            alt="Three open Alicia Lux jewelry and beauty organizers in Coffee Brown, Champagne and Noir"
            width={1536}
            height={1024}
            priority
            sizes="100vw"
            className="block h-auto w-full animate-[settle_2.4s_var(--ease-lux)_both] motion-reduce:animate-none"
          />
          <div className="pointer-events-none absolute inset-0 top-[clamp(150px,calc(250px-20vw),190px)] bg-gradient-to-b from-[#24170f] via-transparent via-35% to-transparent md:top-0 md:from-[#120a06]/45" />
        </div>
      </section>

      {/* Finishes */}
      <section aria-labelledby="finishes-title" className="container-lux py-[clamp(64px,9vw,128px)]">
        <Reveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-3.5">One signature. Three expressions.</p>
            <h2 id="finishes-title" className="display text-[clamp(40px,4.6vw,68px)] leading-[1.05]">
              A shade of <em className="text-gold-deep">you.</em>
            </h2>
          </div>
          <Link href="/shop" className="link-underline self-start md:self-auto">
            Explore the collection <ArrowUpRight className="size-4" strokeWidth={1.25} />
          </Link>
        </Reveal>
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {finishes.map((f, i) => (
            <Reveal key={f.slug} index={i} as="figure" className="w-[78%] shrink-0 snap-start md:w-auto">
              <Link href={`/product/${f.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#e5d7c8]">
                  <LuxImage src={`/images/signature-${f.image}.webp`} alt={`Alicia Lux organizer in ${f.name}, shown open`} fill sizes="(min-width: 768px) 33vw, 80vw" className="object-cover transition-transform duration-[1.1s] ease-lux group-hover:scale-[1.04]" />
                  <span className="absolute top-3.5 left-3.5 bg-paper/90 px-2.5 py-1 text-[10px] tracking-[0.1em]">0{i + 1}</span>
                </div>
                <figcaption className="mt-5">
                  <h3 className="font-serif text-3xl leading-tight">{f.name}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.mood}</p>
                </figcaption>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Products */}
      {products.length > 0 && (
        <section aria-labelledby="shop-title" className="border-t border-line bg-surface py-[clamp(64px,9vw,120px)]">
          <div className="container-lux">
            <Reveal className="mb-[clamp(28px,4vw,52px)] grid justify-items-center gap-4 text-center">
              <p className="eyebrow">Shop</p>
              <h2 id="shop-title" className="display text-[clamp(40px,5vw,64px)] leading-none">The Signature Collection</h2>
            </Reveal>
            <ul className="grid grid-cols-2 gap-x-[clamp(14px,2.4vw,32px)] gap-y-12 md:grid-cols-3">
              {products.map((p, i) => (
                <Reveal key={p.id} as="li" index={i} className={i === 2 ? "col-span-2 mx-auto w-1/2 md:col-span-1 md:mx-0 md:w-full" : undefined}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Ritual */}
      <section aria-labelledby="ritual-title" className="grid bg-[#ebe2d6] lg:grid-cols-2">
        <Reveal y={0} className="relative aspect-square overflow-hidden lg:aspect-auto lg:min-h-[720px]">
          <LuxImage src="/images/signature-champagne.webp" alt="Champagne Alicia Lux organizer with its illuminated mirror, beauty compartments and jewelry drawers" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </Reveal>
        <Reveal className="self-center px-6 py-14 sm:px-10 lg:p-[clamp(48px,6vw,104px)]">
          <p className="eyebrow mb-5">Beauty, in the details</p>
          <h2 id="ritual-title" className="display text-[clamp(40px,4.6vw,66px)] leading-[1.05]">
            A little order.
            <br />
            <em className="text-gold-deep">A daily pleasure.</em>
          </h2>
          <p className="my-7 max-w-md text-[15px] leading-[1.85] text-muted">
            The necklace you always reach for. The ring with a story. The finishing touch before you step out. Give each one a place of its own.
          </p>
          <dl className="mb-6 border-t border-line-strong">
            {details.map(([title, text], i) => (
              <div key={title} className="border-b border-line-strong py-5">
                <dt className="font-serif text-[23px]"><span className="mr-3.5 font-sans text-[10px] tracking-[0.1em] text-gold-deep">0{i + 1}</span>{title}</dt>
                <dd className="mt-1.5 ml-8 text-[13px] leading-relaxed text-muted">{text}</dd>
              </div>
            ))}
          </dl>
          <Link href="/shop" className="link-underline">Discover Alicia Lux <ArrowUpRight className="size-4" strokeWidth={1.25} /></Link>
        </Reveal>
      </section>

      {/* Brand note */}
      <Reveal as="section" className="container-lux py-[clamp(64px,9vw,128px)] text-center">
        <LuxImage src="/images/signature-closed.webp" alt="Closed Champagne Alicia Lux organizer with the embossed AL monogram" width={1440} height={960} sizes="(min-width: 840px) 760px, 95vw" className="mx-auto mb-[clamp(28px,5vw,56px)] h-auto w-full max-w-[760px]" />
        <h2 className="display text-[clamp(40px,4.6vw,66px)] leading-[1.05]">
          Luxury is a feeling.
          <br />
          <em className="text-gold-deep">Make room for it.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-[1.9] text-muted">A beautiful home for the things you treasure, down to the details you see when it’s closed.</p>
      </Reveal>
    </>
  )
}
