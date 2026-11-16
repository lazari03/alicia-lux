import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type FooterLink = { label: string; href: string }

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <details className="lux-details group border-b border-white/10 small:border-0" open>
      <summary className="py-4 text-[11px] font-medium uppercase tracking-label text-lux-gold-soft small:pointer-events-none small:py-0 small:after:!hidden">
        {title}
      </summary>
      <ul className="flex flex-col gap-3 pb-6 text-sm text-lux-paper/75 small:pb-0 small:pt-5">
        {links.map((link) => (
          <li key={link.href}>
            <LocalizedClientLink href={link.href} className="transition-colors hover:text-lux-paper">
              {link.label}
            </LocalizedClientLink>
          </li>
        ))}
      </ul>
    </details>
  )
}

export default async function Footer() {
  const [categories, collections] = await Promise.all([
    listCategories().catch(() => []),
    listCollections({ fields: "id,handle,title" })
      .then(({ collections }) => collections)
      .catch(() => []),
  ])

  const shop: FooterLink[] = [
    { label: "Shop all", href: "/store" },
    ...(categories ?? [])
      .filter((category) => !category.parent_category)
      .slice(0, 5)
      .map((category) => ({ label: category.name, href: `/categories/${category.handle}` })),
    ...(collections ?? [])
      .slice(0, 4)
      .map((collection) => ({ label: collection.title, href: `/collections/${collection.handle}` })),
  ]

  return (
    <footer className="bg-lux-espresso text-lux-paper">
      <div className="content-container grid gap-x-10 gap-y-2 pb-12 pt-16 small:grid-cols-12 small:gap-y-12 small:pb-20 small:pt-24">
        <div className="pb-8 small:col-span-5 small:pb-0">
          <LocalizedClientLink href="/" className="font-serif text-[2rem] font-medium uppercase tracking-[0.24em]">
            Alicia Lux
          </LocalizedClientLink>
          <p className="mt-5 max-w-[36ch] text-sm leading-7 text-lux-paper/70">
            A beautiful home for the things you treasure. Jewelry, beauty, and the art of your everyday.
          </p>
        </div>
        <nav aria-label="Footer" className="contents">
          <div className="small:col-span-2 small:col-start-7">
            <Column title="Shop" links={shop} />
          </div>
          <div className="small:col-span-2">
            <Column
              title="The house"
              links={[
                { label: "Finishes", href: "/#finishes" },
                { label: "The ritual", href: "/#details" },
              ]}
            />
          </div>
          <div className="small:col-span-2">
            <Column
              title="Account"
              links={[
                { label: "Your account", href: "/account" },
                { label: "Orders", href: "/account/orders" },
                { label: "Shopping bag", href: "/cart" },
              ]}
            />
          </div>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="content-container flex flex-wrap justify-between gap-3 py-6 text-[10.5px] uppercase tracking-label text-lux-paper/60">
          <p>© {new Date().getFullYear()} Alicia Lux</p>
          <p>Objects for the everyday extraordinary</p>
        </div>
      </div>
    </footer>
  )
}
