import HostedCheckout from "@modules/checkout/components/hosted-checkout"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function StripeReturn({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const valid = typeof session_id === "string" && /^cs_(test|live)_[A-Za-z0-9]+$/.test(session_id)

  return (
    <section className="content-container max-w-xl space-y-5 py-12">
      <h1 className="lux-checkout-title">Confirm your order</h1>
      {valid ? (
        <>
          <p>Verify your Stripe payment and open your order confirmation.</p>
          <HostedCheckout sessionId={session_id} />
        </>
      ) : (
        <LocalizedClientLink href="/checkout" className="underline">Return to checkout</LocalizedClientLink>
      )}
    </section>
  )
}
