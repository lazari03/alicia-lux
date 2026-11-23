import "server-only"
import { cache } from "react"
import { publicClient } from "./supabase/public"
import type { Locale } from "@/i18n/routing"
import type { Product, StoreSettings } from "./types"

/** Swaps in English copy on /en, falling back to Swedish when a field is empty. */
export function localize(p: Product, locale: Locale | string): Product {
  if (locale !== "en") return p
  return {
    ...p,
    name: p.name_en || p.name,
    subtitle: p.subtitle_en || p.subtitle,
    description: p.description_en || p.description,
    features: p.features_en?.length ? p.features_en : p.features,
  }
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest"

export const listProducts = cache(async (sort: SortKey = "featured", locale: string = "sv"): Promise<Product[]> => {
  const order: Record<SortKey, [string, boolean]> = {
    featured: ["sort_order", true],
    "price-asc": ["price_ore", true],
    "price-desc": ["price_ore", false],
    newest: ["created_at", false],
  }
  const [column, ascending] = order[sort] ?? order.featured
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .eq("active", true)
    .order(column, { ascending })
    .order("sort_order", { ascending: true })
  if (error) {
    console.error("listProducts", error.message)
    return []
  }
  return (data as Product[]).map((p) => localize(p, locale))
})

export const getProduct = cache(async (slug: string, locale: string = "sv"): Promise<Product | null> => {
  const { data, error } = await publicClient().from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle()
  if (error) console.error("getProduct", error.message)
  return data ? localize(data as Product, locale) : null
})

export const getSettings = cache(async (): Promise<StoreSettings> => {
  const { data } = await publicClient().from("store_settings").select("shipping_fee_ore, free_shipping_over_ore").maybeSingle()
  return (data as StoreSettings) ?? { shipping_fee_ore: 0, free_shipping_over_ore: null }
})
