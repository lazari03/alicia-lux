"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import SortProducts, { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  "data-testid"?: string
}

/** Collection toolbar controls. Sorting resets pagination to the first page. */
const RefinementList = ({ sortBy, "data-testid": dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryParams = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set(name, value)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} data-testid={dataTestId} />
}

export default RefinementList
