import localFont from "next/font/local"

// Self-hosted variable fonts (no third-party font requests at runtime).
export const display = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  weight: "300 700",
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
})

export const text = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/jost/files/jost-latin-wght-normal.woff2",
      style: "normal",
    },
  ],
  weight: "300 700",
  variable: "--font-text",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "sans-serif"],
})
