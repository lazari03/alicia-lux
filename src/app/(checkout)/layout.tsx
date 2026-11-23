import Link from "next/link"
import { ArrowLeft, Lock } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Pageviews } from "@/components/analytics/pageviews"

/** Distraction-free checkout: no shop nav, no footer, no cart drawer. */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-paper">
        <div className="container-lux grid min-h-14 grid-cols-[1fr_auto_1fr] items-center sm:min-h-16">
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em]">
            <ArrowLeft className="size-4" strokeWidth={1.25} /> <span className="hidden sm:inline">Continue shopping</span>
          </Link>
          <Logo />
          <p className="flex items-center justify-end gap-2 text-xs text-muted">
            <Lock className="size-3.5" strokeWidth={1.5} /> <span className="hidden sm:inline">Secure checkout</span>
          </p>
        </div>
      </header>
      <main>{children}</main>
      <Pageviews />
    </div>
  )
}
