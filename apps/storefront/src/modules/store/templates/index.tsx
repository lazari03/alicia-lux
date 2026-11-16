import { Suspense } from "react"

import { parseListingParams } from "@lib/util/listing-params"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import ListingHeader from "@modules/store/components/listing-header"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const { pageNumber, sort } = parseListingParams(page, sortBy)

  return (
    <div data-testid="category-container">
      <ListingHeader
        eyebrow="The Alicia Lux boutique"
        title="The collection."
        crumbs={[{ label: "Shop all" }]}
        titleTestId="store-page-title"
      />
      <div className="content-container py-10 small:py-14">
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts sortBy={sort} page={pageNumber} countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
