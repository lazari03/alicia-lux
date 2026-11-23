import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { RotateCcw, ShieldCheck, Truck } from "lucide-react"
import { AddToCart } from "@/components/shop/add-to-cart"
import { ProductCard } from "@/components/shop/product-card"
import { ProductGallery } from "@/components/shop/product-gallery"
import { Reveal } from "@/components/ui/reveal"
import { getProduct, getSettings, listProducts } from "@/lib/catalog"
import { formatPrice } from "@/lib/money"
import { productTitle } from "@/lib/types"
import { cn, siteUrl } from "@/lib/utils"

export const dynamic = "force-dynamic"
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug)
  if (!product) return {}
  return {
    title: productTitle(product),
    description: product.description.slice(0, 160),
    openGraph: { images: product.images.slice(0, 1) },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const [product, all, settings] = await Promise.all([getProduct(slug), listProducts(), getSettings()])
  if (!product) notFound()

  const siblings = all.filter((p) => p.name === product.name)
  const others = all.filter((p) => p.id !== product.id).slice(0, 3)
  const onSale = product.compare_at_ore && product.compare_at_ore > product.price_ore

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productTitle(product),
    description: product.description,
    image: product.images.map((src) => (src.startsWith("http") ? src : `${siteUrl()}${src}`)),
    brand: { "@type": "Brand", name: "Alicia Lux" },
    offers: {
      "@type": "Offer",
      price: (product.price_ore / 100).toFixed(2),
      priceCurrency: "SEK",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl()}/product/${product.slug}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-lux py-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-muted">
          <Link href="/shop" className="hover:text-ink">Shop</Link> <span aria-hidden>/</span> <span className="text-ink">{productTitle(product)}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <ProductGallery images={product.images} alt={`${productTitle(product)} by Alicia Lux`} />

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow mb-3">Alicia Lux</p>
            <h1 className="display text-[clamp(36px,4.4vw,60px)] leading-[1.02]">{product.name}</h1>
            {product.subtitle && <p className="mt-2 font-serif text-2xl italic text-gold-deep">{product.subtitle}</p>}

            <p className="mt-5 text-xl">
              {onSale && <s className="mr-3 text-muted">{formatPrice(product.compare_at_ore!)}</s>}
              {formatPrice(product.price_ore)}
              <span className="ml-2 text-xs text-muted">incl. VAT</span>
            </p>

            {siblings.length > 1 && (
              <div className="mt-7">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
                  Finish — <span className="text-ink">{product.subtitle}</span>
                </p>
                <div className="flex gap-3">
                  {siblings.map((s) => (
                    <Link
                      key={s.id}
                      href={`/product/${s.slug}`}
                      aria-label={s.subtitle ?? s.name}
                      aria-current={s.id === product.id ? "true" : undefined}
                      className={cn(
                        "size-10 rounded-full ring-1 ring-offset-[3px] ring-offset-paper transition-shadow",
                        s.id === product.id ? "ring-ink" : "ring-line-strong hover:ring-muted"
                      )}
                      style={{ background: s.swatch ?? "#ccc" }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8"><AddToCart product={product} /></div>

            <p className="mt-8 text-[15px] leading-[1.85] text-muted">{product.description}</p>

            {product.features.length > 0 && (
              <ul className="mt-6 grid gap-2.5 border-t border-line pt-6 text-[14px]">
                {product.features.map((f) => (
                  <li key={f} className="flex gap-3"><span className="text-gold">—</span>{f}</li>
                ))}
              </ul>
            )}

            <ul className="mt-8 grid gap-3 rounded-[4px] bg-surface p-5 text-[13px]">
              <li className="flex items-center gap-3"><Truck className="size-4 text-gold-deep" strokeWidth={1.5} />
                {settings.shipping_fee_ore === 0 ? "Free delivery within Sweden" : `Delivery within Sweden ${formatPrice(settings.shipping_fee_ore)}`}
                {settings.free_shipping_over_ore != null && settings.shipping_fee_ore > 0 && ` · free over ${formatPrice(settings.free_shipping_over_ore)}`}
              </li>
              <li className="flex items-center gap-3"><RotateCcw className="size-4 text-gold-deep" strokeWidth={1.5} />14-day right of withdrawal — <Link href="/policies/returns" className="underline underline-offset-4">returns</Link></li>
              <li className="flex items-center gap-3"><ShieldCheck className="size-4 text-gold-deep" strokeWidth={1.5} />Secure payment with Stripe</li>
            </ul>
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <section className="border-t border-line bg-surface py-[clamp(56px,8vw,104px)]">
          <div className="container-lux">
            <Reveal className="mb-10 text-center">
              <h2 className="display text-[clamp(34px,4vw,52px)]">You may also love</h2>
            </Reveal>
            <ul className="grid grid-cols-2 gap-x-[clamp(14px,2.4vw,32px)] gap-y-12 md:grid-cols-3">
              {others.map((p, i) => (
                <Reveal key={p.id} as="li" index={i}><ProductCard product={p} /></Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
