# Stripe-hosted checkout

Save the live Stripe server key and the signing secret privately in
`apps/backend/.env.stripe-hosted` on the deployment server. The file enables
hosted Checkout for Sweden on the next full deployment. Use
`STRIPE_HOSTED_CHECKOUT=false` in the backend's regular `.env` to disable it.
The hosted flow does not require a storefront publishable key.

In Stripe's live mode, create an event destination for
`https://shopalicialux.se/hooks/payment/stripe-hosted_stripe-hosted` and select
`checkout.session.completed`. Use the signing secret from that destination in
`STRIPE_WEBHOOK_SECRET`. Keep an existing native Stripe destination if it
still handles payments made through the old integration.

For a restricted key, grant write access to Checkout Sessions and Payment
Intents. Grant write access to Refunds if refunds will be issued from Medusa.

Run `make deploy` from `/root/alicia-lux`. The full deployment installs the
provider, updates the Swedish region, and routes the webhook through Caddy.
Guests select Checkout with Stripe in the cart. Stripe collects their
contact, billing and Swedish delivery details. The cart uses the lowest-cost
available flat-rate delivery option for Sweden. Stripe shows the Medusa total in SEK, including delivery,
taxes and discounts. Medusa verifies the authorized payment against the
cart, reserves inventory and captures the payment when completing the order.

Verify the complete flow in Stripe test mode on a separate environment.
Confirm that a guest can pay, cancel, and try again. Verify that Stripe
delivers the webhook successfully and that retrying confirmation or
redelivering the webhook leaves one order, one capture and one reservation.
Use `STRIPE_CHECKOUT_RETURN_ORIGIN` in the regular backend environment for
the test storefront URL.
