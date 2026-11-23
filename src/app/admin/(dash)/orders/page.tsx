import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Card, dateTime, PageHeader, StatusBadge } from "@/components/admin/ui"
import { formatPrice } from "@/lib/money"
import { serviceClient } from "@/lib/supabase/admin"
import type { Order, OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export async function generateMetadata() {
  return { title: (await getTranslations("admin.orders"))("title") }
}

const filters: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "all", label: "all", statuses: ["paid", "fulfilled", "cancelled", "refunded"] },
  { key: "paid", label: "paid", statuses: ["paid"] },
  { key: "fulfilled", label: "fulfilled", statuses: ["fulfilled"] },
  { key: "cancelled", label: "cancelled", statuses: ["cancelled", "refunded"] },
  { key: "pending", label: "pending", statuses: ["pending"] },
]

const PAGE = 25

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const { status = "all", q = "", page = "1" } = await searchParams
  const t = await getTranslations("admin.orders")
  const filter = filters.find((f) => f.key === status) ?? filters[0]
  const pageNo = Math.max(1, Number(page) || 1)

  let query = serviceClient()
    .from("orders")
    .select("*", { count: "exact" })
    .in("status", filter.statuses)
    .order("created_at", { ascending: false })
    .range((pageNo - 1) * PAGE, pageNo * PAGE - 1)

  const term = q.trim().replace(/[%,()]/g, "")
  if (term) {
    query = /^\d+$/.test(term)
      ? query.eq("order_number", Number(term))
      : query.or(`email.ilike.%${term}%,last_name.ilike.%${term}%,first_name.ilike.%${term}%`)
  }
  const { data, count } = await query
  const orders = (data ?? []) as Order[]
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE))
  const href = (p: Record<string, string>) => `/admin/orders?${new URLSearchParams({ status, ...(q && { q }), ...p })}`

  return (
    <>
      <PageHeader title={t("title")} description={t("count", { count: count ?? 0, filter: t(`filters.${filter.label}`) })} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-line bg-card p-1">
          {filters.map((f) => (
            <Link key={f.key} href={`/admin/orders?status=${f.key}`} className={cn("min-h-9 shrink-0 rounded-full px-4 py-2 text-[13px]", f.key === filter.key ? "bg-ink text-paper" : "text-muted hover:text-ink")}>
              {t(`filters.${f.label}`)}
            </Link>
          ))}
        </div>
        <form className="flex gap-2">
          <input type="hidden" name="status" value={filter.key} />
          <input name="q" defaultValue={q} placeholder={t("search")} className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm sm:w-64" />
        </form>
      </div>

      <Card className="overflow-hidden p-0 sm:p-0">
        {orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line bg-surface/50 text-left text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-normal">{t("order")}</th>
                  <th className="px-5 py-3 font-normal">{t("customer")}</th>
                  <th className="px-5 py-3 font-normal">{t("date")}</th>
                  <th className="px-5 py-3 font-normal">{t("status")}</th>
                  <th className="px-5 py-3 text-right font-normal">{t("total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="relative cursor-pointer hover:bg-surface/50">
                    <td className="px-5 py-3.5 font-medium"><Link href={`/admin/orders/${o.id}`} className="after:absolute after:inset-0">#{o.order_number}</Link></td>
                    <td className="px-5 py-3.5">{o.first_name} {o.last_name}<span className="block text-xs text-muted">{o.email}</span></td>
                    <td className="px-5 py-3.5 text-muted">{dateTime(o.created_at)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-right">{formatPrice(o.total_ore)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-16 text-center text-sm text-muted">{t("none")}</p>
        )}
      </Card>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">{t("pageOf", { page: pageNo, pages })}</span>
          <div className="flex gap-2">
            {pageNo > 1 && <Link href={href({ page: String(pageNo - 1) })} className="btn btn-ghost min-h-10 px-4">{t("previous")}</Link>}
            {pageNo < pages && <Link href={href({ page: String(pageNo + 1) })} className="btn btn-ghost min-h-10 px-4">{t("next")}</Link>}
          </div>
        </div>
      )}
    </>
  )
}
