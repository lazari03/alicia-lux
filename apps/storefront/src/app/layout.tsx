import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  title: { default: "Alicia Lux", template: "%s | Alicia Lux" },
  description: "A considered edit of contemporary essentials and timeless pieces.",
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:p-4">Skip to content</a>
        <main id="main-content" className="relative">{props.children}</main>
      </body>
    </html>
  )
}
