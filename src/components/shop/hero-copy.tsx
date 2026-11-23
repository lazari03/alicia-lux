"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRight } from "lucide-react"

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
})

export function HeroCopy() {
  const reduce = useReducedMotion()
  const t = useTranslations("home")
  const a = (d: number) => (reduce ? {} : rise(d))
  return (
    <div className="absolute inset-x-4 top-[clamp(22px,3.2vw,56px)] z-10 flex flex-col items-center gap-[clamp(10px,1.4vw,22px)]">
      <motion.p {...a(0)} className="eyebrow !text-[#efcfaa]">{t("heroEyebrow")}</motion.p>
      <motion.h1 {...a(0.1)} id="hero-title" className="display text-[clamp(40px,6vw,96px)] leading-none">
        {t.rich("heroTitle", { em: (c) => <em className="text-[#f2d5b2]">{c}</em> })}
      </motion.h1>
      <motion.div {...a(0.24)}>
        <Link href="/shop" className="btn btn-light">
          {t("heroCta")} <ArrowUpRight className="size-4" strokeWidth={1.25} />
        </Link>
      </motion.div>
    </div>
  )
}
