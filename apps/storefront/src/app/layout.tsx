import { getBaseURL } from "@lib/util/env"
import { Metadata, Viewport } from "next"
import { Cormorant_Garamond, Jost } from "next/font/google"
import "styles/globals.css"

export const metadata: Metadata = {
  title: { default: "Alicia Lux", template: "%s | Alicia Lux" },
  description: "Jewelry and beauty organizers for the things you treasure. Discover the signature Alicia Lux collection.",
  icons: {
    icon: "/favicon.ico?v=alicia-lux",
    apple: "/images/alicia-lux-touch.png",
  },
  metadataBase: new URL(getBaseURL()),
}

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})
const sans = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-sans", display: "swap" })

export const viewport: Viewport = {
  themeColor: "#f8f5f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:p-4">Skip to content</a>
        <main id="main-content" className="relative">{props.children}</main>
      </body>
    </html>
  )
}
