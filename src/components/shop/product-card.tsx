import { LuxImage } from "@/components/ui/lux-image"
import Link from "next/link"
import { formatPrice } from "@/lib/money"
import type { Product } from "@/lib/types"
import { QuickAdd } from "./quick-add"

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const [main, hover] = product.images
  const soldOut = product.stock <= 0

  return (
    <article className="group relative text-center">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-card">
          {main && (
            <LuxImage
              src={main}
              alt={`${product.name} in ${product.subtitle ?? ""}`}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-[transform,opacity] duration-[1.1s] ease-lux group-hover:scale-[1.05]"
            />
          )}
          {hover && (
            <LuxImage
              src={hover}
              alt=""
              fill
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover opacity-0 transition-opacity duration-700 ease-lux [@media(hover:hover)]:group-hover:opacity-100"
            />
          )}
          {soldOut && (
            <span className="absolute top-3 left-3 bg-paper/90 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]">Sold out</span>
          )}
          {!soldOut && product.compare_at_ore && product.compare_at_ore > product.price_ore && (
            <span className="absolute top-3 left-3 bg-ink px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-paper">Sale</span>
          )}
        </div>
        <div className="mt-4 grid gap-1">
          <h3 className="font-serif text-xl leading-tight sm:text-[22px]">{product.name}</h3>
          <p className="flex items-center justify-center gap-2 text-[13px] text-muted">
            {product.swatch && <span className="size-2.5 rounded-full ring-1 ring-line-strong ring-offset-2 ring-offset-paper" style={{ background: product.swatch }} />}
            {product.subtitle}
          </p>
          <p className="text-sm">
            {product.compare_at_ore && product.compare_at_ore > product.price_ore && (
              <s className="mr-2 text-muted">{formatPrice(product.compare_at_ore)}</s>
            )}
            {formatPrice(product.price_ore)}
          </p>
        </div>
      </Link>
      {!soldOut && <QuickAdd product={product} />}
    </article>
  )
}
