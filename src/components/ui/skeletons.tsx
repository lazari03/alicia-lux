/** Placeholder blocks that mirror the real layouts while pages load. */
const Bar = ({ className = "" }: { className?: string }) => <div className={`skeleton ${className}`} />

export function ProductCardSkeleton() {
  return (
    <div className="grid gap-3 text-center" aria-hidden>
      <Bar className="aspect-[4/5] w-full rounded-[2px]" />
      <Bar className="mx-auto h-5 w-3/5" />
      <Bar className="mx-auto h-3.5 w-2/5" />
      <Bar className="mx-auto h-4 w-1/4" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-[clamp(14px,2.4vw,32px)] gap-y-12 md:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}><ProductCardSkeleton /></li>
      ))}
    </ul>
  )
}

export function ShopSkeleton() {
  return (
    <div className="container-lux py-[clamp(36px,6vw,88px)]" role="status" aria-label="Loading products">
      <div className="mb-8 grid justify-items-center gap-4">
        <Bar className="h-3 w-24" />
        <Bar className="h-[clamp(44px,6vw,80px)] w-[min(80%,460px)]" />
        <Bar className="h-4 w-[min(90%,380px)]" />
      </div>
      <div className="mb-[clamp(28px,4vw,52px)] flex flex-col items-center justify-between gap-3 border-y border-line py-3 sm:flex-row">
        <Bar className="h-4 w-20" />
        <Bar className="h-12 w-full rounded-full sm:w-[420px]" />
      </div>
      <ProductGridSkeleton />
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div className="container-lux py-6 sm:py-10" role="status" aria-label="Loading product">
      <Bar className="mb-6 h-4 w-48" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div className="grid gap-3 lg:grid-cols-[84px_1fr] lg:gap-4">
          <Bar className="order-1 aspect-[4/5] w-full lg:order-2" />
          <div className="order-2 flex gap-2.5 lg:order-1 lg:flex-col">
            <Bar className="aspect-[4/5] w-[72px] lg:w-full" />
            <Bar className="aspect-[4/5] w-[72px] lg:w-full" />
          </div>
        </div>
        <div className="grid content-start gap-4">
          <Bar className="h-3 w-20" />
          <Bar className="h-12 w-4/5" />
          <Bar className="h-7 w-1/3" />
          <Bar className="h-6 w-40" />
          <div className="mt-4 flex gap-3"><Bar className="size-10 rounded-full" /><Bar className="size-10 rounded-full" /><Bar className="size-10 rounded-full" /></div>
          <Bar className="mt-4 h-[52px] w-full" />
          <Bar className="mt-4 h-4 w-full" /><Bar className="h-4 w-11/12" /><Bar className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

export function AdminSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <Bar className="mb-8 h-10 w-56" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Bar key={i} className="h-28 rounded-lg" />)}
      </div>
      <Bar className="mt-4 h-72 rounded-lg" />
    </div>
  )
}
