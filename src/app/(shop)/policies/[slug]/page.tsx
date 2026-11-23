import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

const titles = { terms: "Terms & conditions", privacy: "Privacy policy", returns: "Returns & refunds" } as const
type Slug = keyof typeof titles
type Props = { params: Promise<{ slug: string }> }

const resolve = (slug: string): Slug => (slug in titles ? (slug as Slug) : notFound())

export const generateStaticParams = () => Object.keys(titles).map((slug) => ({ slug }))
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: titles[resolve((await params).slug)] }
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-[clamp(28px,5vw,48px)]">
    <h2 className="font-serif text-[clamp(26px,3vw,34px)] leading-tight">{title}</h2>
    <div className="mt-3 grid gap-3 leading-[1.75] text-muted [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4">{children}</div>
  </section>
)

function Contact() {
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL
  const seller = process.env.STORE_LEGAL_NAME
  const orgNo = process.env.STORE_ORGANISATION_NUMBER
  const address = process.env.STORE_BUSINESS_ADDRESS
  return (
    <Section title="Contact Alicia Lux">
      {seller && <p>{seller}{orgNo ? ` · Organisation number ${orgNo}` : ""}</p>}
      {address && <p>{address}</p>}
      {email ? (
        <p>Email <a href={`mailto:${email}`}>{email}</a> for order help, return instructions or privacy requests.</p>
      ) : (
        <p>For help with an order, reply to your order confirmation email.</p>
      )}
    </Section>
  )
}

const content: Record<Slug, () => React.ReactNode> = {
  terms: () => (
    <>
      <Section title="Orders, prices and delivery">
        <p>Alicia Lux ships within Sweden. Prices are shown in Swedish kronor and include VAT. Review the finish, delivery address and delivery cost in your order summary before paying. You can check out as a guest — no account is needed.</p>
        <p>Keep your order confirmation and order number. If you need to correct an order or delivery address, contact us as soon as possible so we can check whether it can still be changed.</p>
      </Section>
      <Section title="Payment">
        <p>Payments are processed securely by Stripe. Your card details are sent directly to Stripe and are never stored by Alicia Lux. Your order is confirmed once the payment has been approved.</p>
      </Section>
      <Section title="Returns and complaints">
        <p>Our <Link href="/policies/returns">returns and refunds policy</Link> explains withdrawal, damaged items and orders delivered in the wrong finish. These terms do not limit your mandatory consumer rights.</p>
        <p>If we cannot resolve a consumer dispute together, you may be able to refer it to Sweden’s National Board for Consumer Disputes (<a href="https://www.arn.se/">ARN</a>).</p>
      </Section>
    </>
  ),
  privacy: () => (
    <>
      <Section title="What we collect and why">
        <p>We use the contact, address and order details you provide to process and deliver your order and to handle returns and support. This processing is necessary to perform our contract with you or to take steps you request before placing an order.</p>
        <p>We keep transaction and accounting records as required by law. We may process technical logs and support messages where necessary for our legitimate interests in operating and securing the store or resolving disputes.</p>
      </Section>
      <Section title="Cookies, storage and sharing">
        <p>Your shopping bag is saved in your browser’s local storage so it is still there when you return. Stripe may set cookies during payment to prevent fraud. You can clear this data in your browser at any time.</p>
        <p>We collect anonymous visit statistics (pages viewed, country, device and browser type, and where the visit came from) to improve the store. We do not use cookies for this, do not store your IP address, and cannot identify you or follow you across days.</p>
        <p>We share the information needed for the service with our hosting, database, payment and delivery providers. We keep personal data for as long as needed for the purposes above and for any longer period required by law or to handle a dispute.</p>
      </Section>
      <Section title="Your privacy rights">
        <p>Depending on the circumstances, you can ask to access, correct, erase, restrict or receive a copy of your personal data, or object to certain processing. You may also lodge a complaint with the Swedish Authority for Privacy Protection (<a href="https://www.imy.se/en/">IMY</a>).</p>
      </Section>
    </>
  ),
  returns: () => (
    <>
      <Section title="Damaged or faulty products">
        <p>If your organizer arrives damaged or develops a fault, contact us with your order number and a description of the problem. Include photos of the item and packaging if you can. Depending on the issue and your rights, the remedy may be a repair, replacement, price reduction or refund. We cover reasonable return costs for a valid complaint.</p>
        <p>In Sweden, you can generally complain about a fault for up to three years. Tell us within a reasonable time after discovering it. A complaint made within two months of discovery is considered timely.</p>
      </Section>
      <Section title="Wrong finish received">
        <p>If you received a different finish than you ordered, leave the packaging sealed if you can and contact us with your order number and a photo of the label. We’ll arrange the return at our expense and send the correct finish.</p>
      </Section>
      <Section title="Changed your mind?">
        <p>For online purchases, you have 14 days after receiving the product to tell us you wish to withdraw. Contact us with a clear statement and your order number, then send the product back within 14 days of notifying us. Keep the packaging if possible and handle the product only as needed to inspect it.</p>
        <p>We refund the price and the cost of the least expensive standard delivery offered, using your original payment method, within 14 days of your notice. We may wait until we receive the item or you provide proof it was sent. You only pay direct return shipping if we informed you before purchase that it applies.</p>
      </Section>
    </>
  ),
}

export default async function PolicyPage({ params }: Props) {
  const slug = resolve((await params).slug)
  const Content = content[slug]
  return (
    <article className="container-lux max-w-[880px] py-[clamp(44px,8vw,104px)]">
      <p className="eyebrow mb-4">Customer care</p>
      <h1 className="display text-[clamp(42px,6vw,76px)] leading-none">{titles[slug]}</h1>
      <Content />
      <Contact />
    </article>
  )
}
