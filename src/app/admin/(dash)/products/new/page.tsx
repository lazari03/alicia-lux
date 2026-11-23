import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProductForm } from "@/components/admin/product-form"
import { PageHeader } from "@/components/admin/ui"

export const metadata = { title: "New product" }

export default function NewProduct() {
  return (
    <>
      <Link href="/admin/products" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Products</Link>
      <PageHeader title="New product" />
      <ProductForm />
    </>
  )
}
