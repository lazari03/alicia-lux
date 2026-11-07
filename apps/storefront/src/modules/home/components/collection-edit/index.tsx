import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const edits = [
  { title: "Everyday essentials", description: "The foundation of a considered wardrobe.", category: "shirts", image: "/images/collection.jpg", position: "center" },
  { title: "Off-duty, elevated", description: "Ease into something extraordinary.", category: "sweatshirts", image: "/images/boutique.jpg", position: "center" },
]

export default function CollectionEdit() {
  return (
    <section id="collections" aria-labelledby="collection-heading" className="content-container scroll-mt-28 py-20 small:py-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div><p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#8c795e]">Selected with intention</p><h2 id="collection-heading" className="font-serif text-4xl small:text-5xl">Find your next favourite.</h2></div>
        <LocalizedClientLink href="/store" className="border-b border-[#292923] pb-2 text-xs uppercase tracking-widest">View all pieces ↗</LocalizedClientLink>
      </div>
      <div className="grid gap-6 small:grid-cols-2">
        {edits.map((edit) => (
          <LocalizedClientLink key={edit.title} href={`/categories/${edit.category}`} className="group relative isolate flex aspect-[4/5] items-end overflow-hidden bg-[#d4cec2] p-8 text-white">
            <Image src={edit.image} alt={edit.title} fill sizes="(min-width: 1024px) 50vw, 100vw" style={{ objectPosition: edit.position }} className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="relative"><h3 className="font-serif text-3xl small:text-4xl">{edit.title}</h3><p className="mt-3 text-sm text-white/85">{edit.description}</p><span className="mt-6 inline-block border-b border-white/60 pb-1 text-[10px] uppercase tracking-[0.18em]">Explore the edit ↗</span></div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
