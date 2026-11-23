import Image from "next/image"
import Link from "next/link"
import { ArrowUp, Lock } from "lucide-react"

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Shop all", href: "/shop" },
      { label: "Coffee Brown", href: "/product/signature-organizer-coffee-brown" },
      { label: "Champagne", href: "/product/signature-organizer-champagne" },
      { label: "Noir", href: "/product/signature-organizer-noir" },
    ],
  },
  {
    title: "Customer care",
    links: [
      { label: "Delivery & returns", href: "/policies/returns" },
      { label: "Terms & conditions", href: "/policies/terms" },
      { label: "Privacy policy", href: "/policies/privacy" },
    ],
  },
]

export function Footer() {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL

  return (
    <footer className="bg-night pb-[env(safe-area-inset-bottom)] text-[#f3ebe1]">
      <div className="container-lux">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-night-line pt-[clamp(48px,7vw,96px)] pb-[clamp(28px,4vw,48px)] md:flex-row md:items-end">
          <Link href="/" className="inline-flex items-center gap-[clamp(10px,1.4vw,20px)] font-serif text-[clamp(44px,6vw,88px)] leading-none">
            <Image src="/images/alicia-lux-mark.png" alt="" width={84} height={84} className="h-auto w-[clamp(42px,5vw,76px)] brightness-0 invert-[.91] sepia-[.15]" />
            Alicia Lux
          </Link>
          <p className="max-w-xs font-serif text-xl italic leading-snug text-night-text">A beautiful home for the things you treasure.</p>
        </div>

        <div className="grid gap-0 py-2 md:grid-cols-3 md:gap-8 md:py-10">
          {columns.map((col) => (
            <div key={col.title}>
              {/* Phones: zero-JS accordion. Tablet and up: plain columns. */}
              <details className="group border-b border-night-line md:hidden">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between text-[11px] font-medium uppercase tracking-[0.2em] text-gold [&::-webkit-details-marker]:hidden">
                  {col.title}
                  <span aria-hidden className="relative size-3">
                    <span className="absolute top-1/2 left-0 h-px w-full bg-current" />
                    <span className="absolute top-1/2 left-0 h-px w-full rotate-90 bg-current transition-transform duration-300 group-open:rotate-0" />
                  </span>
                </summary>
                <FooterLinks links={col.links} />
              </details>
              <div className="hidden md:block">
                <p className="mb-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold">{col.title}</p>
                <FooterLinks links={col.links} />
              </div>
            </div>
          ))}
          <div className="py-6 md:py-0">
            <p className="mb-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-gold">Contact</p>
            {email ? (
              <a href={`mailto:${email}`} className="text-[15px] hover:text-gold-light">{email}</a>
            ) : (
              <Link href="/policies/terms" className="text-[15px] hover:text-gold-light">Seller information</Link>
            )}
            <p className="mt-2.5 text-[13px] text-night-text">Delivery within Sweden · Prices in SEK incl. VAT</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-night-line py-3.5 text-xs text-night-text">
          <p>© {new Date().getFullYear()} Alicia Lux</p>
          <p className="inline-flex items-center gap-2"><Lock className="size-3.5" strokeWidth={1.5} /> Payments secured by Stripe</p>
          <a href="#top" className="inline-flex min-h-11 items-center gap-2 hover:text-gold-light">
            Back to top <ArrowUp className="size-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <ul className="grid pb-3.5 md:pb-0">
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="inline-flex min-h-10 items-center text-[15px] transition-colors hover:text-gold-light">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
