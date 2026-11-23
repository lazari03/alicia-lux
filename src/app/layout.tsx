import type { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Jost } from "next/font/google"
import { Toaster } from "sonner"
import { siteUrl } from "@/lib/utils"
import "./globals.css"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})
const body = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-body", display: "swap" })

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
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}
        <Toaster position="bottom-center" toastOptions={{ className: "!font-sans !rounded-[4px] !border-line" }} />
      </body>
    </html>
  )
}
