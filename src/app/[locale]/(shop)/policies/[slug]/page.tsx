import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Fragment } from "react"
import { Link } from "@/i18n/navigation"

const slugs = ["terms", "privacy", "returns"] as const
type Slug = (typeof slugs)[number]
type Props = { params: Promise<{ slug: string; locale: string }> }
type Section = { title: string; paragraphs: string[] }

const resolve = (slug: string): Slug => ((slugs as readonly string[]).includes(slug) ? (slug as Slug) : notFound())

export const dynamic = "force-dynamic"
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "policies" })
  return { title: t(`titles.${resolve(slug)}`) }
}

/** Renders `<link href="…">text</link>` inside translated paragraphs. */
function Paragraph({ text }: { text: string }) {
  const parts = text.split(/(<link href="[^"]+">[^<]*<\/link>)/g)
  return (
    <p>
      {parts.map((part, i) => {
        const m = part.match(/^<link href="([^"]+)">([^<]*)<\/link>$/)
        if (!m) return <Fragment key={i}>{part}</Fragment>
        const [, href, label] = m
        return href.startsWith("/") ? (
          <Link key={i} href={href}>{label}</Link>
        ) : (
          <a key={i} href={href} target="_blank" rel="noreferrer">{label}</a>
        )
      })}
    </p>
  )
}

const SectionBlock = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-[clamp(28px,5vw,48px)]">
    <h2 className="font-serif text-[clamp(26px,3vw,34px)] leading-tight">{title}</h2>
    <div className="mt-3 grid gap-3 leading-[1.75] text-muted [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4">{children}</div>
  </section>
)

export default async function PolicyPage({ params }: Props) {
  const { slug: raw, locale } = await params
  setRequestLocale(locale)
  const slug = resolve(raw)
  const t = await getTranslations("policies")
  const sections = t.raw(slug) as Section[]

  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL
  const seller = process.env.STORE_LEGAL_NAME
  const orgNo = process.env.STORE_ORGANISATION_NUMBER
  const address = process.env.STORE_BUSINESS_ADDRESS

  return (
    <article className="container-lux max-w-[880px] py-[clamp(44px,8vw,104px)]">
      <p className="eyebrow mb-4">{t("eyebrow")}</p>
      <h1 className="display text-[clamp(42px,6vw,76px)] leading-none">{t(`titles.${slug}`)}</h1>
      {sections.map((section) => (
        <SectionBlock key={section.title} title={section.title}>
          {section.paragraphs.map((p) => <Paragraph key={p} text={p} />)}
        </SectionBlock>
      ))}
      <SectionBlock title={t("contactTitle")}>
        {seller && <p>{seller}{orgNo ? ` · ${t("orgNumber", { number: orgNo })}` : ""}</p>}
        {address && <p>{address}</p>}
        {email ? (
          <p>{t.rich("emailHelp", { email, mail: (chunks) => <a href={`mailto:${email}`}>{chunks}</a> })}</p>
        ) : (
          <p>{t("noEmail")}</p>
        )}
      </SectionBlock>
    </article>
  )
}
