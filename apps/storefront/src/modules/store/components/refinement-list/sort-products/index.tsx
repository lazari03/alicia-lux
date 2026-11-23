"use client"

const sortOptions = {
  created_at: { label: "Newest", long: "Newest arrivals" },
  price_asc: { label: "Price ↑", long: "Price, low to high" },
  price_desc: { label: "Price ↓", long: "Price, high to low" },
}

export type SortOptions = keyof typeof sortOptions

/**
 * One-tap segmented control: every option is visible, the active one is
 * marked by a sliding pill. Arrow keys move between options (radio pattern).
 */
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
  const keys = Object.keys(sortOptions) as SortOptions[]
  const value: SortOptions = keys.includes(sortBy) ? sortBy : "created_at"
  const index = keys.indexOf(value)

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = keys[(index + step + keys.length) % keys.length]
    onChange(next)
    requestAnimationFrame(() =>
      (e.currentTarget.querySelector(`[data-value="${next}"]`) as HTMLElement | null)?.focus()
    )
  }

  return (
    <div className="lux-sort" data-testid={dataTestId}>
      <span className="lux-sort-label" id="sort-label">Sort</span>
      <div
        role="radiogroup"
        aria-labelledby="sort-label"
        aria-busy={pending}
        className="lux-segmented"
        style={{ "--count": keys.length, "--index": index } as React.CSSProperties}
        onKeyDown={onKeyDown}
      >
        <span className="lux-segmented-pill" aria-hidden="true" />
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={key === value}
            aria-label={sortOptions[key].long}
            tabIndex={key === value ? 0 : -1}
            data-value={key}
            onClick={() => key !== value && onChange(key)}
          >
            {sortOptions[key].label}
          </button>
        ))}
      </div>
    </div>
  )
}
