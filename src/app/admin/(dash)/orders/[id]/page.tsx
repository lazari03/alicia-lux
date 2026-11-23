import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { OrderActions } from "@/components/admin/order-actions"
import { Card, dateTime, StatusBadge } from "@/components/admin/ui"
import { formatPrice } from "@/lib/money"
import { serviceClient } from "@/lib/supabase/admin"
import type { Order, OrderItem } from "@/lib/types"

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const { data } = await serviceClient().from("orders").select("*, order_items(*)").eq("id", id).maybeSingle()
  if (!data) notFound()
  const order = data as Order & { order_items: OrderItem[] }
  const stripeMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test") || process.env.STRIPE_SECRET_KEY?.startsWith("rk_test") ? "test/" : ""

  return (
    <>
      <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Orders</Link>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-4xl leading-none">Order #{order.order_number}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted">{dateTime(order.created_at)}</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="grid content-start gap-4">
          <Card>
            <h2 className="mb-4 text-sm font-medium">Items</h2>
            <ul className="divide-y divide-line">
              {order.order_items.map((item) => (
                <li key={item.id} className="grid grid-cols-[56px_1fr_auto] items-center gap-4 py-3">
                  <div className="relative aspect-[4/5] overflow-hidden rounded bg-surface">
                    {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="text-sm">
                    {item.product_id ? <Link href={`/admin/products/${item.product_id}`} className="hover:underline">{item.name}</Link> : item.name}
                    <p className="text-xs text-muted">{formatPrice(item.unit_price_ore)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm">{formatPrice(item.unit_price_ore * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid gap-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal_ore)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{formatPrice(order.shipping_ore)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">VAT (included)</dt><dd>{formatPrice(order.vat_ore)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-medium"><dt>Total</dt><dd>{formatPrice(order.total_ore)}</dd></div>
            </dl>
          </Card>
          <OrderActions order={order} />
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <h2 className="mb-3 text-sm font-medium">Customer</h2>
            <p className="text-sm">{order.first_name} {order.last_name}</p>
            <a href={`mailto:${order.email}`} className="text-sm text-gold-deep hover:underline">{order.email}</a>
            {order.phone && <p className="text-sm text-muted">{order.phone}</p>}
          </Card>
          <Card>
            <h2 className="mb-3 text-sm font-medium">Delivery address</h2>
            <address className="text-sm not-italic leading-relaxed">
              {order.first_name} {order.last_name}<br />
              {order.address_line1}<br />
              {order.address_line2 && <>{order.address_line2}<br /></>}
              {order.postal_code} {order.city}<br />
              Sweden
            </address>
            {order.tracking_number && <p className="mt-3 text-sm">Tracking: <b className="font-medium">{order.tracking_number}</b></p>}
          </Card>
          <Card>
            <h2 className="mb-3 text-sm font-medium">Payment</h2>
            <p className="text-sm text-muted">{order.paid_at ? `Paid ${dateTime(order.paid_at)}` : "Not paid"}</p>
            {order.stripe_payment_intent_id && (
              <a href={`https://dashboard.stripe.com/${stripeMode}payments/${order.stripe_payment_intent_id}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold-deep hover:underline">
                Open in Stripe <ExternalLink className="size-3.5" />
              </a>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
