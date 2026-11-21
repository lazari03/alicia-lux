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

module.exports = defineConfig({
  modules: stripeKey && stripeWebhookSecret ? {
    [Modules.PAYMENT]: {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [{
          resolve: "@medusajs/medusa/payment-stripe",
          id: "stripe",
          options: {
            apiKey: stripeKey,
            webhookSecret: stripeWebhookSecret,
            capture: true,
          },
        }],
      },
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
