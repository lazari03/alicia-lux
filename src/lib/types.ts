export type Product = {
  id: string
  slug: string
  name: string
  subtitle: string | null
  description: string
  features: string[]
  name_en: string | null
  subtitle_en: string | null
  description_en: string | null
  features_en: string[]
  price_ore: number
  compare_at_ore: number | null
  images: string[]
  swatch: string | null
  stock: number
  active: boolean
  featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type OrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded"

export type Order = {
  id: string
  order_number: number
  status: OrderStatus
  email: string
  first_name: string
  last_name: string
  phone: string | null
  address_line1: string
  address_line2: string | null
  postal_code: string
  city: string
  country: string
  subtotal_ore: number
  shipping_ore: number
  total_ore: number
  vat_ore: number
  currency: string
  stripe_payment_intent_id: string | null
  tracking_number: string | null
  note: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
  fulfilled_at: string | null
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string | null
  name: string
  image: string | null
  unit_price_ore: number
  quantity: number
}

export type StoreSettings = {
  shipping_fee_ore: number
  free_shipping_over_ore: number | null
}

export const productTitle = (p: Pick<Product, "name" | "subtitle">) =>
  p.subtitle ? `${p.name} — ${p.subtitle}` : p.name
