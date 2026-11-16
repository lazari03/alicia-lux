import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-y-4">
      {product.collection ? (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="lux-eyebrow self-start hover:text-lux-ink"
        >
          {product.collection.title}
        </LocalizedClientLink>
      ) : (
        <p className="lux-eyebrow">Alicia Lux</p>
      )}
      <h1 className="lux-h2" data-testid="product-title">
        {product.title}
      </h1>
      {product.description && (
        <p className="lux-lede whitespace-pre-line" data-testid="product-description">
          {product.description}
        </p>
      )}
    </div>
  )
}

export default ProductInfo
