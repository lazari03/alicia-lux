import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowLeft } from "lucide-react"
import { ProductForm } from "@/components/admin/product-form"
import { PageHeader } from "@/components/admin/ui"

export async function generateMetadata() {
  return { title: (await getTranslations("admin.products"))("newTitle") }
}

export default async function NewProduct() {
  const t = await getTranslations("admin.products")
  return (
    <>
      <Link href="/admin/products" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> {t("back")}</Link>
      <PageHeader title={t("newTitle")} />
      <ProductForm />
    </>
  )
}
