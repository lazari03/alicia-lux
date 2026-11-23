import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/types"

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-[clamp(30px,4vw,42px)] leading-none">{title}</h1>
        {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-lg border border-line bg-card p-5 sm:p-6", className)}>{children}</div>
}

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-[#f1ece4] text-muted",
  paid: "bg-[#fbf0dc] text-[#8a5a12]",
  fulfilled: "bg-[#e5f1e6] text-[#2f6b3a]",
  cancelled: "bg-[#f3e6e6] text-danger",
  refunded: "bg-[#ece8f3] text-[#5a4a86]",
}
export function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("admin.status")
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap", statusStyles[status])}>{t(status)}</span>
}

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("sv-SE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Stockholm" }).format(new Date(iso))
