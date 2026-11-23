"use client"

import { useEffect, useRef, useState, useTransition } from "react"

import { completeCheckout } from "@lib/data/checkout"
import { Notice } from "./fields"

export default function ConfirmPayment({ paymentIntentId }: { paymentIntentId: string }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const started = useRef(false)

  const confirm = () => start(async () => setError(await completeCheckout(paymentIntentId)))

  useEffect(() => {
    if (started.current) return
    started.current = true
    confirm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (pending || !error) return <div className="lux-spinner" role="status" aria-label="Confirming payment" />

  return (
    <div className="lux-form">
      <Notice>{error}</Notice>
      <button type="button" className="lux-button" onClick={confirm}>Retry confirmation</button>
    </div>
  )
}
