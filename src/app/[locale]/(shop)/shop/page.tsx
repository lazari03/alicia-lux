import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Suspense } from "react"
import { ProductCard } from "@/components/shop/product-card"
import { SortControl } from "@/components/shop/sort-control"
import { Reveal } from "@/components/ui/reveal"
import { listProducts, type SortKey } from "@/lib/catalog"

export const dynamic = "force-dynamic"
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "shop" })
  return { title: t("metaTitle"), description: t("metaDescription") }
}

const sorts: SortKey[] = ["featured", "newest", "price-asc", "price-desc"]

export default async function ShopPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ sort?: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("shop")
  const { sort: raw } = await searchParams
  const sort = sorts.includes(raw as SortKey) ? (raw as SortKey) : "featured"
  const products = await listProducts(sort, locale)

  return (
    <div className="container-lux py-[clamp(36px,6vw,88px)]">
      <Reveal className="mb-8 grid justify-items-center gap-4 text-center">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="display text-[clamp(44px,6vw,80px)] leading-none">{t("title")}</h1>
        <p className="max-w-md text-[15px] leading-relaxed text-muted">{t("intro")}</p>
      </Reveal>

      <div className="mb-[clamp(28px,4vw,52px)] flex flex-col items-center justify-between gap-3 border-y border-line py-3 sm:flex-row">
        <p className="text-[13px] text-muted">{t("count", { count: products.length })}</p>
        <Suspense>
          <SortControl value={sort} />
        </Suspense>
      </div>

      {products.length ? (
        <ul className="grid grid-cols-2 gap-x-[clamp(14px,2.4vw,32px)] gap-y-12 md:grid-cols-3">
          {products.map((p, i) => (
            <Reveal key={p.id} as="li" index={i % 3}>
              <ProductCard product={p} priority={i < 2} />
            </Reveal>
          ))}
        </ul>
      ) : (
        <p className="py-20 text-center text-muted">{t("empty")}</p>
      )}
    </div>
  )
}
