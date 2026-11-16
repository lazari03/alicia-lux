import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default function Boutique({ products }: { products: HttpTypes.StoreProduct[] }) {
  return (
    <section className="border-y border-lux-line bg-lux-cream py-20 small:py-28" aria-labelledby="boutique-heading">
      <div className="content-container">
        <div className="lux-reveal mb-10 flex flex-wrap items-end justify-between gap-6 small:mb-14">
          <div>
            <p className="lux-eyebrow mb-4">Discover more</p>
            <h2 id="boutique-heading" className="lux-h2">
              Available in the <em>boutique.</em>
            </h2>
          </div>
          <LocalizedClientLink href="/store" className="lux-link">
            Shop all <span aria-hidden="true">→</span>
          </LocalizedClientLink>
        </div>

        {products.length ? (
          <ul className="lux-rail" data-testid="home-products">
            {products.map((product) => (
              <li key={product.id}>
                <ProductPreview product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-lux-muted">
            The boutique is being prepared. Discover our signature finishes above.
          </p>
        )}
      </div>
    </section>
  )
}
