"use client"

type EventName = "pageview" | "product_view" | "add_to_cart" | "begin_checkout" | "purchase"
const OPT_OUT = "alicia-lux-no-track"

/** Fire-and-forget event. Skips automated browsers and opted-out devices (admins). */
export function track(name: EventName, extra: { productId?: string; valueOre?: number } = {}) {
  if (typeof window === "undefined") return
  try {
    if (localStorage.getItem(OPT_OUT) === "1") return
  } catch {}
  if (navigator.webdriver) return

  const body = JSON.stringify({
    n: name,
    p: location.pathname,
    r: document.referrer || undefined,
    q: location.search || undefined,
    l: navigator.language,
    w: navigator.webdriver || undefined,
    pid: extra.productId,
    v: extra.valueOre,
  })
  const blob = new Blob([body], { type: "text/plain" })
  if (!navigator.sendBeacon?.("/api/e", blob)) {
    fetch("/api/e", { method: "POST", body, keepalive: true }).catch(() => {})
  }
}

/** Called after an admin signs in so the shop owner's own visits aren't counted. */
export function optOutThisDevice() {
  try {
    localStorage.setItem(OPT_OUT, "1")
  } catch {}
}
