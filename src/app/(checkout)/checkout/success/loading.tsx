export default function Loading() {
  return (
    <div className="container-lux grid max-w-3xl justify-items-center gap-4 py-24" role="status" aria-label="Confirming your order">
      <div className="skeleton size-12 rounded-full" />
      <div className="skeleton h-3 w-28" />
      <div className="skeleton h-14 w-[min(90%,420px)]" />
      <div className="skeleton mt-10 h-64 w-full rounded-md" />
    </div>
  )
}
