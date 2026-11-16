import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="lux-footer border-t">
      <div className="content-container grid gap-12 py-20 small:grid-cols-3">
        <div className="small:col-span-2">
          <LocalizedClientLink href="/" className="font-serif text-3xl tracking-[0.16em]">ALICIA LUX</LocalizedClientLink>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#c9bcb0]">A beautiful home for the things you treasure.<br />Jewelry, beauty, and the art of your everyday.</p>
        </div>
        <nav aria-label="Footer" className="grid gap-4 text-xs uppercase tracking-[0.12em]">
          <LocalizedClientLink href="/store">The collection ↗</LocalizedClientLink>
          <LocalizedClientLink href="/account">Your account ↗</LocalizedClientLink>
          <LocalizedClientLink href="/cart">Shopping bag ↗</LocalizedClientLink>
        </nav>
      </div>
      <div className="content-container flex flex-wrap justify-between gap-4 border-t border-[#65564b] py-7 text-[10px] uppercase tracking-widest text-[#c9bcb0]">
        <p>© {new Date().getFullYear()} Alicia Lux</p><p>Objects for the everyday extraordinary.</p>
      </div>
    </footer>
  )
}
