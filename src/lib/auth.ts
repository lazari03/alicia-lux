import "server-only"
import { redirect } from "next/navigation"
import { serviceClient } from "./supabase/admin"
import { sessionClient } from "./supabase/server"

/** Returns the signed-in admin or redirects to /admin/login. */
export async function requireAdmin() {
  const supabase = await sessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/admin/login")

  const { data } = await serviceClient().from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle()
  if (!data) redirect("/admin/login?error=not-admin")
  return user
}
