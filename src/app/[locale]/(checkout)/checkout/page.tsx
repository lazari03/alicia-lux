import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { CheckoutClient } from "@/components/checkout/checkout-client"
import { getSettings } from "@/lib/catalog"

export const dynamic = "force-dynamic"
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations({ locale: (await params).locale, namespace: "checkout" })
  return { title: t("metaTitle"), robots: { index: false } }
}

export default async function CheckoutPage() {
  const settings = await getSettings()
  return <CheckoutClient settings={settings} publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""} />
}
