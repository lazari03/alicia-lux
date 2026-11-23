"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error")
  return (
    <div className="container-lux grid min-h-[60vh] place-content-center justify-items-center gap-5 py-20 text-center">
      <h1 className="display text-[clamp(36px,5vw,60px)] leading-none">{t("title")}</h1>
      <p className="max-w-md text-muted">{t("body")}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">{t("retry")}</button>
        <Link href="/" className="btn btn-ghost">{t("home")}</Link>
      </div>
    </div>
  )
}
