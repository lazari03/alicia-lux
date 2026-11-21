"use client"

import { useParams, usePathname } from "next/navigation"
import { useTransition } from "react"
import type { HttpTypes } from "@medusajs/types"
import { updateRegion } from "@lib/data/cart"

export default function CountrySelect({ regions }: { regions: HttpTypes.StoreRegion[] }) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  const countries = regions
    .flatMap((region) => region.countries ?? [])
    .filter((country) => country.iso_2)
    .sort((a, b) => (a.display_name ?? "").localeCompare(b.display_name ?? ""))
  const selected = countries.some((country) => country.iso_2 === countryCode)

  return (
    <label className="lux-select">
      <span>Ship to</span>
      <select
        value={selected ? countryCode : ""}
        disabled={pending}
        onChange={(event) => {
          const country = event.target.value
          const path = pathname.slice(countryCode.length + 1)
          startTransition(() => updateRegion(country, path))
        }}
      >
        {selected ? null : <option value="" disabled>Select country</option>}
        {countries.map((country) => (
          <option key={country.iso_2} value={country.iso_2 ?? ""}>
            {country.display_name ?? country.iso_2}
          </option>
        ))}
      </select>
    </label>
  )
}
