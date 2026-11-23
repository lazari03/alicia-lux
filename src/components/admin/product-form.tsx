"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2, X } from "lucide-react"
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
  const err = state?.fieldErrors ?? {}

  useEffect(() => {
    if (params.get("created")) toast.success("Product created")
  }, [params])
  useEffect(() => {
    if (state?.ok) toast.success("Saved")
    else if (state?.error) toast.error(state.error)
  }, [state])

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
        else toast.error(`${file.name}: ${res.error}`)
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
          <div className="grid gap-4 sm:grid-cols-2">
            <F err={err} name="name" label="Name"><input name="name" defaultValue={product?.name} required className={cn(input, border("name"))} /></F>
            <F err={err} name="subtitle" label="Finish / subtitle" hint="Shown under the name, e.g. “Champagne”"><input name="subtitle" defaultValue={product?.subtitle ?? ""} className={cn(input, border("subtitle"))} /></F>
          </div>
          <F err={err} name="description" label="Description">
            <textarea name="description" defaultValue={product?.description} rows={5} className={cn(input, "h-auto py-2.5", border("description"))} />
          </F>
          <F err={err} name="features" label="Highlights" hint="One per line">
            <textarea name="features" defaultValue={product?.features.join("\n")} rows={4} className={cn(input, "h-auto py-2.5", border("features"))} />
          </F>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">Images</h2>
            <span className="text-xs text-muted">First image is the main photo</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {images.map((src, i) => (
              <div key={src} className="group relative aspect-[4/5] overflow-hidden rounded-md border border-line bg-surface">
                <Image src={src} alt="" fill sizes="160px" className="object-cover" />
                {i === 0 && <span className="absolute top-1.5 left-1.5 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] text-paper">Main</span>}
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <span className="flex gap-1">
                    <IconBtn label="Move left" onClick={() => move(i, -1)} disabled={i === 0}><ArrowLeft className="size-3.5" /></IconBtn>
                    <IconBtn label="Move right" onClick={() => move(i, 1)} disabled={i === images.length - 1}><ArrowRight className="size-3.5" /></IconBtn>
                  </span>
                  <IconBtn label="Remove image" onClick={() => setImages((imgs) => imgs.filter((x) => x !== src))}><X className="size-3.5" /></IconBtn>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="grid aspect-[4/5] place-content-center justify-items-center gap-2 rounded-md border border-dashed border-line-strong text-xs text-muted transition-colors hover:border-gold hover:text-ink"
            >
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" strokeWidth={1.5} />}
              {uploading ? `Uploading ${uploading}…` : "Add images"}
            </button>
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => upload(e.target.files)} />
        </Card>
      </div>

      <div className="grid content-start gap-4">
        <Card className="grid gap-4">
          <F err={err} name="price" label="Price (SEK, incl. VAT)"><input name="price" inputMode="decimal" defaultValue={kr(product?.price_ore)} required className={cn(input, border("price"))} /></F>
          <F err={err} name="compareAt" label="Compare-at price" hint="Optional — shows the product as on sale"><input name="compareAt" inputMode="decimal" defaultValue={kr(product?.compare_at_ore)} className={cn(input, border("compareAt"))} /></F>
          <F err={err} name="stock" label="Stock"><input name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? 0} required className={cn(input, border("stock"))} /></F>
        </Card>
        <Card className="grid gap-4">
          <label className="flex items-center justify-between gap-3 text-sm"><span><b className="font-medium">Visible in shop</b><small className="block text-xs text-muted">Hidden products can’t be bought</small></span><input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="size-5 accent-ink" /></label>
          <label className="flex items-center justify-between gap-3 text-sm"><span><b className="font-medium">Featured</b><small className="block text-xs text-muted">Shown on the home page</small></span><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="size-5 accent-ink" /></label>
        </Card>
        <Card className="grid gap-4">
          <F err={err} name="slug" label="URL slug" hint="Leave empty to generate from the name"><input name="slug" defaultValue={product?.slug} className={cn(input, border("slug"))} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F err={err} name="swatch" label="Swatch colour"><input name="swatch" placeholder="#583b2a" defaultValue={product?.swatch ?? ""} className={cn(input, border("swatch"))} /></F>
            <F err={err} name="sortOrder" label="Sort order"><input name="sortOrder" type="number" defaultValue={product?.sort_order ?? 0} className={cn(input, border("sortOrder"))} /></F>
          </div>
        </Card>

        <div className="sticky bottom-4 grid gap-2">
          <button type="submit" disabled={saving || uploading > 0} className="btn btn-primary w-full shadow-lg">
            {saving ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
          {product && (
            <button
              type="button"
              disabled={deleting}
              onClick={() =>
                confirm("Delete this product permanently? Past orders keep their history. To just hide it, untick “Visible in shop”.") &&
                startDelete(async () => {
                  const res = await deleteProduct(product.id)
                  if (res?.error) toast.error(res.error)
                })
              }
              className="inline-flex min-h-10 items-center justify-center gap-2 text-sm text-danger hover:underline"
            >
              <Trash2 className="size-4" /> Delete product
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
