import { createHash } from "node:crypto"
import { isbot } from "isbot"
import { NextResponse } from "next/server"
import { z } from "zod"
import { parseUserAgent } from "@/lib/analytics/user-agent"
import { serviceClient } from "@/lib/supabase/admin"

export const runtime = "nodejs"

const eventSchema = z.object({
  n: z.enum(["pageview", "product_view", "add_to_cart", "begin_checkout", "purchase"]),
  p: z.string().max(300).regex(/^\//), // path
  r: z.string().max(500).optional(), // document.referrer
  q: z.string().max(500).optional(), // location.search (for UTM tags)
  l: z.string().max(35).optional(), // navigator.language
  w: z.boolean().optional(), // navigator.webdriver → automated browser
  pid: z.uuid().optional(),
  v: z.number().int().min(0).max(100_000_000).optional(),
})

const ok = () => new NextResponse(null, { status: 204 })
const clip = (v: string | null | undefined, n = 120) => (v ? v.slice(0, n) : null)

/**
 * Cookie-free event collector. Drops bots (UA list + automation flag),
 * reads the country from Cloudflare, and never stores the IP address.
 */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? ""
  if (!ua || isbot(ua)) return ok()

  let body: z.infer<typeof eventSchema>
  try {
    body = eventSchema.parse(JSON.parse(await request.text()))
  } catch {
    return ok()
  }
  if (body.w) return ok()

  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url)
  // Only accept beacons from our own pages.
  const origin = request.headers.get("origin")
  if (origin && new URL(origin).host !== site.host && !origin.includes("localhost")) return ok()

  const h = request.headers
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? ""
  const day = new Date().toISOString().slice(0, 10)
  const salt = process.env.ANALYTICS_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "alicia-lux"
  const visitor = createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 32)

  let referrer: string | null = null
  try {
    const host = body.r ? new URL(body.r).hostname.replace(/^www\./, "") : null
    referrer = host && host !== site.hostname.replace(/^www\./, "") ? host : null
  } catch {}

  const utm = new URLSearchParams(body.q ?? "")
  const country = h.get("cf-ipcountry")
  const { device, browser, os } = parseUserAgent(ua)

  const { error } = await serviceClient().from("analytics_events").insert({
    name: body.n,
    visitor,
    path: body.p.split("?")[0],
    referrer,
    utm_source: clip(utm.get("utm_source")?.toLowerCase(), 80),
    utm_medium: clip(utm.get("utm_medium")?.toLowerCase(), 80),
    utm_campaign: clip(utm.get("utm_campaign"), 120),
    country: country && /^[A-Z]{2}$/.test(country) && country !== "XX" && country !== "T1" ? country : null,
    region: clip(h.get("cf-region")),
    city: clip(h.get("cf-ipcity")),
    device,
    browser,
    os,
    language: clip(body.l?.split("-")[0]?.toLowerCase(), 10),
    product_id: body.pid ?? null,
    value_ore: body.v ?? null,
  })
  if (error) console.error("analytics insert:", error.message)
  return ok()
}
