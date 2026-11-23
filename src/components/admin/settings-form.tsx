"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { saveSettings, type ActionState } from "@/app/admin/actions"
import type { StoreSettings } from "@/lib/types"
import { Card } from "./ui"

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveSettings, null)
  useEffect(() => {
    if (state?.ok) toast.success("Settings saved")
    else if (state?.error) toast.error(state.error)
  }, [state])

  const input = "h-11 w-full rounded-md border border-line bg-white px-3 text-sm focus:border-gold focus:outline-none"
  return (
    <Card className="max-w-xl">
      <form action={action} className="grid gap-5">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Delivery fee (SEK)</span>
          <input name="shipping" inputMode="decimal" defaultValue={settings.shipping_fee_ore / 100} className={input} />
          <small className="text-xs text-muted">Flat rate per order. 0 = free delivery.</small>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium">Free delivery from (SEK)</span>
          <input name="freeOver" inputMode="decimal" defaultValue={settings.free_shipping_over_ore != null ? settings.free_shipping_over_ore / 100 : ""} className={input} />
          <small className="text-xs text-muted">Optional. Orders at or above this subtotal ship free.</small>
        </label>
        <button disabled={pending} className="btn btn-primary justify-self-start">{pending ? "Saving…" : "Save settings"}</button>
      </form>
    </Card>
  )
}
