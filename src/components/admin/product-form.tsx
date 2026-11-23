"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useActionState, useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { deleteProduct, saveProduct, uploadProductImage, type ActionState } from "@/app/admin/actions"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Card } from "./ui"

const kr = (ore?: number | null) => (ore == null ? "" : (ore / 100).toFixed(ore % 100 ? 2 : 0))

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, saving] = useActionState<ActionState, FormData>(saveProduct, null)
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [uploading, setUploading] = useState(0)
  const [deleting, startDelete] = useTransition()
  const fileInput = useRef<HTMLInputElement>(null)
  const params = useSearchParams()
  const t = useTranslations("admin.products")
  const tf = useTranslations("admin.products.form")
  const te = useTranslations("admin.errors")
  const errText = (code: string) => (te.has(code) ? te(code) : code)
  const err = Object.fromEntries(Object.entries(state?.fieldErrors ?? {}).map(([k, v]) => [k, errText(v)]))

  useEffect(() => {
    if (params.get("created")) toast.success(t("created"))
  }, [params, t])
  useEffect(() => {
    if (state?.ok) toast.success(t("saved"))
    else if (state?.error) toast.error(te.has(state.error) ? te(state.error) : state.error)
  }, [state, t, te])

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    const list = [...files]
    setUploading((n) => n + list.length)
    await Promise.all(
      list.map(async (file) => {
        const fd = new FormData()
        fd.set("file", file)
        const res = await uploadProductImage(fd)
        if (res.url) setImages((imgs) => [...imgs, res.url!])
        else toast.error(`${file.name}: ${errText(res.error ?? "generic")}`)
        setUploading((n) => n - 1)
      })
    )
    if (fileInput.current) fileInput.current.value = ""
  }

  const move = (i: number, dir: -1 | 1) =>
    setImages((imgs) => {
      const next = [...imgs]
      const j = i + dir
      if (j < 0 || j >= next.length) return imgs
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const input = "h-11 w-full rounded-md border bg-white px-3 text-sm focus:border-gold focus:outline-none"
  const border = (name: string) => (err[name] ? "border-danger" : "border-line")

  return (
    <form action={action} className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      {images.map((src) => <input key={src} type="hidden" name="images" value={src} />)}

      <div className="grid content-start gap-4">
        <Card className="grid gap-4">
          <h2 className="text-sm font-medium">{tf("swedish")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F err={err} name="name" label={tf("name")}><input name="name" defaultValue={product?.name} required className={cn(input, border("name"))} /></F>
            <F err={err} name="subtitle" label={tf("subtitle")} hint={tf("subtitleHint")}><input name="subtitle" defaultValue={product?.subtitle ?? ""} className={cn(input, border("subtitle"))} /></F>
          </div>
          <F err={err} name="description" label={tf("description")}>
            <textarea name="description" defaultValue={product?.description} rows={5} className={cn(input, "h-auto py-2.5", border("description"))} />
          </F>
          <F err={err} name="features" label={tf("features")} hint={tf("featuresHint")}>
            <textarea name="features" defaultValue={product?.features.join("\n")} rows={4} className={cn(input, "h-auto py-2.5", border("features"))} />
          </F>
        </Card>

        <Card className="grid gap-4">
          <div>
            <h2 className="text-sm font-medium">{tf("english")}</h2>
            <p className="mt-1 text-xs text-muted">{tf("englishHint")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <F err={err} name="nameEn" label={tf("name")}><input name="nameEn" defaultValue={product?.name_en ?? ""} placeholder={product?.name} className={cn(input, border("nameEn"))} /></F>
            <F err={err} name="subtitleEn" label={tf("subtitle")}><input name="subtitleEn" defaultValue={product?.subtitle_en ?? ""} placeholder={product?.subtitle ?? ""} className={cn(input, border("subtitleEn"))} /></F>
          </div>
          <F err={err} name="descriptionEn" label={tf("description")}>
            <textarea name="descriptionEn" defaultValue={product?.description_en ?? ""} rows={5} className={cn(input, "h-auto py-2.5", border("descriptionEn"))} />
          </F>
          <F err={err} name="featuresEn" label={tf("features")} hint={tf("featuresHint")}>
            <textarea name="featuresEn" defaultValue={product?.features_en?.join("\n") ?? ""} rows={4} className={cn(input, "h-auto py-2.5", border("featuresEn"))} />
          </F>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">{tf("images")}</h2>
            <span className="text-xs text-muted">{tf("imagesHint")}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {images.map((src, i) => (
              <div key={src} className="group relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-surface">
                <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                {i === 0 && <span className="absolute top-1.5 left-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] text-paper">{tf("main")}</span>}
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <span className="flex gap-1">
                    <IconBtn label={tf("moveLeft")} onClick={() => move(i, -1)} disabled={i === 0}><ArrowLeft className="size-3.5" /></IconBtn>
                    <IconBtn label={tf("moveRight")} onClick={() => move(i, 1)} disabled={i === images.length - 1}><ArrowRight className="size-3.5" /></IconBtn>
                  </span>
                  <IconBtn label={tf("removeImage")} onClick={() => setImages((imgs) => imgs.filter((x) => x !== src))}><X className="size-3.5" /></IconBtn>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="grid aspect-[4/5] place-content-center justify-items-center gap-2 rounded-md border border-dashed border-line-strong text-xs text-muted transition-colors hover:border-gold hover:text-ink"
            >
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" strokeWidth={1.5} />}
              {uploading ? tf("uploading", { count: uploading }) : tf("addImages")}
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
        </Card>
      </div>

      <div className="grid content-start gap-4">
        <Card className="grid gap-4">
          <F err={err} name="price" label={tf("price")}><input name="price" inputMode="decimal" defaultValue={kr(product?.price_ore)} required className={cn(input, border("price"))} /></F>
          <F err={err} name="compareAt" label={tf("compareAt")} hint={tf("compareAtHint")}><input name="compareAt" inputMode="decimal" defaultValue={kr(product?.compare_at_ore)} className={cn(input, border("compareAt"))} /></F>
          <F err={err} name="stock" label={tf("stock")}><input name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? 0} required className={cn(input, border("stock"))} /></F>
        </Card>
        <Card className="grid gap-4">
          <label className="flex items-center justify-between gap-3 text-sm"><span><b className="font-medium">{tf("visible")}</b><small className="block text-xs text-muted">{tf("visibleHint")}</small></span><input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-5 accent-ink" /></label>
          <label className="flex items-center justify-between gap-3 text-sm"><span><b className="font-medium">{tf("featured")}</b><small className="block text-xs text-muted">{tf("featuredHint")}</small></span><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="size-5 accent-ink" /></label>
        </Card>
        <Card className="grid gap-4">
          <F err={err} name="slug" label={tf("slug")} hint={tf("slugHint")}><input name="slug" defaultValue={product?.slug} className={cn(input, border("slug"))} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F err={err} name="swatch" label={tf("swatch")}><input name="swatch" placeholder="#583b2a" defaultValue={product?.swatch ?? ""} className={cn(input, border("swatch"))} /></F>
            <F err={err} name="sortOrder" label={tf("sortOrder")}><input name="sortOrder" type="number" defaultValue={product?.sort_order ?? 0} className={cn(input, border("sortOrder"))} /></F>
          </div>
        </Card>

        <div className="sticky bottom-4 grid gap-2">
          <button type="submit" disabled={saving || uploading > 0} className="btn btn-primary w-full shadow-lg">
            {saving ? tf("saving") : product ? tf("save") : tf("create")}
          </button>
          {product && (
            <button
              type="button"
              disabled={deleting}
              onClick={() =>
                confirm(tf("confirmDelete")) &&
                startDelete(async () => {
                  const res = await deleteProduct(product.id)
                  if (res?.error) toast.error(errText(res.error))
                })
              }
              className="inline-flex min-h-10 items-center justify-center gap-2 text-sm text-danger hover:underline"
            >
              <Trash2 className="size-4" /> {tf("delete")}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

function IconBtn({ label, children, ...props }: { label: string; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" aria-label={label} className="grid size-7 place-items-center rounded bg-paper/90 text-ink shadow-sm hover:bg-paper disabled:opacity-30" {...props}>
      {children}
    </button>
  )
}

function F({ err, name, label, hint, children }: { err: Record<string, string>; name: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {err[name] ? <small className="text-xs text-danger">{err[name]}</small> : hint && <small className="text-xs text-muted">{hint}</small>}
    </label>
  )
}
