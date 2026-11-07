import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import Hero from "@modules/home/components/hero"
import CollectionEdit from "@modules/home/components/collection-edit"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Alicia Lux | Considered style, everyday",
  description: "Discover the Alicia Lux edit. Contemporary essentials and timeless pieces, thoughtfully brought together.",
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
      <section className="bg-[#f5f3ed] py-20 small:py-28" aria-labelledby="new-arrivals-heading">
        <div className="content-container">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div><p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#8c795e]">Fresh perspectives</p><h2 id="new-arrivals-heading" className="font-serif text-4xl small:text-5xl">The latest edit.</h2></div>
            <LocalizedClientLink href="/store" className="border-b border-[#292923] pb-2 text-xs uppercase tracking-widest">Shop all ↗</LocalizedClientLink>
          </div>
          {products.length ? <ul className="grid grid-cols-2 gap-x-5 gap-y-10 medium:grid-cols-4">{products.map(product => <li key={product.id}><ProductPreview product={product} region={region} /></li>)}</ul> : <p className="text-sm text-[#706e66]">Our next collection is on its way. Come back soon.</p>}
        </div>
      </section>
      <section className="content-container py-24 text-center small:py-32" aria-labelledby="brand-heading">
        <p className="mb-6 text-[10px] uppercase tracking-[0.25em] text-[#8c795e]">The Alicia Lux point of view</p>
        <h2 id="brand-heading" className="mx-auto max-w-3xl font-serif text-4xl leading-tight small:text-6xl">Style is personal.<br /><span className="italic">Make it yours.</span></h2>
        <p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-[#706e66]">We believe the best wardrobes are built with intention. Pieces you reach for again and again. Details that make the everyday feel special.</p>
        <LocalizedClientLink href="/store" className="mt-8 inline-block border-b border-[#292923] pb-2 text-xs uppercase tracking-widest">Find your favourites ↗</LocalizedClientLink>
      </section>
    </>
  )
}
