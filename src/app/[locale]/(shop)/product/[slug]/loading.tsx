import { useTranslations } from "next-intl"
import { ProductSkeleton } from "@/components/ui/skeletons"

export default function Loading() {
  const t = useTranslations()
  return <ProductSkeleton label={t("loading.product")} />
}
