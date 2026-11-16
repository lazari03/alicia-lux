import Image from "next/image"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import PreviewPrice from "./price"

const SIZES = "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"

/**
 * Product card. Render it as the direct child of an `<li>` inside
 * `.lux-grid` or `.lux-rail`: the list item owns the subgrid rows and the
 * container query, and hovering it reveals the alternate image.
 */
export default function ProductPreview({
  product,
  priority,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region?: HttpTypes.StoreRegion
  priority?: boolean
}) {
  const { cheapestPrice } = getProductPrice({ product })

  const main = product.thumbnail || product.images?.[0]?.url
  const alternate = product.images?.find((image) => image.url && image.url !== main)?.url
  const href = `/products/${product.handle}`
  const onSale = cheapestPrice?.price_type === "sale"

  return (
    <div className="lux-card" data-testid="product-wrapper">
      <LocalizedClientLink href={href} className="lux-card-media lux-card-link" aria-hidden="true" tabIndex={-1}>
        {onSale && <span className="lux-badge">−{cheapestPrice?.percentage_diff}%</span>}
        {main ? (
          <>
            <Image
              src={main}
              alt=""
              fill
              sizes={SIZES}
              quality={70}
              priority={priority}
              className="lux-card-main object-cover"
            />
            {alternate && (
              <Image src={alternate} alt="" fill sizes={SIZES} quality={70} className="lux-card-alt object-cover" />
            )}
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-lux-taupe">
            <PlaceholderImage size={24} />
          </span>
        )}
        <span className="lux-card-cta" aria-hidden="true">
          View piece
        </span>
      </LocalizedClientLink>

      <div className="lux-card-info">
        <h3 className="min-w-0 text-lux-ink">
          <LocalizedClientLink href={href} className="hover:underline hover:underline-offset-4" data-testid="product-title">
            {product.title}
          </LocalizedClientLink>
        </h3>
        {cheapestPrice && (
          <p className="flex shrink-0 items-baseline gap-2 tabular-nums">
            <PreviewPrice price={cheapestPrice} />
          </p>
        )}
      </div>
    </div>
  )
}
