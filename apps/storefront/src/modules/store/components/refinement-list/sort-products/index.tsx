"use client"

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
  return (
    <label className="lux-select lux-sort" data-testid={dataTestId}>
      <span>Sort by</span>
      <select
        value={Object.prototype.hasOwnProperty.call(sortOptions, sortBy) ? sortBy : "created_at"}
        onChange={(event) => onChange(event.target.value as SortOptions)}
        aria-busy={pending}
      >
        {Object.entries(sortOptions).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </label>
  )
}
