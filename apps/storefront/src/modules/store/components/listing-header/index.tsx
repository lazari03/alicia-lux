import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Crumb = { label: string; href?: string }

export default function ListingHeader({
  eyebrow,
  title,
  description,
  crumbs,
  titleTestId,
  children,
}: {
  eyebrow: string
  title: string
  description?: string | null
  crumbs: Crumb[]
  titleTestId?: string
  children?: React.ReactNode
}) {
  return (
    <header className="border-b border-lux-line bg-lux-cream">
      <div className="content-container py-10 small:py-16">
        <nav aria-label="Breadcrumb" className="mb-8 text-[11px] uppercase tracking-label text-lux-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <LocalizedClientLink href="/" className="hover:text-lux-ink">
                Home
              </LocalizedClientLink>
            </li>
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {crumb.href ? (
                  <LocalizedClientLink href={crumb.href} className="hover:text-lux-ink" data-testid="sort-by-link">
                    {crumb.label}
                  </LocalizedClientLink>
                ) : (
                  <span className="text-lux-ink" aria-current={index === crumbs.length - 1 ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="lux-eyebrow mb-4">{eyebrow}</p>
        <h1 className="lux-h2" data-testid={titleTestId}>
          {title}
        </h1>
        {description && <p className="lux-lede mt-5 max-w-[60ch]">{description}</p>}
        {children}
      </div>
    </header>
  )
}
