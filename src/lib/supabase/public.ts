import { createClient } from "@supabase/supabase-js"

/** Anonymous client for public catalog reads (RLS: active products only). */
export function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
