"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { refundOrder, saveOrderNote, updateOrderStatus } from "@/app/admin/actions"
import type { Order } from "@/lib/types"
import { Card } from "./ui"

export function OrderActions({ order }: { order: Order }) {
  const [pending, start] = useTransition()
  const [tracking, setTracking] = useState(order.tracking_number ?? "")
  const [note, setNote] = useState(order.note ?? "")

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>, success: string) =>
    start(async () => {
      const res = await fn()
      if (res.error) toast.error(res.error)
      else toast.success(success)
    })

  return (
    <Card>
      <h2 className="mb-4 text-sm font-medium">Fulfilment</h2>
      {order.status === "paid" && (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Tracking number (optional)" className="h-11 rounded-md border border-line bg-white px-3 text-sm" />
          <button disabled={pending} onClick={() => run(() => updateOrderStatus(order.id, "fulfilled", tracking), "Marked as shipped")} className="btn btn-primary min-h-11">
            Mark as shipped
          </button>
        </div>
      )}
      {order.status === "fulfilled" && (
        <button disabled={pending} onClick={() => run(() => updateOrderStatus(order.id, "paid"), "Moved back to “to ship”")} className="btn btn-ghost min-h-11">
          Undo shipped
        </button>
      )}
      {order.status === "pending" && <p className="text-sm text-muted">The customer started checkout but hasn’t paid. Nothing to ship.</p>}
      {(order.status === "cancelled" || order.status === "refunded") && <p className="text-sm text-muted">This order is {order.status}.</p>}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
        {["paid", "fulfilled", "cancelled"].includes(order.status) && (
          <button
            disabled={pending}
            onClick={() => confirm(`Refund ${order.email} in full via Stripe?`) && run(() => refundOrder(order.id), "Refund issued")}
            className="btn btn-ghost min-h-10 px-4 text-[11px]"
          >
            Refund in full
          </button>
        )}
        {["pending", "paid"].includes(order.status) && (
          <button
            disabled={pending}
            onClick={() =>
              confirm(order.status === "paid" ? "Cancel this paid order? This does not refund the customer — use Refund for that." : "Cancel this unpaid order?") &&
              run(() => updateOrderStatus(order.id, "cancelled"), "Order cancelled")
            }
            className="btn btn-ghost min-h-10 px-4 text-[11px] text-danger"
          >
            Cancel order
          </button>
        )}
      </div>

      <label className="mt-5 grid gap-2 border-t border-line pt-5 text-sm">
        Internal note
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="rounded-md border border-line bg-white p-3 text-sm" />
      </label>
      <button disabled={pending || note === (order.note ?? "")} onClick={() => run(() => saveOrderNote(order.id, note), "Note saved")} className="mt-2 text-sm text-gold-deep hover:underline disabled:opacity-40">
        Save note
      </button>
    </Card>
  )
}
