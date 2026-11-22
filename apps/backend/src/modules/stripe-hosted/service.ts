import type {
  AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput,
  CapturePaymentInput, DeletePaymentInput, GetPaymentStatusInput,
  GetPaymentStatusOutput, InitiatePaymentInput, InitiatePaymentOutput,
  ProviderWebhookPayload, RefundPaymentInput, RetrievePaymentInput,
  UpdatePaymentInput, WebhookActionResult,
} from "@medusajs/framework/types"
import { AbstractPaymentProvider, MathBN, MedusaError, PaymentActions, PaymentSessionStatus } from "@medusajs/framework/utils"
import Stripe from "stripe"

type Options = { apiKey: string; webhookSecret: string; origin: string }

export const hostedProviderId = "pp_stripe-hosted_stripe-hosted"

export function sekMinorUnits(amount: InitiatePaymentInput["amount"]) {
  return MathBN.convert(MathBN.mult(amount, 100)).integerValue().toNumber()
}

export default class StripeHostedProvider extends AbstractPaymentProvider<Options> {
  static identifier = "stripe-hosted"
  private readonly stripe: Stripe

  constructor(container: Record<string, unknown>, private readonly options: Options) {
    super(container, options)
    this.stripe = new Stripe(options.apiKey)
  }

  async initiatePayment({ amount, currency_code, context, data }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const paymentSessionId = data?.session_id
    const total = sekMinorUnits(amount)
    if (typeof paymentSessionId !== "string" || currency_code !== "sek" || !Number.isSafeInteger(total) || total <= 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Checkout requires a valid SEK payment.")
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "hosted",
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer_email: context?.customer?.email,
      allow_promotion_codes: false,
      automatic_tax: { enabled: false },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "sek",
          unit_amount: total,
          product_data: { name: "Alicia Lux order, including delivery and taxes" },
        },
      }],
      client_reference_id: paymentSessionId,
      metadata: { medusa_payment_session_id: paymentSessionId },
      payment_intent_data: { capture_method: "manual", metadata: { medusa_payment_session_id: paymentSessionId } },
      success_url: `${this.options.origin}/se/checkout/stripe-return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.options.origin}/se/checkout?step=payment&stripe=cancelled`,
    }, { idempotencyKey: paymentSessionId })

    if (!session.url) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Stripe Checkout did not return a payment link.")
    return {
      id: session.id,
      status: PaymentSessionStatus.PENDING,
      data: {
        stripe_checkout_id: session.id,
        checkout_url: session.url,
        medusa_payment_session_id: paymentSessionId,
        amount_minor: total,
        expires_at: session.expires_at,
      },
    }
  }

  private async checkout(data?: Record<string, unknown>) {
    const id = data?.stripe_checkout_id
    if (typeof id !== "string") throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing Stripe Checkout Session.")
    const session = await this.stripe.checkout.sessions.retrieve(id, { expand: ["payment_intent"] })
    if (session.metadata?.medusa_payment_session_id !== data?.medusa_payment_session_id ||
        session.amount_total !== data?.amount_minor || session.currency !== "sek") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "The Stripe payment does not match this checkout.")
    }
    const intent = session.payment_intent
    return { session, intent: typeof intent === "object" ? intent : null }
  }

  async authorizePayment({ data, context }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    if (data?.medusa_payment_session_id !== context?.idempotency_key) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "The Stripe payment does not match the Medusa session.")
    }
    const { session, intent } = await this.checkout(data)
    if (session.status !== "complete" || !intent ||
      intent.metadata.medusa_payment_session_id !== data?.medusa_payment_session_id ||
      intent.currency !== "sek" || intent.amount !== data?.amount_minor ||
      !["requires_capture", "succeeded"].includes(intent.status)) {
      return { status: PaymentSessionStatus.REQUIRES_MORE, data }
    }

    // Medusa calls authorization after validating shipping and reserving stock.
    const captured = intent.status === "succeeded" ? intent : await this.stripe.paymentIntents.capture(
      intent.id, {}, { idempotencyKey: `medusa-capture-${intent.id}` }
    )
    if (captured.status !== "succeeded" || captured.amount_received !== data?.amount_minor) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Stripe did not capture the full checkout amount.")
    }
    return { status: PaymentSessionStatus.CAPTURED, data: { ...data, payment_intent_id: captured.id } }
  }

  async getPaymentStatus({ data }: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const { session, intent } = await this.checkout(data)
    const status = intent?.status === "succeeded" ? PaymentSessionStatus.CAPTURED
      : session.status === "expired" || intent?.status === "canceled" ? PaymentSessionStatus.CANCELED
      : PaymentSessionStatus.PENDING
    return { status, data }
  }

  async updatePayment({ data, amount, currency_code }: UpdatePaymentInput) {
    if (currency_code !== "sek" || sekMinorUnits(amount) !== data?.amount_minor) {
      await this.cancelPayment({ data })
      return { data, status: PaymentSessionStatus.CANCELED }
    }
    return { data }
  }

  async cancelPayment({ data }: CancelPaymentInput) {
    const { session, intent } = await this.checkout(data)
    if (session.status === "open") {
      await this.stripe.checkout.sessions.expire(session.id)
    } else if (intent?.status === "requires_capture") {
      await this.stripe.paymentIntents.cancel(intent.id, {}, { idempotencyKey: `medusa-cancel-${intent.id}` })
    }
    return { data }
  }

  async deletePayment(input: DeletePaymentInput) {
    if (input.data?.stripe_checkout_id) await this.cancelPayment(input)
    return { data: input.data }
  }

  async capturePayment({ data }: CapturePaymentInput) {
    const { intent } = await this.checkout(data)
    if (intent?.status !== "succeeded") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Complete the Stripe checkout before recording capture.")
    }
    return { data }
  }

  async refundPayment({ data, amount, context }: RefundPaymentInput) {
    const { intent } = await this.checkout(data)
    if (intent?.status !== "succeeded") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "The Stripe payment has not been captured.")
    }
    await this.stripe.refunds.create(
      { payment_intent: intent.id, amount: sekMinorUnits(amount) },
      { idempotencyKey: context?.idempotency_key }
    )
    return { data }
  }

  async retrievePayment({ data }: RetrievePaymentInput) {
    await this.checkout(data)
    return { data }
  }

  async getWebhookActionAndData({ rawData, headers }: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const signature = headers["stripe-signature"]
    if (typeof signature !== "string") {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing Stripe signature.")
    }

    const body = typeof rawData === "string" ? rawData : Buffer.from(rawData as Uint8Array)
    const event = this.stripe.webhooks.constructEvent(body, signature, this.options.webhookSecret)
    if (event.type !== "checkout.session.completed") return { action: PaymentActions.NOT_SUPPORTED }

    const checkout = event.data.object
    const session_id = checkout.metadata?.medusa_payment_session_id
    if (!session_id || checkout.status !== "complete" || checkout.currency !== "sek" || !checkout.amount_total) {
      return { action: PaymentActions.NOT_SUPPORTED }
    }

    return { action: PaymentActions.AUTHORIZED, data: { session_id, amount: checkout.amount_total / 100 } }
  }
}
