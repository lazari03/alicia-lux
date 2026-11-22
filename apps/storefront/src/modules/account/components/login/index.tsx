import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import SignInForm from "@modules/account/components/sign-in-form"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

export default function Login({ setCurrentView }: Props) {
  return (
    <div className="w-full" data-testid="login-page">
      <h1 className="lux-checkout-title">Welcome back</h1>
      <p className="mt-3 text-sm text-ui-fg-subtle">Sign in to see your orders and use saved details.</p>
      <SignInForm />
      <p className="mt-5 text-sm">
        New to Alicia Lux?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="min-h-[44px] underline underline-offset-4"
          data-testid="register-button"
        >
          Create an account
        </button>
      </p>
    </div>
  )
}
