"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { Drawer } from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { Burger } from "./header"

const primary = [
  { label: "Home", href: "/" },
  { label: "Shop all", href: "/shop" },
  { label: "Coffee Brown", href: "/product/signature-organizer-coffee-brown" },
  { label: "Champagne", href: "/product/signature-organizer-champagne" },
  { label: "Noir", href: "/product/signature-organizer-noir" },
]

const secondary = [
  { label: "Delivery & returns", href: "/policies/returns" },
  { label: "Terms", href: "/policies/terms" },
  { label: "Privacy", href: "/policies/privacy" },
]

export function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      label="Menu"
      className="bg-night px-6 pt-[max(12px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] text-[#f6eee3]"
    >
      <div className="flex min-h-14 items-center justify-between border-b border-night-line">
        <span className="font-serif text-xl font-medium uppercase tracking-[0.2em]">Alicia Lux</span>
        <button type="button" onClick={onClose} data-autofocus aria-label="Close menu" className="group grid size-11 place-items-center">
          <Burger open />
        </button>
      </div>

      <nav aria-label="Menu" className="mt-[clamp(20px,5vh,48px)] mb-6">
        <ul>
          {primary.map((item, i) => {
            const current = pathname === item.href
            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={current ? "page" : undefined}
                  className="group grid min-h-[60px] grid-cols-[32px_1fr_auto] items-center gap-2 border-b border-night-line py-2.5"
                >
                  <span className="self-start pt-2.5 text-[10px] tracking-[0.12em] text-gold">0{i + 1}</span>
                  <span
                    className={cn(
                      "font-serif text-[clamp(30px,7.5vw,40px)] leading-tight transition-[transform,color] duration-300 ease-lux group-hover:translate-x-1.5 group-hover:text-gold-light",
                      current && "italic text-gold-light"
                    )}
                  >
                    {item.label}
                  </span>
                  <ArrowUpRight className="size-5 text-gold opacity-70 transition-opacity group-hover:opacity-100" strokeWidth={1.25} />
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </nav>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
        <Link href="/shop" onClick={onClose} className="group relative block aspect-[16/9] overflow-hidden rounded-[4px]">
          <Image
            src="/images/signature-collection-hero.webp"
            alt=""
            fill
            sizes="(min-width: 480px) 420px, 90vw"
            className="object-cover transition-transform duration-[1.2s] ease-lux group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
          <span className="absolute inset-x-4 bottom-3.5 font-serif text-[19px]">
            <small className="mb-0.5 block font-sans text-[10px] uppercase tracking-[0.2em] text-gold-light">The Signature Collection</small>
            Coffee Brown · Champagne · Noir
          </span>
        </Link>
      </motion.div>

      <div className="mt-auto grid gap-3.5 pt-6">
        <ul className="flex flex-wrap gap-x-5 text-[13px] text-night-text">
          {secondary.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={onClose} className="inline-flex min-h-10 items-center hover:text-gold-light">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="flex justify-between border-t border-night-line pt-4 text-[13px] text-night-text">
          Shipping within Sweden <span>SEK</span>
        </p>
      </div>
    </Drawer>
  )
}
