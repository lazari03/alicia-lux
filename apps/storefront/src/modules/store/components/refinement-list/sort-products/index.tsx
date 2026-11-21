"use client"

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"

const sortOptions = {
  created_at: "Newest arrivals",
  price_asc: "Price — low to high",
  price_desc: "Price — high to low",
}

export type SortOptions = keyof typeof sortOptions

export default function SortProducts({
  sortBy,
  onChange,
  pending,
  "data-testid": dataTestId,
}: {
  sortBy: SortOptions
  onChange: (value: SortOptions) => void
  pending: boolean
  "data-testid"?: string
}) {
  const value = Object.prototype.hasOwnProperty.call(sortOptions, sortBy) ? sortBy : "created_at"

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="lux-sort-menu" data-testid={dataTestId}>
        <ListboxButton className="lux-sort-trigger" aria-label={`Sort by: ${sortOptions[value]}`} aria-busy={pending}>
          <span className="lux-sort-icon" aria-hidden="true" />
          <span>{sortOptions[value]}</span>
          <span className="lux-sort-chevron" aria-hidden="true" />
        </ListboxButton>
        <ListboxOptions transition className="lux-sort-options">
          {(Object.keys(sortOptions) as SortOptions[]).map((option) => (
            <ListboxOption key={option} value={option} className="lux-sort-option">
              {sortOptions[option]}<span className="lux-sort-check" aria-hidden="true" />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
