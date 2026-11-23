import type { Metadata } from "next"
import { CheckoutClient } from "@/components/checkout/checkout-client"
import { getSettings } from "@/lib/catalog"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Checkout", robots: { index: false } }

export default async function CheckoutPage() {
  const settings = await getSettings()
  return <CheckoutClient settings={settings} publishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""} />
}
