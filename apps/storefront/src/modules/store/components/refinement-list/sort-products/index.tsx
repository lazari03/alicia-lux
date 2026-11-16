"use client"

import { useId } from "react"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

const sortOptions: { value: SortOptions; label: string }[] = [
  { value: "created_at", label: "Latest arrivals" },
  { value: "price_asc", label: "Price, low to high" },
  { value: "price_desc", label: "Price, high to low" },
]

const SortProducts = ({ "data-testid": dataTestId, sortBy, setQueryParams }: SortProductsProps) => {
  const id = useId()

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="hidden text-[11px] uppercase tracking-label text-lux-muted xsmall:block">
        Sort by
      </label>
      <span className="lux-select min-w-[11.5rem]">
        <select
          id={id}
          value={sortBy}
          aria-label="Sort products"
          data-testid={dataTestId}
          onChange={(event) => setQueryParams("sortBy", event.target.value as SortOptions)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}

export default SortProducts
