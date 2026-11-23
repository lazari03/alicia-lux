"use client"

import { motion } from "motion/react"

export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <motion.p role="alert" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 border-l-2 border-danger bg-[#fbf1ef] px-3.5 py-3 text-sm text-danger">
      {children}
    </motion.p>
  )
}
