import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const SORT_OPTIONS: SortOptions[] = ["created_at", "price_asc", "price_desc"]

/** Normalise untrusted `?page=` and `?sortBy=` query values. */
export function parseListingParams(page?: string, sortBy?: string) {
  const parsed = Number.parseInt(page ?? "", 10)

  return {
    pageNumber: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
    sort: SORT_OPTIONS.includes(sortBy as SortOptions)
      ? (sortBy as SortOptions)
      : ("created_at" as SortOptions),
  }
}
