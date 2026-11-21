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
    images: [{ url: "/images/signature-collection-hero.webp", width: 1536, height: 1024, alt: "Alicia Lux organizers in Coffee Brown, Champagne, and Noir" }],
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
          <div className="lux-collection-intro">
            <h2 id="new-arrivals-heading" className="font-serif text-4xl small:text-5xl">The Signature Collection</h2>
            <LocalizedClientLink href="/store" className="lux-text-link">
              Shop the collection <span className="lux-arrow lux-arrow-diagonal" aria-hidden="true" />
            </LocalizedClientLink>
          </div>
          {products.length ? <ul className="lux-centered-products">{products.map(product => <li key={product.id}><ProductPreview product={product} region={region} /></li>)}</ul> : <p className="text-center text-sm text-[#706e66]">Discover our signature finishes above.</p>}
        </div>
      </section>
      <Ritual />
    </>
  )
}
