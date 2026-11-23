import type { Metadata, Viewport } from "next"
// Fonts are bundled (no Google Fonts request at build or runtime).
import "@fontsource/cormorant-garamond/400.css"
import "@fontsource/cormorant-garamond/400-italic.css"
import "@fontsource/cormorant-garamond/500.css"
import "@fontsource/jost/300.css"
import "@fontsource/jost/400.css"
import "@fontsource/jost/500.css"
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"
import { Toaster } from "sonner"
import { siteUrl } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Alicia Lux", template: "%s · Alicia Lux" },
  openGraph: {
    type: "website",
    siteName: "Alicia Lux",
    images: [{ url: "/images/signature-collection-hero.webp", width: 1536, height: 1024 }],
  },
}

export const viewport: Viewport = { themeColor: "#f8f5f0", viewportFit: "cover" }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster position="bottom-center" toastOptions={{ className: "!font-sans !rounded-[4px] !border-line" }} />
      </body>
    </html>
  )
}
