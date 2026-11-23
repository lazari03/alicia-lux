import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

export default function NotFound() {
  const t = useTranslations("notFound")
  return (
    <div className="container-lux grid min-h-[60vh] place-content-center justify-items-center gap-5 py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display text-[clamp(40px,6vw,72px)] leading-none">{t("title")}</h1>
      <p className="max-w-sm text-muted">{t("body")}</p>
      <Link href="/shop" className="btn btn-primary">{t("cta")}</Link>
    </div>
  )
}
