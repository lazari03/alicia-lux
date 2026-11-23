"use client"

import { motion, useReducedMotion } from "motion/react"

/** Fades and lifts its children into view once, staggered by `index`. */
export function Reveal({
  children,
  index = 0,
  className,
  as = "div",
  y = 24,
}: {
  children: React.ReactNode
  index?: number
  className?: string
  as?: "div" | "li" | "section" | "figure"
  y?: number
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  )
}
