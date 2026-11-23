import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowRight } from "lucide-react"
import { Card, dateTime, PageHeader, StatusBadge } from "@/components/admin/ui"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { formatPrice } from "@/lib/money"
import { serviceClient } from "@/lib/supabase/admin"
import type { Order, Product } from "@/lib/types"

export async function generateMetadata() {
  return { title: (await getTranslations("admin.overview"))("title") }
}

export default async function Overview() {
  const t = await getTranslations("admin.overview")
  const db = serviceClient()
  const since = new Date(Date.now() - 30 * 86400_000).toISOString()
  const [{ data: series }, { data: paid }, { data: recent }, { data: toShip }, { data: lowStock }] = await Promise.all([
    db.rpc("sales_by_day", { p_days: 30 }),
    db.from("orders").select("total_ore").in("status", ["paid", "fulfilled"]).gte("paid_at", since),
    db.from("orders").select("*").neq("status", "pending").order("created_at", { ascending: false }).limit(6),
    db.from("orders").select("id", { count: "exact" }).eq("status", "paid"),
    db.from("products").select("id, name, subtitle, stock").lte("stock", 3).order("stock"),
  ])

  const revenue = (paid ?? []).reduce((n, o) => n + o.total_ore, 0)
  const orders = paid?.length ?? 0
  const stats = [
    { label: t("revenue"), value: formatPrice(revenue) },
    { label: t("orders"), value: String(orders) },
    { label: t("aov"), value: orders ? formatPrice(Math.round(revenue / orders)) : "—" },
    { label: t("toShip"), value: String(toShip?.length ?? 0), href: "/admin/orders?status=paid" },
  ]

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 sm:p-5">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-2 font-serif text-[clamp(24px,3vw,34px)] leading-none">{s.value}</p>
            {s.href && <Link href={s.href} className="mt-2 inline-flex items-center gap-1 text-xs text-gold-deep hover:underline">{t("view")} <ArrowRight className="size-3" /></Link>}
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <h2 className="mb-4 text-sm font-medium">{t("chart")}</h2>
        <RevenueChart data={(series ?? []) as { day: string; revenue_ore: number; orders: number }[]} />
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden p-0 sm:p-0">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-medium">{t("recent")}</h2>
            <Link href="/admin/orders" className="text-xs text-gold-deep hover:underline">{t("all")}</Link>
          </div>
          {recent?.length ? (
            <ul className="divide-y divide-line">
              {(recent as Order[]).map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 hover:bg-surface/60">
                    <span className="text-sm"><b className="font-medium">#{o.order_number}</b> · {o.first_name} {o.last_name}<span className="block text-xs text-muted">{dateTime(o.created_at)}</span></span>
                    <span className="flex items-center gap-3"><StatusBadge status={o.status} /><span className="w-24 text-right text-sm">{formatPrice(o.total_ore)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">{t("noOrders")}</p>
          )}
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-medium">{t("lowStock")}</h2>
          {lowStock?.length ? (
            <ul className="grid gap-2 text-sm">
              {(lowStock as Pick<Product, "id" | "name" | "subtitle" | "stock">[]).map((p) => (
                <li key={p.id} className="flex justify-between">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">{p.name}{p.subtitle ? ` — ${p.subtitle}` : ""}</Link>
                  <span className={p.stock === 0 ? "text-danger" : "text-gold-deep"}>{p.stock === 0 ? t("soldOut") : t("left", { count: p.stock })}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("wellStocked")}</p>
          )}
        </Card>
      </div>
    </>
  )
}
