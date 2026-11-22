import { existsSync } from "node:fs"
import { readHostedSecrets } from "./src/modules/stripe-hosted/service"
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const hostedCheckout = process.env.STRIPE_HOSTED_CHECKOUT === "true" ||
  (process.env.STRIPE_HOSTED_CHECKOUT !== "false" && existsSync(".env.stripe-hosted"))

const stripeKey = process.env.STRIPE_API_KEY
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!hostedCheckout && Boolean(stripeKey) !== Boolean(stripeWebhookSecret)) {
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
if (hostedCheckout) {
  const { STRIPE_API_KEY: apiKey, STRIPE_WEBHOOK_SECRET: webhookSecret } = readHostedSecrets()
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
