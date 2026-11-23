import type { NextConfig } from "next"

const supabase = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  } catch {
    return undefined
  }
})()

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // WebP only: AVIF encoding is slow on a small VPS and the sources are WebP already.
    formats: ["image/webp"],
    // Optimised images are cached for a year (product images get new URLs when replaced).
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    remotePatterns: supabase
      ? [{
          protocol: supabase.protocol.replace(":", "") as "http" | "https",
          hostname: supabase.hostname,
          port: supabase.port,
          pathname: "/storage/v1/object/public/**",
        }]
      : [],
  },
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://js.stripe.com\")" },
        ],
      },
    ]
  },
}

export default nextConfig
