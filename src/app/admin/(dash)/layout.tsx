import { AdminNav } from "@/components/admin/nav"
import { requireAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[248px_1fr]">
      <AdminNav email={user.email ?? ""} />
      <main className="min-w-0 px-4 py-6 sm:px-8 lg:py-10">{children}</main>
    </div>
  )
}
