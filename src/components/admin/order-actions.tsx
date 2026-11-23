"use client"

import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { refundOrder, saveOrderNote, updateOrderStatus } from "@/app/admin/actions"
import type { Order } from "@/lib/types"
import { Card } from "./ui"

export function OrderActions({ order }: { order: Order }) {
  const [pending, start] = useTransition()
  const t = useTranslations("admin.orders")
  const te = useTranslations("admin.errors")
  const ts = useTranslations("admin.status")
  const [tracking, setTracking] = useState(order.tracking_number ?? "")
  const [note, setNote] = useState(order.note ?? "")

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>, success: string) =>
    start(async () => {
      const res = await fn()
      if (res.error) toast.error(te.has(res.error) ? te(res.error) : res.error)
      else toast.success(success)
    })

  return (
    <Card>
      <h2 className="mb-4 text-sm font-medium">{t("fulfilment")}</h2>
      {order.status === "paid" && (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder={t("trackingPlaceholder")} className="h-11 rounded-md border border-line bg-white px-3 text-sm" />
          <button disabled={pending} onClick={() => run(() => updateOrderStatus(order.id, "fulfilled", tracking), t("toastShipped"))} className="btn btn-primary min-h-11">
            {t("markShipped")}
          </button>
        </div>
      )}
      {order.status === "fulfilled" && (
        <button disabled={pending} onClick={() => run(() => updateOrderStatus(order.id, "paid"), t("toastUnshipped"))} className="btn btn-ghost min-h-11">
          {t("undoShipped")}
        </button>
      )}
      {order.status === "pending" && <p className="text-sm text-muted">{t("pendingNote")}</p>}
      {(order.status === "cancelled" || order.status === "refunded") && <p className="text-sm text-muted">{t("closedNote", { status: ts(order.status).toLowerCase() })}</p>}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-line pt-5">
        {["paid", "fulfilled", "cancelled"].includes(order.status) && (
          <button
            disabled={pending}
            onClick={() => confirm(t("confirmRefund", { email: order.email })) && run(() => refundOrder(order.id), t("toastRefunded"))}
            className="btn btn-ghost min-h-10 px-4 text-[11px]"
          >
            {t("refund")}
          </button>
        )}
        {["pending", "paid"].includes(order.status) && (
          <button
            disabled={pending}
            onClick={() =>
              confirm(order.status === "paid" ? t("confirmCancelPaid") : t("confirmCancelUnpaid")) &&
              run(() => updateOrderStatus(order.id, "cancelled"), t("toastCancelled"))
            }
            className="btn btn-ghost min-h-10 px-4 text-[11px] text-danger"
          >
            {t("cancel")}
          </button>
        )}
      </div>

      <label className="mt-5 grid gap-2 border-t border-line pt-5 text-sm">
        {t("note")}
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="rounded-md border border-line bg-white p-3 text-sm" />
      </label>
      <button disabled={pending || note === (order.note ?? "")} onClick={() => run(() => saveOrderNote(order.id, note), t("toastNote"))} className="mt-2 text-sm text-gold-deep hover:underline disabled:opacity-40">
        {t("saveNote")}
      </button>
    </Card>
  )
}
