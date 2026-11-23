import Link from "next/link"
import { getTranslations } from "next-intl/server"

/** Fallback 404 for URLs outside the storefront (e.g. unknown /admin paths). */
export default async function RootNotFound() {
  const t = await getTranslations("notFound")
  return (
    <main className="grid min-h-dvh place-content-center justify-items-center gap-5 px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display text-[clamp(40px,6vw,72px)] leading-none">{t("title")}</h1>
      <p className="max-w-sm text-muted">{t("body")}</p>
      <Link href="/" className="btn btn-primary">{t("cta")}</Link>
    </main>
  )
}
