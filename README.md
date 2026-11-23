# Alicia Lux

Webshop for the Alicia Lux Signature Organizer.
Next.js 15 (App Router) · React 19 · Tailwind CSS v4 · Motion · Supabase · Stripe · Docker on Hetzner.

- **Shop**: home, shop with sorting, product pages, cart drawer, guest checkout (Stripe Payment Element: cards, Apple Pay, Google Pay, Klarna…)
- **Admin** (`/admin`): sales overview and chart, orders (ship, cancel, refund), products (create, edit, images, stock), delivery pricing

## 1. Supabase

Create a project at supabase.com (region **eu-north-1 Stockholm**), then:

```bash
cp .env.example .env.local   # fill in Supabase + Stripe values
./scripts/supabase-setup.sh
```

The script creates the tables, security policies and image bucket, seeds the three products and creates your admin login.
It's safe to re-run. It needs `psql` (`sudo apt install -y postgresql-client`, or `brew install libpq` on macOS).

## 2. Stripe

1. Copy the API keys (Developers → API keys) into `.env.local`.
2. Add a webhook endpoint `https://YOUR-DOMAIN/api/stripe/webhook` with the events
   `payment_intent.succeeded` and `charge.refunded`. Put its signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Turn on the payment methods you want (Settings → Payment methods). For Apple Pay, register your domain.
4. Optional: enable "Successful payments" emails (Settings → Customer emails) so customers get a receipt.

For local testing, forward webhooks with the Stripe CLI:
`stripe listen --forward-to localhost:3000/api/stripe/webhook`

## 3. Develop

```bash
npm install
npm run dev               # http://localhost:3000, admin at /admin
```

Local Supabase (optional, needs Docker): `npx supabase start`, then run the setup script against its `DB_URL`.

## 4. Deploy on Hetzner

On a fresh Ubuntu server with Docker installed:

```bash
git clone https://github.com/lazari03/alicia-lux.git && cd alicia-lux
cp .env.example .env.production    # fill in live values, NEXT_PUBLIC_SITE_URL=https://shopalicialux.se
make setup                         # one-time: Supabase schema, products, admin login
make deploy                        # build + start the shop on 127.0.0.1:3000
make caddy                         # one-time: point the host Caddy at it (HTTPS)
```

Run `make` to list all commands (`deploy`, `migrate`, `logs`, `status`, `restart`, `stop`).
After pulling a change that adds a file in `supabase/migrations/`, run `make migrate`.
To use the bundled Caddy container instead of a host install, run `WITH_CADDY=1 ./deploy/deploy.sh`.

Point your domain's A record at the server first. If Caddy already runs on the host, leave out `WITH_CADDY=1` and proxy
`shopalicialux.se` to `127.0.0.1:3000`. To redeploy later, run `./deploy/deploy.sh`.

## How orders work

1. The cart lives in the browser. At checkout, `/api/checkout` re-reads every price and the stock from Supabase,
   creates a `pending` order and a Stripe PaymentIntent for the exact total.
2. The customer pays on-site. Stripe's `payment_intent.succeeded` webhook (or the success page, whichever comes first)
   calls `complete_order()`, which marks the order paid and decrements stock in a single transaction.
   Repeated calls are ignored.
3. In `/admin/orders` you mark orders as shipped (with an optional tracking number), cancel or refund them.

Prices are stored as integer öre, including 25 % VAT.

## Project layout

```
src/app/(shop)        storefront pages
src/app/(checkout)    checkout + confirmation (minimal layout)
src/app/admin         dashboard (Supabase Auth, admin_users table)
src/app/api           checkout + Stripe webhook
src/components        UI (shop, checkout, admin, layout)
src/lib               Supabase clients, Stripe, catalog queries, money
supabase/             schema migration + seed
scripts/              supabase-setup.sh, generate-icons.mjs
deploy/               Caddyfile + deploy.sh
```

To regenerate the favicons from the logo, run `node scripts/generate-icons.mjs`.
