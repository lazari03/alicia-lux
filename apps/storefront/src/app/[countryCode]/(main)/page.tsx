import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import Ritual from "@modules/home/components/ritual"
import Hero from "@modules/home/components/hero"
import CollectionEdit from "@modules/home/components/collection-edit"
import Boutique from "@modules/home/components/boutique"
import ValueProps from "@modules/home/components/value-props"

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
      <ValueProps />
      <CollectionEdit />
      <Boutique products={products} />
      <Ritual />
    </>
  )
}
