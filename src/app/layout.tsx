import type { Metadata, Viewport } from "next"
// Fonts are bundled (no Google Fonts request at build or runtime).
import "@fontsource/cormorant-garamond/400.css"
import "@fontsource/cormorant-garamond/400-italic.css"
import "@fontsource/cormorant-garamond/500.css"
import "@fontsource/jost/300.css"
import "@fontsource/jost/400.css"
import "@fontsource/jost/500.css"
import { Toaster } from "sonner"
import { siteUrl } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Alicia Lux — For all that you treasure", template: "%s · Alicia Lux" },
  description: "Jewelry and beauty organizers for the things you treasure. Discover the Alicia Lux Signature Collection in Coffee Brown, Champagne and Noir.",
  openGraph: {
    type: "website",
    siteName: "Alicia Lux",
    images: [{ url: "/images/signature-collection-hero.webp", width: 1536, height: 1024 }],
  },
}

export const viewport: Viewport = { themeColor: "#f8f5f0", viewportFit: "cover" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <Toaster position="bottom-center" toastOptions={{ className: "!font-sans !rounded-[4px] !border-line" }} />
      </body>
    </html>
  )
}
