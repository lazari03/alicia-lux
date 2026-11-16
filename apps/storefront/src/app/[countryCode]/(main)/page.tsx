import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import Ritual from "@modules/home/components/ritual"
import Hero from "@modules/home/components/hero"
import CollectionEdit from "@modules/home/components/collection-edit"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  openGraph: {
    title: "Alicia Lux — For all that you treasure",
    description: "Jewelry, beauty, and the art of your everyday.",
    images: [{ url: "/images/signature-coffee.webp", width: 1254, height: 1254, alt: "Alicia Lux Coffee Brown jewelry organizer" }],
  },
  title: "Jewelry boxes & everyday rituals",
  description: "Discover Alicia Lux jewelry and beauty organizers. Explore Coffee Brown, Champagne and Noir — a beautiful home for the things you treasure.",
}

export default async function Home({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)
  if (!region) notFound()
  const { response: { products } } = await listProducts({ regionId: region.id, queryParams: { limit: 4 } })

  return (
    <>
      <Hero />
      <CollectionEdit />
      <section className="lux-catalog py-20 small:py-28" aria-labelledby="new-arrivals-heading">
        <div className="content-container">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div><p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#8c795e]">Discover more</p><h2 id="new-arrivals-heading" className="font-serif text-4xl small:text-5xl">Available in the boutique.</h2></div>
            <LocalizedClientLink href="/store" className="border-b border-[#292923] pb-2 text-xs uppercase tracking-widest">Shop all ↗</LocalizedClientLink>
          </div>
          {products.length ? <ul className="grid grid-cols-2 gap-x-5 gap-y-10 medium:grid-cols-4">{products.map(product => <li key={product.id}><ProductPreview product={product} region={region} /></li>)}</ul> : <p className="text-sm text-[#706e66]">The boutique is being prepared. Discover our signature finishes above.</p>}
        </div>
      </section>
      <Ritual />
    </>
  )
}
