import { Suspense } from "react"

import { parseListingParams } from "@lib/util/listing-params"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import ListingHeader from "@modules/store/components/listing-header"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const { pageNumber, sort } = parseListingParams(page, sortBy)

  return (
    <div>
      <ListingHeader
        eyebrow="Collection"
        title={collection.title}
        crumbs={[{ label: "Shop all", href: "/store" }, { label: collection.title }]}
      />
      <div className="content-container py-10 small:py-14">
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={collection.products?.length} />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
