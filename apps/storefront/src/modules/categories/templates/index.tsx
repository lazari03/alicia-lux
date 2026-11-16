import { notFound } from "next/navigation"
import { Suspense } from "react"

import { parseListingParams } from "@lib/util/listing-params"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import ListingHeader from "@modules/store/components/listing-header"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  if (!category || !countryCode) notFound()

  const { pageNumber, sort } = parseListingParams(page, sortBy)

  // Root-first list of ancestors for the breadcrumb.
  const parents: HttpTypes.StoreProductCategory[] = []
  let parent = category.parent_category
  while (parent) {
    parents.unshift(parent)
    parent = parent.parent_category
  }

  const children = category.category_children ?? []

  return (
    <div data-testid="category-container">
      <ListingHeader
        eyebrow="Category"
        title={category.name}
        description={category.description}
        titleTestId="category-page-title"
        crumbs={[
          { label: "Shop all", href: "/store" },
          ...parents.map((p) => ({ label: p.name, href: `/categories/${p.handle}` })),
          { label: category.name },
        ]}
      >
        {children.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {children.map((c) => (
              <li key={c.id}>
                <LocalizedClientLink href={`/categories/${c.handle}`} className="lux-pill">
                  {c.name}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        )}
      </ListingHeader>
      <div className="content-container py-10 small:py-14">
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={category.products?.length ?? 8} />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
