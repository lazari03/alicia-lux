import { existsSync, readFileSync } from "node:fs"
import { parseEnv } from "node:util"
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const stripeKey = process.env.STRIPE_API_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (Boolean(stripeKey) !== Boolean(stripeWebhookSecret)) {
  throw new Error("Set both STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET to enable Stripe.")
}

const providers: { resolve: string; id: string; options: Record<string, unknown> }[] = []
if (stripeKey && stripeWebhookSecret) {
  providers.push({
    resolve: "@medusajs/medusa/payment-stripe",
    id: "stripe",
    options: { apiKey: stripeKey, webhookSecret: stripeWebhookSecret, capture: true },
  })
}
if (process.env.STRIPE_HOSTED_CHECKOUT === "true" ||
    (process.env.STRIPE_HOSTED_CHECKOUT !== "false" && existsSync(".env.stripe-hosted"))) {
  const secrets = parseEnv(readFileSync(".env.stripe-hosted", "utf8"))
  const apiKey = secrets.STRIPE_API_KEY
  const webhookSecret = secrets.STRIPE_WEBHOOK_SECRET
  if (!apiKey?.match(/^(sk|rk)_(live|test)_[A-Za-z0-9_-]+$/) ||
      !webhookSecret?.match(/^whsec_[A-Za-z0-9_-]+$/)) {
    throw new Error("Set the Stripe API key and webhook signing secret in .env.stripe-hosted.")
  }
  const url = new URL(process.env.STRIPE_CHECKOUT_RETURN_ORIGIN || "https://shopalicialux.se")
  if (url.protocol !== "https:" &&
      !(apiKey.includes("_test_") && url.protocol === "http:" && url.hostname === "localhost")) {
    throw new Error("Stripe Checkout requires a secure return origin.")
  }
  providers.push({
    resolve: "./src/modules/stripe-hosted",
    id: "stripe-hosted",
    options: { apiKey, webhookSecret, origin: url.origin },
  })
}

module.exports = defineConfig({
  modules: providers.length ? {
    [Modules.PAYMENT]: {
      resolve: "@medusajs/medusa/payment",
      options: { providers },
    },
  } : {},
  projectConfig: {
    databaseUrl: required("DATABASE_URL"),
    http: {
      storeCors: required("STORE_CORS"),
      adminCors: required("ADMIN_CORS"),
      authCors: required("AUTH_CORS"),
      jwtSecret: required("JWT_SECRET"),
      cookieSecret: required("COOKIE_SECRET"),
    },
  },
})
