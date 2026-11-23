import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  // `sv` is the ISO code for Swedish; its strings live in messages/se.json.
  locales: ["sv", "en"],
  defaultLocale: "sv",
  // Swedish has no prefix (/shop), English is /en/shop.
  localePrefix: "as-needed",
  // Always start in Swedish; visitors switch language explicitly.
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
export const messageFile: Record<Locale, string> = { sv: "se", en: "en" }
