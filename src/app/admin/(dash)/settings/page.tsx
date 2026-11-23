import { SettingsForm } from "@/components/admin/settings-form"
import { PageHeader } from "@/components/admin/ui"
import { serviceClient } from "@/lib/supabase/admin"
import type { StoreSettings } from "@/lib/types"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const { data } = await serviceClient().from("store_settings").select("shipping_fee_ore, free_shipping_over_ore").maybeSingle()
  return (
    <>
      <PageHeader title="Settings" description="Delivery pricing for orders within Sweden." />
      <SettingsForm settings={(data as StoreSettings) ?? { shipping_fee_ore: 0, free_shipping_over_ore: null }} />
    </>
  )
}
