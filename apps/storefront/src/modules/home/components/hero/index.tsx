import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate min-h-[650px] h-[82svh] max-h-[1050px] overflow-hidden bg-[#746a5b] text-white">
      <Image src="/images/editorial.jpg" alt="Contemporary style on a sunlit city street" fill priority sizes="100vw" className="object-cover object-[center_35%]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      <div className="content-container relative flex h-full min-h-[650px] flex-col justify-center py-24">
        <p className="mb-7 text-[11px] uppercase tracking-[0.3em]">The art of everyday dressing</p>
        <h1 id="hero-heading" className="max-w-2xl font-serif text-5xl font-normal leading-[1.05] tracking-tight small:text-7xl medium:text-8xl">Less ordinary.<br /><span className="italic">More you.</span></h1>
        <p className="mt-7 max-w-sm text-sm leading-7 text-white/85">A thoughtful edit of contemporary essentials and pieces to fall in love with. Welcome to Alicia Lux.</p>
        <div className="mt-10 flex flex-wrap gap-3 text-[11px] font-medium uppercase tracking-[0.16em]">
          <LocalizedClientLink href="/store" className="border border-white bg-white px-7 py-4 text-[#24241f] transition-colors hover:bg-[#e8dfd0] hover:border-[#e8dfd0]">Discover the edit ↗</LocalizedClientLink>
          <a href="#collections" className="border border-white/60 px-7 py-4 transition-colors hover:bg-white hover:text-[#24241f]">Explore collections</a>
        </div>
      </div>
      <p className="absolute bottom-8 right-6 text-[10px] uppercase tracking-[0.25em] small:right-12">Considered style. Lasting impressions.</p>
    </section>
  )
}
