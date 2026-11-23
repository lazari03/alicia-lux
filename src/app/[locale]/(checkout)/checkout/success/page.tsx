import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { CheckCircle2, Clock } from "lucide-react"
import { ClearCart } from "@/components/checkout/clear-cart"
import { TrackOnMount } from "@/components/analytics/pageviews"
import { formatPrice } from "@/lib/money"
import { stripe } from "@/lib/stripe"
import { serviceClient } from "@/lib/supabase/admin"
import type { Order, OrderItem } from "@/lib/types"

export const dynamic = "force-dynamic"
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale, namespace: "success" })
  return { title: t("metaTitle"), robots: { index: false } }
}

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ order?: string; payment_intent?: string }> }

/**
 * Requires both the order id and its PaymentIntent id, so confirmations
 * can't be browsed by guessing. If the webhook hasn't arrived yet, this page
 * completes the order itself (complete_order is idempotent).
 */
export default async function SuccessPage({ params, searchParams }: Props) {
  setRequestLocale((await params).locale)
  const t = await getTranslations("success")
  const tc = await getTranslations("checkout")
  const { order: orderId, payment_intent: intentId } = await searchParams
  const valid = orderId && /^[0-9a-f-]{36}$/i.test(orderId) && intentId && /^pi_[A-Za-z0-9]+$/.test(intentId)
  if (!valid) return <Problem title={t("notFound")} />

  const db = serviceClient()
  const { data } = await db.from("orders").select("*, order_items(*)").eq("id", orderId).maybeSingle()
  const order = data as (Order & { order_items: OrderItem[] }) | null
  if (!order || order.stripe_payment_intent_id !== intentId) return <Problem title={t("notFound")} />

  let status = order.status
  if (status === "pending") {
    const intent = await stripe().paymentIntents.retrieve(intentId).catch(() => null)
    if (intent?.status === "succeeded") {
      const { error } = await db.rpc("complete_order", { p_payment_intent: intentId, p_amount: intent.amount_received })
      if (!error) status = "paid"
    } else if (intent?.status === "requires_payment_method" || intent?.status === "canceled") {
      return <Problem title={t("failedTitle")} body={t("failedBody")} retry />
    }
  }
  const paid = status !== "pending"

  return (
    <div className="container-lux max-w-3xl py-[clamp(44px,8vw,104px)]">
      {paid && <ClearCart />}
      {paid && <TrackOnMount event="purchase" valueOre={order.total_ore} />}
      <div className="text-center">
        {paid ? (
          <CheckCircle2 className="mx-auto mb-5 size-12 text-gold" strokeWidth={1} />
        ) : (
          <Clock className="mx-auto mb-5 size-12 text-gold" strokeWidth={1} />
        )}
        <p className="eyebrow mb-3">{t("order", { number: order.order_number })}</p>
        <h1 className="display text-[clamp(40px,6vw,72px)] leading-none">
          {paid ? t.rich("thanks", { name: order.first_name, em: (c) => <em className="text-gold-deep">{c}</em> }) : t("processingTitle")}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          {paid
            ? t("confirmed", { email: order.email })
            : t("processing")}
        </p>
      </div>

      <div className="mt-12 rounded-md border border-line bg-card p-6 sm:p-8">
        <ul className="grid gap-4">
          {order.order_items.map((item) => (
            <li key={item.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] bg-surface">
                {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div>
                <p className="font-serif text-lg leading-tight">{item.name}</p>
                <p className="text-[13px] text-muted">{t("qty", { count: item.quantity })}</p>
              </div>
              <p className="text-sm">{formatPrice(item.unit_price_ore * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 grid gap-2 border-t border-line pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">{tc("subtotal")}</dt><dd>{formatPrice(order.subtotal_ore)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{tc("delivery")}</dt><dd>{order.shipping_ore ? formatPrice(order.shipping_ore) : tc("free")}</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-base"><dt>{tc("total")}</dt><dd className="font-serif text-2xl">{formatPrice(order.total_ore)}</dd></div>
          <p className="text-right text-xs text-muted">{tc("inclVat", { amount: formatPrice(order.vat_ore) })}</p>
        </dl>
        <div className="mt-6 border-t border-line pt-5 text-sm">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted">{t("deliveringTo")}</p>
          <p>{order.first_name} {order.last_name}</p>
          <p className="text-muted">{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ""}, {order.postal_code} {order.city}</p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop" className="btn btn-ghost">{t("continueShopping")}</Link>
      </div>
    </div>
  )
}

async function Problem({ title, body, retry }: { title: string; body?: string; retry?: boolean }) {
  const t = await getTranslations("success")
  return (
    <div className="container-lux grid min-h-[60vh] place-content-center justify-items-center gap-5 py-20 text-center">
      <h1 className="display text-[clamp(36px,5vw,60px)] leading-none">{title}</h1>
      {body && <p className="max-w-md text-muted">{body}</p>}
      <Link href={retry ? "/checkout" : "/shop"} className="btn btn-primary">{retry ? t("retry") : t("goShop")}</Link>
    </div>
  )
}
