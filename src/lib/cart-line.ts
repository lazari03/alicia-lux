import type { Product } from "./types"

export const toCartLine = (p: Product) => ({
  productId: p.id,
  slug: p.slug,
  name: p.name,
  subtitle: p.subtitle,
  image: p.images[0] ?? null,
  priceOre: p.price_ore,
  maxQuantity: p.stock,
})
