import type { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const titles = {
  terms: "Terms & conditions",
  privacy: "Privacy policy",
  returns: "Returns & refunds",
} as const

type Policy = keyof typeof titles
type PageProps = { params: Promise<{ policy: string }> }

function resolvePolicy(policy: string): Policy {
  if (!Object.prototype.hasOwnProperty.call(titles, policy)) notFound()
  return policy as Policy
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: titles[resolvePolicy((await params).policy)] }
}

function Contact() {
  const email = process.env.STORE_SUPPORT_EMAIL
  const seller = process.env.STORE_LEGAL_NAME
  const organizationNumber = process.env.STORE_ORGANISATION_NUMBER
  const address = process.env.STORE_BUSINESS_ADDRESS

  return (
    <section>
      <h2>Contact Alicia Lux</h2>
      {seller ? <p>{seller}{organizationNumber ? ` · Organisation number ${organizationNumber}` : ""}</p> : null}
      {address ? <p>{address}</p> : null}
      {email ? (
        <p>Email <a href={`mailto:${email}`}>{email}</a> for order help, return instructions or privacy requests.</p>
      ) : (
        <p>For help with an order, use the contact details in your order confirmation.</p>
      )}
    </section>
  )
}

function Terms() {
  return (
    <>
      <section>
        <h2>Orders, prices and delivery</h2>
        <p>Alicia Lux ships within Sweden. Prices are shown in Swedish kronor. Review the selected finish, delivery address, taxes and shipping charges in your order summary before placing an order. The delivery estimate and available payment methods are shown at checkout.</p>
        <p>Keep your order confirmation and order number. If you need to correct an order or delivery address, contact us as soon as possible so we can check whether it can still be changed.</p>
      </section>
      <section>
        <h2>Returns and complaints</h2>
        <p>Our <LocalizedClientLink href="/policies/returns">returns and refunds policy</LocalizedClientLink> explains withdrawal, damaged items and orders delivered in the wrong finish. These terms do not limit your mandatory consumer rights.</p>
        <p>If we cannot resolve a consumer dispute together, you may be able to refer it to Sweden’s National Board for Consumer Disputes (<a href="https://www.arn.se/">ARN</a>).</p>
      </section>
    </>
  )
}

function Privacy() {
  return (
    <>
      <section>
        <h2>What we collect and why</h2>
        <p>We use the contact, address and order details you provide to manage your account, process and deliver your order, and handle returns and support. This processing is necessary to perform our contract with you or to take steps you request before placing an order.</p>
        <p>We keep transaction and accounting records as required by law. We may process technical logs and support messages where necessary for our legitimate interests in operating and securing the store or resolving disputes.</p>
      </section>
      <section>
        <h2>Cookies, sharing and retention</h2>
        <p>The storefront uses functional cookies to keep your shopping bag and sign-in session, remember your language choice, and help the store serve the correct market. You can delete these cookies in your browser, which may sign you out or clear your bag.</p>
        <p>We share information needed for the service with hosting, payment and delivery providers. We keep personal data for as long as needed for the purposes above and for any longer period required by law or to handle a dispute.</p>
      </section>
      <section>
        <h2>Your privacy rights</h2>
        <p>Depending on the circumstances, you can ask to access, correct, erase, restrict or receive a copy of your personal data, or object to certain processing. You may also lodge a complaint with the Swedish Authority for Privacy Protection (<a href="https://www.imy.se/en/">IMY</a>).</p>
      </section>
    </>
  )
}

function Returns() {
  return (
    <>
      <section>
        <h2>Damaged or faulty products</h2>
        <p>If your organizer arrives damaged or develops a fault, contact us with your order number and a description of the problem. Include photos of the item and packaging if you can. You can request a refund. Depending on the issue and your rights, the remedy may be a repair, replacement, price reduction or refund. We cover reasonable return costs for a valid complaint.</p>
        <p>In Sweden, you can generally complain about a fault for up to three years. Tell us within a reasonable time after discovering it. A complaint made within two months of discovery is considered timely.</p>
      </section>
      <section>
        <h2>Wrong finish received</h2>
        <p>If you ordered Champagne and the label shows Coffee Brown, leave the product packaging sealed if you can. Contact us with your order number and a photo of the label. We’ll arrange the return at our expense and send the correct finish. If you opened the package to check the finish, you can still report the error and use your rights for a wrongly delivered item.</p>
      </section>
      <section>
        <h2>Changed your mind?</h2>
        <p>For most online purchases, you have 14 days after receiving the product to tell us you wish to withdraw. Contact us with a clear statement and your order number, then send the product back within 14 days of notifying us. Contact us for the return address. Keep the packaging if possible and handle the product only as needed to inspect it. Handling beyond that may reduce the refund where the law permits.</p>
        <p>For withdrawal, we refund the price and the cost of the least expensive standard delivery offered, using your original payment method unless you agree otherwise. We issue the refund within 14 days of your notice, but may wait until we receive the item or you provide proof it was sent. You only pay direct return shipping if we informed you before purchase that it applies.</p>
      </section>
    </>
  )
}

export default async function PolicyPage({ params }: PageProps) {
  const policy = resolvePolicy((await params).policy)
  const Content = { terms: Terms, privacy: Privacy, returns: Returns }[policy]

  return (
    <article className="content-container lux-policy">
      <h1>{titles[policy]}</h1>
      <Content />
      <Contact />
    </article>
  )
}
