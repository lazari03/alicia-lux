import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import { messageFile, routing, type Locale } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  // Storefront routes carry the locale in the URL. The admin (/admin) has no
  // locale segment, so it follows the visitor's last chosen language (cookie).
  const requested = await requestLocale
  let locale: Locale = routing.defaultLocale
  if (hasLocale(routing.locales, requested)) {
    locale = requested
  } else {
    const cookie = (await cookies()).get("NEXT_LOCALE")?.value
    if (hasLocale(routing.locales, cookie)) locale = cookie
  }
  return {
    locale,
    messages: (await import(`../../messages/${messageFile[locale]}.json`)).default,
    timeZone: "Europe/Stockholm",
  }
})
