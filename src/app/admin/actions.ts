"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { serviceClient } from "@/lib/supabase/admin"
import { sessionClient } from "@/lib/supabase/server"
import type { OrderStatus } from "@/lib/types"
import { slugify } from "@/lib/utils"

/** `error` / `fieldErrors` values are codes from `admin.errors.*` (or a raw DB message). */
export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } | null

const refreshStorefront = () => {
  revalidatePath("/", "layout")
}

/** Admin language switch — the admin follows the NEXT_LOCALE cookie. */
export async function setAdminLocale(locale: "sv" | "en") {
  ;(await cookies()).set("NEXT_LOCALE", locale === "en" ? "en" : "sv", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
  revalidatePath("/admin", "layout")
}

export async function signOut() {
  const supabase = await sessionClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
const kr = z
  .string()
  .trim()
  .transform((v) => v.replace(/\s/g, "").replace(",", "."))
  .pipe(z.string().regex(/^\d+(\.\d{1,2})?$/, "amount"))
  .transform((v) => Math.round(Number(v) * 100))

const productSchema = z.object({
  id: z.uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "required").max(200),
  subtitle: z.string().trim().max(120).optional(),
  nameEn: z.string().trim().max(200).optional(),
  subtitleEn: z.string().trim().max(120).optional(),
  descriptionEn: z.string().trim().max(5000).optional(),
  featuresEn: z.string().optional(),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(5000).optional(),
  features: z.string().optional(),
  price: kr.refine((v) => v > 0, "positive"),
  compareAt: z.union([z.literal(""), kr]).optional(),
  stock: z.coerce.number().int("wholeNumber").min(0, "negative"),
  swatch: z.union([z.literal(""), z.string().regex(/^#[0-9a-fA-F]{6}$/, "hex")]).optional(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean(),
  featured: z.boolean(),
  images: z.array(z.string().min(1)).max(12),
})

export async function saveProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin()
  const parsed = productSchema.safeParse({
    ...Object.fromEntries(form),
    active: form.get("active") === "on",
    featured: form.get("featured") === "on",
    images: form.getAll("images").map(String),
  })
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    parsed.error.issues.forEach((i) => {
      const k = String(i.path[0])
      fieldErrors[k] ??= i.message
    })
    return { error: "fixFields", fieldErrors }
  }
  const p = parsed.data
  const slug = slugify(p.slug || `${p.name} ${p.subtitle ?? ""}`)
  if (!slug) return { error: "slug", fieldErrors: { slug: "required" } }
  if (p.compareAt && p.compareAt <= p.price) return { error: "compareAt", fieldErrors: { compareAt: "compareAt" } }

  const row = {
    name: p.name,
    subtitle: p.subtitle || null,
    slug,
    description: p.description ?? "",
    features: (p.features ?? "").split("\n").map((f) => f.trim()).filter(Boolean),
    name_en: p.nameEn || null,
    subtitle_en: p.subtitleEn || null,
    description_en: p.descriptionEn || null,
    features_en: (p.featuresEn ?? "").split("\n").map((f) => f.trim()).filter(Boolean),
    price_ore: p.price,
    compare_at_ore: p.compareAt || null,
    stock: p.stock,
    swatch: p.swatch || null,
    sort_order: p.sortOrder,
    active: p.active,
    featured: p.featured,
    images: p.images,
  }

  const db = serviceClient()
  const { data, error } = p.id
    ? await db.from("products").update(row).eq("id", p.id).select("id").single()
    : await db.from("products").insert(row).select("id").single()

  if (error) {
    if (error.code === "23505") return { error: "slugTaken", fieldErrors: { slug: "slugTaken" } }
    return { error: error.message }
  }
  refreshStorefront()
  revalidatePath("/admin/products")
  if (!p.id) redirect(`/admin/products/${data.id}?created=1`)
  return { ok: true }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const db = serviceClient()
  // Keep order history intact: order_items.product_id is set null on delete.
  const { error } = await db.from("products").delete().eq("id", id)
  if (error) return { error: error.message }
  refreshStorefront()
  redirect("/admin/products")
}

export async function uploadProductImage(form: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin()
  const file = form.get("file")
  if (!(file instanceof File) || !file.size) return { error: "noFile" }
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) return { error: "fileType" }
  if (file.size > 10 * 1024 * 1024) return { error: "fileSize" }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg")
  const path = `products/${crypto.randomUUID()}.${ext}`
  const db = serviceClient()
  const { error } = await db.storage.from("product-images").upload(path, file, { contentType: file.type, cacheControl: "31536000" })
  if (error) return { error: error.message }
  return { url: db.storage.from("product-images").getPublicUrl(path).data.publicUrl }
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["cancelled"],
  paid: ["fulfilled", "cancelled"],
  fulfilled: ["paid"],
  cancelled: [],
  refunded: [],
}

export async function updateOrderStatus(id: string, status: OrderStatus, tracking?: string) {
  await requireAdmin()
  const db = serviceClient()
  const { data: order } = await db.from("orders").select("status").eq("id", id).single()
  if (!order || !transitions[order.status as OrderStatus].includes(status)) return { error: "transition" }

  const patch: Record<string, unknown> = { status }
  if (status === "fulfilled") {
    patch.fulfilled_at = new Date().toISOString()
    patch.tracking_number = tracking?.trim() || null
  }
  const { error } = await db.from("orders").update(patch).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/orders/${id}`)
  revalidatePath("/admin/orders")
  return { ok: true }
}

export async function refundOrder(id: string) {
  await requireAdmin()
  const db = serviceClient()
  const { data: order } = await db.from("orders").select("status, stripe_payment_intent_id").eq("id", id).single()
  if (!order?.stripe_payment_intent_id || !["paid", "fulfilled", "cancelled"].includes(order.status)) {
    return { error: "refundOnlyPaid" }
  }
  try {
    await stripe().refunds.create({ payment_intent: order.stripe_payment_intent_id }, { idempotencyKey: `refund-${id}` })
  } catch (e) {
    return { error: e instanceof Error ? e.message : "refundFailed" }
  }
  await db.from("orders").update({ status: "refunded" }).eq("id", id)
  revalidatePath(`/admin/orders/${id}`)
  return { ok: true }
}

export async function saveOrderNote(id: string, note: string) {
  await requireAdmin()
  await serviceClient().from("orders").update({ note: note.slice(0, 2000) || null }).eq("id", id)
  revalidatePath(`/admin/orders/${id}`)
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin()
  const parsed = z
    .object({ shipping: kr, freeOver: z.union([z.literal(""), kr]) })
    .safeParse({ shipping: form.get("shipping") || "0", freeOver: form.get("freeOver") ?? "" })
  if (!parsed.success) return { error: parsed.error.issues[0].message || "amount" }
  const { error } = await serviceClient()
    .from("store_settings")
    .update({ shipping_fee_ore: parsed.data.shipping, free_shipping_over_ore: parsed.data.freeOver || null })
    .eq("id", true)
  if (error) return { error: error.message }
  refreshStorefront()
  return { ok: true }
}
