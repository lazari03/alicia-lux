import Link from "next/link"

export default function NotFound() {
  return (
    <div className="container-lux grid min-h-[60vh] place-content-center justify-items-center gap-5 py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display text-[clamp(40px,6vw,72px)] leading-none">This page has moved on</h1>
      <p className="max-w-sm text-muted">The page you were looking for doesn’t exist, but the collection does.</p>
      <Link href="/shop" className="btn btn-primary">Shop the collection</Link>
    </div>
  )
}
