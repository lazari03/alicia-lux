"use client"

import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Suspense, useState } from "react"
import { browserClient } from "@/lib/supabase/browser"
import { Notice } from "@/components/ui/notice"
import { optOutThisDevice } from "@/lib/analytics/track"

function LoginForm() {
  const t = useTranslations("admin.login")
  const router = useRouter()
  const params = useSearchParams()
  const [error, setError] = useState<string | null>(params.get("error") === "not-admin" ? t("notAdmin") : null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setBusy(true)
    setError(null)
    const supabase = browserClient()
    if (params.get("error") === "not-admin") await supabase.auth.signOut()
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    })
    if (error) {
      setError(error.message === "Invalid login credentials" ? t("wrong") : error.message)
      setBusy(false)
      return
    }
    optOutThisDevice() // don't count the shop owner's own visits
    router.replace("/admin")
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="field"><input name="email" type="email" placeholder=" " autoComplete="username" required /><span>{t("email")}</span></label>
      <label className="field"><input name="password" type="password" placeholder=" " autoComplete="current-password" required /><span>{t("password")}</span></label>
      {error && <Notice>{error}</Notice>}
      <button type="submit" disabled={busy} className="btn btn-primary mt-3 w-full">{busy ? t("signingIn") : t("signIn")}</button>
    </form>
  )
}

export default function LoginPage() {
  const t = useTranslations("admin.login")
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-card p-8 shadow-[0_30px_80px_-40px_rgb(31_25_21/0.35)]">
        <div className="mb-8 grid justify-items-center gap-3 text-center">
          <Image src="/images/alicia-lux-mark.png" alt="" width={56} height={56} />
          <h1 className="font-serif text-3xl">{t("title")}</h1>
          <p className="text-sm text-muted">{t("subtitle")}</p>
        </div>
        <Suspense><LoginForm /></Suspense>
      </div>
    </main>
  )
}
