"use client"

import { startHostedCheckout, finishHostedCheckout } from "@lib/data/cart"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useActionState, useEffect, useRef } from "react"

export default function HostedCheckout({ sessionId }: { sessionId?: string }) {
  const [message, action] = useActionState(async () => {
    return sessionId ? finishHostedCheckout(sessionId) : startHostedCheckout()
  }, null)

  const form = useRef<HTMLFormElement>(null)
  const submitted = useRef(false)
  useEffect(() => {
    if (sessionId && !submitted.current) {
      submitted.current = true
      form.current?.requestSubmit()
    }
  }, [sessionId])

  return (
    <form ref={form} action={action} className="space-y-3">
      <SubmitButton className="w-full">
        {sessionId ? "Confirm order" : "Continue to secure payment"}
      </SubmitButton>
      {message && <p role="alert" className="text-sm text-ui-fg-error">{message}</p>}
    </form>
  )
}
