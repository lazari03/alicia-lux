import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block h-9 w-32 animate-pulse rounded-full bg-lux-sand" />
  }

  const onSale = selectedPrice.price_type === "sale"

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums text-lux-ink">
      <span className={onSale ? "font-serif text-3xl text-lux-gold" : "font-serif text-3xl"}>
        {!variant && <span className="mr-1.5 font-sans text-sm text-lux-muted">From</span>}
        <span data-testid="product-price" data-value={selectedPrice.calculated_price_number}>
          {selectedPrice.calculated_price}
        </span>
      </span>
      {onSale && (
        <>
          <s
            className="text-base text-lux-muted"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            <span className="sr-only">Original price </span>
            {selectedPrice.original_price}
          </s>
          <span className="rounded-full bg-lux-ink px-2.5 py-0.5 text-[11px] font-medium text-lux-paper">
            −{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
