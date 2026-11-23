import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
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
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="content-container lux-catalog-page"
      data-testid="category-container"
    >
      <div className="w-full">
        <div className="lux-collection-intro">
          <p className="lux-eyebrow">Alicia Lux</p>
          <h1 className="lux-display" data-testid="store-page-title">The collection</h1>
        </div>
        <div className="lux-toolbar">
          <RefinementList sortBy={sort} data-testid="sort-by-container" />
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
