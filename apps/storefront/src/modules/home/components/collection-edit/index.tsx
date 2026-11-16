import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const finishes = [
  { name: "Coffee Brown", mood: "Warm. Rich. Effortlessly timeless.", image: "coffee", color: "#583b2a" },
  { name: "Champagne", mood: "Soft light, in its most beautiful form.", image: "champagne", color: "#d6ba95" },
  { name: "Noir", mood: "A quiet statement. An enduring classic.", image: "noir", color: "#26231f" },
]

export default function CollectionEdit() {
  return (
    <section id="collections" aria-labelledby="collection-heading" className="content-container lux-section">
      <div className="lux-section-heading">
        <div><p className="lux-eyebrow">One signature. Three expressions.</p><h2 id="collection-heading">A shade of <em>you.</em></h2></div>
        <LocalizedClientLink href="/store" className="lux-text-link">Explore the collection <span aria-hidden="true">↗</span></LocalizedClientLink>
      </div>
      <div className="lux-finishes">
        {finishes.map((finish, index) => (
          <figure key={finish.image} className="lux-finish">
            <div className="lux-finish-image"><Image src={`/images/signature-${finish.image}.webp`} alt={`Alicia Lux jewelry and beauty organizer in ${finish.name}, shown open`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" /><span className="lux-finish-number">0{index + 1}</span></div>
            <figcaption><div className="lux-finish-title"><h3>{finish.name}</h3><span className="lux-color" style={{ backgroundColor: finish.color }} aria-hidden="true" /></div><p>{finish.mood}</p></figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
