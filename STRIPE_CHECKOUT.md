# Stripe checkout

The storefront uses a one-page, on-site checkout:

1. **Details**: email, phone and delivery address (+ optional billing address)
2. **Delivery**: shopper picks a shipping option (auto-selected when only one exists)
3. **Payment**: Stripe Payment Element (cards, Apple Pay, Google Pay, Klarna… whatever is enabled in the Stripe Dashboard)

Payment runs through Medusa's native Stripe provider (`pp_stripe_stripe`). A PaymentIntent
is created for the *current* cart total and recreated whenever the total changes.
Medusa authorises and captures the intent when the order is placed, so an order only exists
when Stripe confirms the funds. Redirect-based methods return to `/se/checkout/complete`,
where the intent is checked against the cart before the order is placed.

## Configuration

Backend `apps/backend/.env`:

```
STRIPE_API_KEY=sk_live_...        # or rk_live_... (restricted: PaymentIntents write, Refunds write)
STRIPE_WEBHOOK_SECRET=whsec_...
```

Storefront `apps/storefront/.env.local`:

```
NEXT_PUBLIC_STRIPE_KEY=pk_live_... # same mode (test/live) as the server key
```

In Stripe, add an event destination for
`https://shopalicialux.se/hooks/payment/stripe_stripe` (already routed by Caddy) with
`payment_intent.succeeded`, `payment_intent.amount_capturable_updated`,
`payment_intent.payment_failed` and `payment_intent.partially_funded`. The webhook lets Medusa
complete the order even if the shopper closes the tab after paying.

For Apple Pay, register `shopalicialux.se` under Settings → Payment method domains.

Run `make deploy`. `configure-sweden.ts` makes `pp_stripe_stripe` the only payment provider of
the Sweden region.

## Legacy hosted Checkout (fallback)

When `STRIPE_API_KEY` is **not** set and `apps/backend/.env.stripe-hosted` exists (or
`STRIPE_HOSTED_CHECKOUT=true`), the old redirect-to-Stripe provider is used instead. The
payment step then shows a "Continue to secure payment" button. Once the native provider is
live and verified, `.env.stripe-hosted`, `src/modules/stripe-hosted`, the
`stripe-checkout` subscriber and the `/checkout/stripe-return` page can be removed.

## Test before going live

Use test keys (`sk_test_` / `pk_test_`) on a separate environment and test:
`4242 4242 4242 4242` (success), `4000 0025 0000 3155` (3-D Secure),
`4000 0000 0000 9995` (declined). Then change the cart in another tab and check that the
amount shown on the Pay button updates.
