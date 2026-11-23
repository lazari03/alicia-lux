import { useTranslations } from "next-intl"
import { ShopSkeleton } from "@/components/ui/skeletons"

export default function Loading() {
  const t = useTranslations()
  return <ShopSkeleton label={t("loading.products")} />
}
