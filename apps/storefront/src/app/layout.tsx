import { getBaseURL } from "@lib/util/env"
import { display, text } from "@lib/fonts"
import { Metadata, Viewport } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  title: { default: "Alicia Lux", template: "%s | Alicia Lux" },
  description:
    "Jewelry and beauty organizers for the things you treasure. Discover the signature Alicia Lux collection.",
  metadataBase: new URL(getBaseURL()),
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${display.variable} ${text.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lux-ink focus:px-5 focus:py-3 focus:text-sm focus:text-lux-paper"
        >
          Skip to content
        </a>
        <main id="main-content" className="relative">
          {props.children}
        </main>
      </body>
    </html>
  )
}
