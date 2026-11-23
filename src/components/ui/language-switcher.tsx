"use client"

import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"
import { getPathname, usePathname } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

/**
 * SV / EN toggle. Keeps the current page and query string, and does a full
 * page load so every component (and <html lang>) switches language together.
 */
export function LanguageSwitcher({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const [pending, start] = useTransition()

  const choose = (next: Locale) => {
    if (next === locale) return
    start(() => {
      const href = getPathname({ href: pathname, locale: next }) + window.location.search
      // Remember the choice for the admin dashboard and future visits.
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`
      window.location.assign(href)
    })
  }

  return (
    <div role="group" aria-label={t("common.language")} className={cn("inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.16em]", pending && "opacity-60", className)}>
      {routing.locales.map((l, i) => (
        <span key={l} className="inline-flex items-center gap-1">
          {i > 0 && <span aria-hidden className="opacity-40">/</span>}
          <button
            type="button"
            lang={l}
            onClick={() => choose(l)}
            aria-pressed={l === locale}
            aria-label={t(`languages.${l}`)}
            className={cn(
              "min-h-9 px-1 uppercase transition-colors",
              l === locale ? (tone === "dark" ? "text-gold-light" : "text-ink") : tone === "dark" ? "text-night-text hover:text-gold-light" : "text-muted hover:text-ink"
            )}
          >
            {l === "sv" ? "SV" : "EN"}
          </button>
        </span>
      ))}
    </div>
  )
}
