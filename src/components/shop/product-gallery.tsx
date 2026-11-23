"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  if (!images.length) return <div className="aspect-[4/5] rounded-[2px] bg-surface" />

  return (
    <div className="grid gap-3 lg:grid-cols-[84px_1fr] lg:gap-4">
      <div className="relative order-1 aspect-[4/5] overflow-hidden rounded-[2px] bg-card lg:order-2">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={images[active]}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src={images[active]} alt={alt} fill priority={active === 0} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar order-2 flex gap-2.5 overflow-x-auto lg:order-1 lg:flex-col">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "relative aspect-[4/5] w-[72px] shrink-0 overflow-hidden rounded-[2px] border transition-[border-color,opacity] lg:w-full",
                i === active ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill sizes="84px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
