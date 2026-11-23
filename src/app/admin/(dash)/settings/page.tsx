import { getTranslations } from "next-intl/server"
import { SettingsForm } from "@/components/admin/settings-form"
import { PageHeader } from "@/components/admin/ui"
import { serviceClient } from "@/lib/supabase/admin"
import type { StoreSettings } from "@/lib/types"

export async function generateMetadata() {
  return { title: (await getTranslations("admin.settings"))("title") }
}

export default async function SettingsPage() {
  const t = await getTranslations("admin.settings")
  const { data } = await serviceClient().from("store_settings").select("shipping_fee_ore, free_shipping_over_ore").maybeSingle()
  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <SettingsForm settings={(data as StoreSettings) ?? { shipping_fee_ore: 0, free_shipping_over_ore: null }} />
    </>
  )
}
