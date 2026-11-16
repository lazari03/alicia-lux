import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const swatches = [
  { name: "Coffee Brown", color: "#583b2a" },
  { name: "Champagne", color: "#d6ba95" },
  { name: "Noir", color: "#26231f" },
]

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="grid bg-lux-cream small:min-h-[min(calc(100svh-var(--header-h)-2.5rem),880px)] small:grid-cols-[5fr_7fr]"
    >
      <div className="order-2 flex flex-col justify-center px-[clamp(1.25rem,4vw,3.5rem)] py-12 small:order-1 small:py-20 small:pr-[clamp(2rem,5vw,5rem)]">
        <p className="lux-eyebrow mb-6">The signature collection</p>
        <h1 id="hero-heading" className="lux-display">
          For all that
          <br />
          you <em>treasure.</em>
        </h1>
        <p className="lux-lede mt-7 max-w-[34ch]">
          Your favourite pieces. Your daily rituals. A beautiful place to keep them together.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
          <LocalizedClientLink href="/store" className="lux-btn">
            Shop the collection
            <span className="lux-arrow" aria-hidden="true">→</span>
          </LocalizedClientLink>
          <a href="#details" className="lux-link">
            A closer look
          </a>
        </div>

        <a
          href="#finishes"
          className="group mt-12 inline-flex items-center gap-4 self-start small:mt-16"
          aria-label="Three finishes: Coffee Brown, Champagne and Noir"
        >
          <span className="flex -space-x-1.5" aria-hidden="true">
            {swatches.map((swatch) => (
              <span
                key={swatch.name}
                className="h-6 w-6 rounded-full ring-2 ring-lux-cream transition-transform duration-500 ease-lux group-hover:translate-x-0.5"
                style={{ backgroundColor: swatch.color }}
              />
            ))}
          </span>
          <span className="text-[12px] uppercase tracking-label text-lux-muted transition-colors group-hover:text-lux-ink">
            Three finishes
          </span>
        </a>
      </div>

      <div className="relative order-1 aspect-square overflow-hidden small:order-2 small:aspect-auto">
        <Image
          src="/images/signature-coffee.webp"
          alt="Open Alicia Lux coffee-brown jewelry box with an illuminated mirror and organized jewelry drawers"
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover"
        />
        <span className="absolute bottom-4 left-4 rounded-full bg-lux-paper/90 px-4 py-2 text-[10.5px] font-medium uppercase tracking-label backdrop-blur small:bottom-6 small:left-6">
          Shown in Coffee Brown
        </span>
      </div>
    </section>
  )
}
