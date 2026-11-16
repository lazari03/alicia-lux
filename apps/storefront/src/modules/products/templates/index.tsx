import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div className="content-container pb-16 pt-5 small:pb-24 small:pt-8" data-testid="product-container">
        <nav aria-label="Breadcrumb" className="mb-5 text-[11px] uppercase tracking-label text-lux-muted small:mb-8">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <LocalizedClientLink href="/" className="hover:text-lux-ink">
                Home
              </LocalizedClientLink>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <LocalizedClientLink href="/store" className="hover:text-lux-ink">
                Shop all
              </LocalizedClientLink>
            </li>
            <li className="flex items-center gap-2 text-lux-ink" aria-current="page">
              <span aria-hidden="true" className="text-lux-muted">/</span>
              {product.title}
            </li>
          </ol>
        </nav>

        <div className="grid items-start gap-x-[clamp(2rem,5vw,5rem)] gap-y-8 small:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <ImageGallery images={images} title={product.title} />

          <div className="flex flex-col gap-y-8 small:sticky small:top-[calc(var(--header-h)+2rem)]">
            <ProductInfo product={product} />
            <ProductOnboardingCta />
            <Suspense
              fallback={
                <ProductActions disabled={true} product={product} region={region} />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
            <ProductTabs product={product} />
          </div>
        </div>
      </div>

      <div
        className="border-t border-lux-line bg-lux-cream py-16 small:py-24"
        data-testid="related-products-container"
      >
        <div className="content-container">
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default ProductTemplate
