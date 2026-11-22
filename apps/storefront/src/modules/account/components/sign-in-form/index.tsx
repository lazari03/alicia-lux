"use client"

import { useActionState } from "react"
import { login } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"

export default function SignInForm() {
  const [message, formAction] = useActionState(login, null)

  return (
    <form className="lux-sign-in-form" action={formAction}>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        data-testid="email-input"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        data-testid="password-input"
      />
      <ErrorMessage error={message} data-testid="login-error-message" />
      <SubmitButton data-testid="sign-in-button" className="w-full">Sign in</SubmitButton>
    </form>
  )
}
