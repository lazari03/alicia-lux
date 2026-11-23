import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Card, PageHeader } from "@/components/admin/ui"
import { formatPrice } from "@/lib/money"
import { serviceClient } from "@/lib/supabase/admin"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

export const metadata = { title: "Products" }

export default async function ProductsPage() {
  const { data } = await serviceClient().from("products").select("*").order("sort_order").order("created_at")
  const products = (data ?? []) as Product[]

  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products · ${products.filter((p) => p.active).length} visible in the shop`}
        action={<Link href="/admin/products/new" className="btn btn-primary min-h-11"><Plus className="size-4" /> Add product</Link>}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <Link key={p.id} href={`/admin/products/${p.id}`} className="group">
            <Card className="flex h-full gap-4 p-4 transition-shadow group-hover:shadow-[0_16px_40px_-28px_rgb(31_25_21/0.45)] sm:p-4">
              <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded bg-surface">
                {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate font-serif text-xl leading-tight">{p.name}</p>
                {p.subtitle && <p className="text-sm text-muted">{p.subtitle}</p>}
                <p className="mt-1 text-sm">{formatPrice(p.price_ore)}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2 text-[11px]">
                  <span className={cn("rounded-full px-2 py-0.5", p.active ? "bg-[#e5f1e6] text-[#2f6b3a]" : "bg-surface text-muted")}>{p.active ? "Visible" : "Hidden"}</span>
                  <span className={cn("rounded-full px-2 py-0.5", p.stock === 0 ? "bg-[#f3e6e6] text-danger" : p.stock <= 3 ? "bg-[#fbf0dc] text-[#8a5a12]" : "bg-surface text-muted")}>
                    {p.stock === 0 ? "Sold out" : `${p.stock} in stock`}
                  </span>
                  {p.featured && <span className="rounded-full bg-surface px-2 py-0.5 text-gold-deep">Featured</span>}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {!products.length && <Card className="py-16 text-center text-sm text-muted">No products yet. Add your first one.</Card>}
    </>
  )
}
