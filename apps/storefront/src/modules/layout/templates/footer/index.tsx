import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="border-t border-[#dedbd3] bg-[#f5f3ed] text-[#292923]">
      <div className="content-container grid gap-12 py-20 small:grid-cols-3">
        <div className="small:col-span-2">
          <LocalizedClientLink href="/" className="font-serif text-3xl tracking-[0.16em]">ALICIA LUX</LocalizedClientLink>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#706e66]">A considered wardrobe. An individual point of view.<br />Discover pieces that feel like you.</p>
        </div>
        <nav aria-label="Footer" className="grid gap-4 text-xs uppercase tracking-[0.12em]">
          <LocalizedClientLink href="/store">Shop the edit ↗</LocalizedClientLink>
          <LocalizedClientLink href="/account">Your account ↗</LocalizedClientLink>
          <LocalizedClientLink href="/cart">Shopping bag ↗</LocalizedClientLink>
        </nav>
      </div>
      <div className="content-container flex flex-wrap justify-between gap-4 border-t border-[#dedbd3] py-7 text-[10px] uppercase tracking-widest text-[#706e66]">
        <p>© {new Date().getFullYear()} Alicia Lux</p><p>Thoughtfully selected. Beautifully worn.</p>
      </div>
    </footer>
  )
}
