"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState } from "react"

import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState(LOGIN_VIEW.SIGN_IN)

  return (
    <div className="lux-account-card">
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} />
      ) : (
        <Register setCurrentView={setCurrentView} />
      )}
      <LocalizedClientLink href="/cart" className="lux-text-link mt-3">Continue as guest</LocalizedClientLink>
    </div>
  )
}

export default LoginTemplate
