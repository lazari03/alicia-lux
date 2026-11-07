import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

module.exports = defineConfig({
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
