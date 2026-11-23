import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { ProductForm } from "@/components/admin/product-form"
import { PageHeader } from "@/components/admin/ui"
import { serviceClient } from "@/lib/supabase/admin"
import type { Product } from "@/lib/types"

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const { data } = await serviceClient().from("products").select("*").eq("id", id).maybeSingle()
  if (!data) notFound()
  const product = data as Product

  return (
    <>
      <Link href="/admin/products" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Products</Link>
      <PageHeader
        title={product.subtitle ? `${product.name} — ${product.subtitle}` : product.name}
        action={product.active ? <a href={`/product/${product.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-gold-deep hover:underline">View in shop <ExternalLink className="size-3.5" /></a> : undefined}
      />
      <ProductForm product={product} />
    </>
  )
}
