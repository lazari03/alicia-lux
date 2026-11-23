import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"
import { Card, PageHeader } from "@/components/admin/ui"
import { VisitorsChart } from "@/components/admin/visitors-chart"
import { formatPrice } from "@/lib/money"
import { serviceClient } from "@/lib/supabase/admin"
import { cn } from "@/lib/utils"

export async function generateMetadata() {
  return { title: (await getTranslations("admin.analytics"))("title") }
}

type Row = { key: string; visitors: number }
type Report = {
  visitors: number
  pageviews: number
  orders: number
  revenue: number
  series: { day: string; visitors: number; pageviews: number }[]
  funnel: Record<"visitors" | "product_view" | "add_to_cart" | "begin_checkout" | "purchase", number>
  breakdowns: Partial<Record<"country" | "city" | "page" | "source" | "campaign" | "device" | "browser" | "os" | "language", Row[]>>
  customers: {
    total: number
    repeat: number
    aov: number
    top_cities: { key: string; orders: number; revenue: number }[]
    top: { name: string; email: string; orders: number; revenue: number }[]
  }
}

const ranges = [{ key: "7" }, { key: "30" }, { key: "90" }, { key: "365" }] as const
const flag = (code: string) =>
  /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "🌐"
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—")

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range: raw = "30" } = await searchParams
  const range = ranges.find((r) => r.key === raw) ?? ranges[1]
  const t = await getTranslations("admin.analytics")
  const locale = await getLocale()
  const regionNames = new Intl.DisplayNames([locale], { type: "region" })
  const languageNames = new Intl.DisplayNames([locale], { type: "language" })
  // The report uses "??", "Unknown" and "Direct" as placeholder keys.
  const common = (k: string) => (k === "Unknown" || k === "??" ? t("unknown") : k === "Direct" ? t("direct") : null)
  const countryLabel = (code: string) => {
    if (code === "??") return `🌐 ${t("unknown")}`
    try {
      return `${flag(code)} ${regionNames.of(code) ?? code}`
    } catch {
      return code
    }
  }
  const languageLabel = (code: string) => {
    if (common(code)) return common(code)!
    try {
      return languageNames.of(code) ?? code
    } catch {
      return code
    }
  }
  const plain = (k: string) => common(k) ?? k
  const deviceLabel = (k: string) => (["mobile", "tablet", "desktop"].includes(k) ? t(`device.${k}`) : plain(k))
  const from = new Date(Date.now() - Number(range.key) * 86400_000)
  from.setHours(0, 0, 0, 0)

  const { data, error } = await serviceClient().rpc("analytics_report", { p_from: from.toISOString() })
  if (error || !data) {
    return (
      <>
        <PageHeader title={t("title")} />
        <Card className="text-sm text-muted">
          {t.rich("notReady", { code: (c) => <code className="rounded bg-surface px-1.5 py-0.5">{c}</code> })}
          {error && <span className="mt-2 block text-xs">({error.message})</span>}
        </Card>
      </>
    )
  }
  const r = data as Report
  const b = r.breakdowns ?? {}

  const stats = [
    { label: t("visitors"), value: r.visitors.toLocaleString("sv-SE") },
    { label: t("pageviews"), value: r.pageviews.toLocaleString("sv-SE") },
    { label: t("orders"), value: r.orders.toLocaleString("sv-SE") },
    { label: t("conversion"), value: pct(r.orders, r.visitors) },
    { label: t("revenue"), value: formatPrice(r.revenue) },
  ]

  const funnel = [
    { label: t("funnelVisited"), value: r.funnel.visitors },
    { label: t("funnelProduct"), value: r.funnel.product_view },
    { label: t("funnelCart"), value: r.funnel.add_to_cart },
    { label: t("funnelCheckout"), value: r.funnel.begin_checkout },
    { label: t("funnelPurchase"), value: r.funnel.purchase },
  ]

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <div className="flex gap-1 rounded-full border border-line bg-card p-1">
            {ranges.map((x) => (
              <Link key={x.key} href={`/admin/analytics?range=${x.key}`} className={cn("rounded-full px-3.5 py-1.5 text-[13px]", x.key === range.key ? "bg-ink text-paper" : "text-muted hover:text-ink")}>
                {t(`ranges.${x.key}`)}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 sm:p-5">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-2 font-serif text-[clamp(24px,3vw,34px)] leading-none">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium">{t("perDay")}</h2>
          <span className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-gold-deep" /> {t("visitors")}</span>
            <span className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-line-strong" /> {t("pageviews")}</span>
          </span>
        </div>
        <VisitorsChart data={r.series} />
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-medium">{t("funnel")}</h2>
          <ol className="grid gap-3">
            {funnel.map((step, i) => {
              const width = funnel[0].value ? Math.max(2, (step.value / funnel[0].value) * 100) : 0
              return (
                <li key={step.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{step.label}</span>
                    <span className="tabular-nums">
                      {step.value.toLocaleString("sv-SE")}
                      {i > 0 && <span className="ml-2 text-xs text-muted">{pct(step.value, funnel[i - 1].value)}</span>}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface"><div className="h-2 rounded-full bg-gold" style={{ width: `${width}%` }} /></div>
                </li>
              )
            })}
          </ol>
        </Card>
        <Breakdown t={t} title={t("countries")} rows={b.country} label={countryLabel} total={r.visitors} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Breakdown t={t} title={t("cities")} rows={b.city} label={plain} total={r.visitors} empty={t("citiesEmpty")} />
        <Breakdown t={t} title={t("sources")} rows={b.source} label={plain} total={r.visitors} />
        <Breakdown t={t} title={t("pages")} rows={b.page} total={r.visitors} />
        <Breakdown t={t} title={t("devices")} rows={b.device} total={r.visitors} label={deviceLabel} />
        <Breakdown t={t} title={t("browsers")} rows={b.browser} label={plain} total={r.visitors} />
        <Breakdown t={t} title={t("os")} rows={b.os} label={plain} total={r.visitors} />
        <Breakdown t={t} title={t("languages")} rows={b.language} total={r.visitors} label={languageLabel} />
        <Breakdown t={t} title={t("campaigns")} rows={b.campaign} total={r.visitors} empty={t("campaignsEmpty")} />
      </div>

      <h2 className="mt-10 mb-4 font-serif text-3xl">{t("customers")}</h2>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: t("customersTotal"), value: r.customers.total.toLocaleString("sv-SE") },
          { label: t("returning"), value: r.customers.repeat.toLocaleString("sv-SE") },
          { label: t("repeatRate"), value: pct(r.customers.repeat, r.customers.total) },
          { label: t("aov"), value: r.customers.aov ? formatPrice(r.customers.aov) : "—" },
        ].map((s) => (
          <Card key={s.label} className="p-4 sm:p-5">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-2 font-serif text-[clamp(24px,3vw,34px)] leading-none">{s.value}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-medium">{t("byCity")}</h2>
          {r.customers.top_cities.length ? (
            <ul className="grid gap-2 text-sm">
              {r.customers.top_cities.map((c) => (
                <li key={c.key} className="flex justify-between gap-3"><span>{c.key}</span><span className="text-muted">{c.orders} · {formatPrice(c.revenue)}</span></li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">{t("noOrders")}</p>}
        </Card>
        <Card>
          <h2 className="mb-4 text-sm font-medium">{t("topCustomers")}</h2>
          {r.customers.top.length ? (
            <ul className="grid gap-2 text-sm">
              {r.customers.top.map((c) => (
                <li key={c.email} className="flex justify-between gap-3">
                  <Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="min-w-0 truncate hover:underline">{c.name}<span className="ml-2 text-xs text-muted">{c.email}</span></Link>
                  <span className="shrink-0 text-muted">{c.orders} · {formatPrice(c.revenue)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">{t("noOrders")}</p>}
        </Card>
      </div>
    </>
  )
}

function Breakdown({ t, title, rows = [], total, label = (k: string) => k, empty }: { t: (key: "visitors" | "noData") => string; title: string; rows?: Row[]; total: number; label?: (k: string) => string; empty?: string }) {
  const max = rows[0]?.visitors ?? 0
  return (
    <Card>
      <h2 className="mb-4 flex justify-between text-sm font-medium">{title}<span className="text-xs font-normal text-muted">{t("visitors")}</span></h2>
      {rows.length ? (
        <ul className="grid gap-1.5">
          {rows.map((row) => (
            <li key={row.key} className="relative flex justify-between gap-3 overflow-hidden rounded px-2 py-1.5 text-sm">
              <span className="absolute inset-y-0 left-0 rounded bg-surface" style={{ width: `${max ? (row.visitors / max) * 100 : 0}%` }} />
              <span className="relative min-w-0 truncate">{label(row.key)}</span>
              <span className="relative shrink-0 tabular-nums text-muted">{row.visitors.toLocaleString("sv-SE")} <span className="text-xs">({pct(row.visitors, total)})</span></span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{empty ?? t("noData")}</p>
      )}
    </Card>
  )
}
