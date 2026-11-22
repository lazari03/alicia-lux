import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { completeCartWorkflow, updateCartWorkflow } from "@medusajs/medusa/core-flows"
import type Stripe from "stripe"
import { hostedProviderId, sekMinorUnits } from "../modules/stripe-hosted/service"

function address(name: string, value: Stripe.Address, phone: string | null) {
  const [first_name, ...last] = name.trim().split(/\s+/)
  return {
    first_name,
    last_name: last.join(" "),
    address_1: value.line1!,
    address_2: value.line2 ?? "",
    city: value.city!,
    province: value.state ?? "",
    postal_code: value.postal_code!,
    country_code: value.country!.toLowerCase(),
    phone: phone ?? "",
  }
}

export async function finishStripeCheckout(container: MedusaContainer, cartId: string, session: Stripe.Checkout.Session) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const locking = container.resolve(Modules.LOCKING)
  await locking.execute(`stripe-checkout:${cartId}`, async () => {
    const { data: [cart] } = await query.graph({
      entity: "cart",
      fields: ["id", "total", "currency_code", "completed_at", "payment_collection.payment_sessions.*"],
      filters: { id: cartId },
    })
    const payment = cart?.payment_collection?.payment_sessions?.find(
      (payment) => payment?.provider_id === hostedProviderId && payment.id === session.metadata?.medusa_payment_session_id &&
        payment.data?.stripe_checkout_id === session.id && payment.data.direct_checkout === true
    )
    if (!cart || !payment) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe session does not match this cart.")
    }
    if (cart.completed_at) return

    const shipping = session.collected_information?.shipping_details
    const customer = session.customer_details
    const billing = customer?.address
    if (session.metadata?.direct_checkout !== "true" || session.status !== "complete" ||
        session.currency !== "sek" || cart.currency_code !== "sek" ||
        session.amount_total !== sekMinorUnits(cart.total) ||
        !customer?.email || !customer.name || !shipping?.name || shipping.address.country !== "SE" ||
        !shipping.address.line1 || !shipping.address.city || !shipping.address.postal_code ||
        !billing?.line1 || !billing.city || !billing.postal_code || !billing.country) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Checkout did not return a complete matching order.")
    }

    await updateCartWorkflow(container).run({
      input: {
        id: cartId,
        email: customer.email,
        shipping_address: address(shipping.name, shipping.address, customer.phone),
        billing_address: address(customer.name, billing, customer.phone),
      },
    })
    await completeCartWorkflow(container).run({ input: { id: cartId } })
  }, { timeout: 30 })
}
