"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Boxes, ChartColumn, ExternalLink, LayoutDashboard, LogOut, Receipt, Settings } from "lucide-react"
import { signOut } from "@/app/admin/actions"
import { cn } from "@/lib/utils"

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: ChartColumn },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname()
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href))

  return (
    <aside className="sticky top-0 z-30 border-b border-line bg-night text-[#f3ebe1] lg:h-dvh lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-stretch lg:px-5 lg:py-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image src="/images/alicia-lux-mark.png" alt="" width={32} height={32} className="brightness-0 invert-[.91] sepia-[.15]" />
          <span className="font-serif text-lg uppercase tracking-[0.18em]">Alicia Lux</span>
        </Link>
        <a href="/" target="_blank" className="inline-flex items-center gap-1.5 text-xs text-night-text hover:text-gold-light lg:mt-1">
          View store <ExternalLink className="size-3" />
        </a>
      </div>
      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-4 lg:flex-col lg:px-3">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              active(href) ? "bg-[#2c241e] text-gold-light" : "text-night-text hover:bg-[#241d18] hover:text-[#f3ebe1]"
            )}
          >
            <Icon className="size-4" strokeWidth={1.5} /> {label}
          </Link>
        ))}
      </nav>
      <form action={signOut} className="hidden border-t border-night-line px-5 py-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
        <p className="mb-2 truncate text-xs text-night-text">{email}</p>
        <button className="inline-flex items-center gap-2 text-sm hover:text-gold-light"><LogOut className="size-4" strokeWidth={1.5} /> Sign out</button>
      </form>
    </aside>
  )
}
