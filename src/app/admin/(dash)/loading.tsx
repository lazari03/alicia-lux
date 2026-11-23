import { useTranslations } from "next-intl"
import { AdminSkeleton } from "@/components/ui/skeletons"

export default function Loading() {
  const t = useTranslations()
  return <AdminSkeleton label={t("common.loading")} />
}
