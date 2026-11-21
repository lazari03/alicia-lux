"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useOptimistic, useTransition } from "react"

import SortProducts, { SortOptions } from "./sort-products"

export default function RefinementList({
  sortBy,
  "data-testid": dataTestId,
}: {
  sortBy: SortOptions
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useOptimistic(sortBy)

  const changeSort = (value: SortOptions) => {
    const params = new URLSearchParams(searchParams)
    params.set("sortBy", value)
    params.delete("page")

    startTransition(() => {
      setSelected(value)
      router.push(`${pathname}?${params}`, { scroll: false })
    })
  }

  return <SortProducts sortBy={selected} onChange={changeSort} pending={pending} data-testid={dataTestId} />
}
