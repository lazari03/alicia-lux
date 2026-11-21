"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { updateLocale } from "@lib/data/locale-actions"
import type { Locale } from "@lib/data/locales"

export default function LanguageSelect({
  locales,
  currentLocale,
}: {
  locales: Locale[]
  currentLocale: string | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const selected = locales.find((locale) => locale.code.toLowerCase() === currentLocale?.toLowerCase())

  return (
    <label className="lux-select">
      <span>Language</span>
      <select
        value={selected?.code ?? ""}
        disabled={pending}
        onChange={(event) => {
          const code = event.target.value
          startTransition(async () => {
            await updateLocale(code)
            router.refresh()
          })
        }}
      >
        <option value="">Default</option>
        {locales.map((locale) => <option key={locale.code} value={locale.code}>{locale.name}</option>)}
      </select>
    </label>
  )
}
