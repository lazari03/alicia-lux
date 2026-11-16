import { VariantPrice } from "types/global"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  const onSale = price.price_type === "sale"

  return (
    <>
      {onSale && (
        <s className="text-lux-muted" data-testid="original-price">
          <span className="sr-only">Original price </span>
          {price.original_price}
        </s>
      )}
      <span className={onSale ? "text-lux-gold" : "text-lux-muted"} data-testid="price">
        {price.calculated_price}
      </span>
    </>
  )
}
