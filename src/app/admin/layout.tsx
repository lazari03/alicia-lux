import type { Metadata } from "next"

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Alicia Lux" }, robots: { index: false, follow: false } }

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#f6f3ee] text-ink">{children}</div>
}
