import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const finishes = [
  { name: "Coffee Brown", mood: "Warm. Rich. Effortlessly timeless.", image: "coffee", color: "#583b2a" },
  { name: "Champagne", mood: "Soft light, in its most beautiful form.", image: "champagne", color: "#d6ba95" },
  { name: "Noir", mood: "A quiet statement. An enduring classic.", image: "noir", color: "#26231f" },
]

export default function CollectionEdit() {
  return (
    <section id="finishes" aria-labelledby="collection-heading" className="content-container py-20 small:py-32">
      <div className="lux-reveal mb-10 flex flex-wrap items-end justify-between gap-6 small:mb-14">
        <div>
          <p className="lux-eyebrow mb-4">One signature. Three expressions.</p>
          <h2 id="collection-heading" className="lux-h2">
            A shade of <em>you.</em>
          </h2>
        </div>
        <LocalizedClientLink href="/store" className="lux-link">
          Explore the collection <span aria-hidden="true">→</span>
        </LocalizedClientLink>
      </div>

      <ul className="grid gap-x-5 gap-y-10 small:grid-cols-3">
        {finishes.map((finish, index) => (
          <li key={finish.image} className="lux-reveal">
            <LocalizedClientLink href="/store" className="group block">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-[10px] bg-lux-sand">
                <Image
                  src={`/images/signature-${finish.image}.webp`}
                  alt={`Alicia Lux jewelry and beauty organizer in ${finish.name}, shown open`}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition-transform duration-[1200ms] ease-lux group-hover:scale-[1.04]"
                />
                <span className="absolute left-4 top-4 rounded-full bg-lux-paper/90 px-3 py-1 text-[10.5px] font-medium tabular-nums tracking-label backdrop-blur">
                  0{index + 1}
                </span>
                <span className="absolute inset-x-4 bottom-4 flex h-11 translate-y-3 items-center justify-center rounded-full bg-lux-paper/95 text-[11px] font-medium uppercase tracking-label opacity-0 shadow-lux-soft backdrop-blur transition-[opacity,transform] duration-500 ease-lux group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  Shop {finish.name}
                </span>
              </span>
              <span className="mt-5 flex items-center justify-between gap-4">
                <span className="lux-h3">{finish.name}</span>
                <span
                  className="h-4 w-4 shrink-0 rounded-full ring-1 ring-lux-line ring-offset-4 ring-offset-lux-paper"
                  style={{ backgroundColor: finish.color }}
                  aria-hidden="true"
                />
              </span>
              <span className="mt-2 block text-sm leading-6 text-lux-muted">{finish.mood}</span>
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
