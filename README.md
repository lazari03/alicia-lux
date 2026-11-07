# Alicia Lux

A Medusa v2 webshop with a Next.js App Router storefront, React, strict TypeScript and Tailwind CSS. The visual direction takes inspiration from Dugaja's editorial boutique layout, using original Alicia Lux copy and separate stock imagery.

## Requirements

Node.js 22+, npm, Docker Compose (or a separately provisioned PostgreSQL 17 database).

## Local setup

```sh
npm --prefix apps/backend ci
npm --prefix apps/storefront ci
cp apps/backend/.env.example apps/backend/.env
cp apps/storefront/.env.template apps/storefront/.env.local
```

Generate two independent random secrets for `JWT_SECRET` and `COOKIE_SECRET` in the backend environment file, for example with `openssl rand -hex 32`. Set a random `REVALIDATE_SECRET` in the storefront environment file. Never commit environment files.

```sh
npm run db:up
npm run db:migrate
npm run db:seed
```

Run the seed **once on a fresh development database**. It creates example products, stock, a EUR region covering Germany and several European countries, manual test payments and example shipping rates. It is not an idempotent production import. Retrieve the publishable API key in Medusa Admin and set `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `apps/storefront/.env.local`. Its sales channel must match the products' sales channel.

Create your local admin user:

```sh
cd apps/backend
npx medusa user -e your-email@example.com -p '<choose-a-strong-password>'
```

In separate terminals from the repository root:

```sh
npm run dev:backend
npm run dev:storefront
```

- Storefront: http://localhost:8000/de
- Medusa Admin: http://localhost:9000/app
- API health: http://localhost:9000/health

## Validation

```sh
cd apps/storefront && npx tsc --noEmit && npm run build
cd ../backend && npm run build
```

Build the storefront while Medusa is running and after setting its publishable key: static product pages query the API during the build.

## Architecture

See [docs/architecture.md](docs/architecture.md). Lockfiles are committed separately for the two independently deployable apps; use `npm ci` in each. Product, account, cart, shipping and checkout behavior come from the official Medusa starters rather than a parallel custom commerce implementation.

## Run the compiled backend locally

After `npm run build:backend`, copy `apps/backend/.env` to `apps/backend/.medusa/server/.env` and run `npm --prefix apps/backend start`. Production hosts should inject environment variables directly into the process.

## Before production

Replace the demo catalog, imagery, stock and shipping rules. Confirm supported countries, currency, tax settings, contact details and policies with the store owner. Configure a live payment provider and test it end to end; the included manual payment provider does not charge a card. Add transactional email, production asset storage, managed PostgreSQL, HTTPS origins, backups and monitoring. For multiple backend instances, configure shared Redis-backed event, cache and workflow infrastructure as documented by Medusa. The local in-memory defaults are for development.

Deploy the backend to a persistent Node.js host (or Medusa Cloud), and the storefront to a Next.js host. Medusa cannot run as a static site or a Cloudflare Worker. Production deployment and domain setup have not been performed.

## Sources and licenses

- Backend: https://github.com/medusajs/medusa-starter-default (MIT)
- Storefront: https://github.com/medusajs/nextjs-starter-medusa (MIT)
- Editorial stock photo: https://images.unsplash.com/photo-1483985988355-763728e1935b (served from Unsplash images; replace with owned campaign photography before launch).
- Boutique stock photo: https://images.unsplash.com/photo-1441986300917-64674bd600d8
- Development product images: official Medusa sample catalog.

## One-command server startup

With Node.js 22+, Docker Compose, Git and Make installed, run `make up` from the repository root. This installs dependencies (repairing npm-version lockfile differences), preserves existing credentials, creates missing local configuration, starts PostgreSQL, runs migrations, seeds only when no region exists, synchronizes the publishable key, builds both apps and manages them with project-local PM2. Do not run development servers on ports 8000/9000 at the same time.

Use `make status`, `make logs` and `make stop`. Database data is preserved by `make stop`. For startup after reboot, run `./node_modules/.bin/pm2 startup` and follow its instructions; the process list is saved by `make up`.

For private access from your computer, run `ssh -N -L 8000:localhost:8000 -L 9000:localhost:9000 root@YOUR_SERVER_IP`, then open http://localhost:8000/de for the storefront or http://localhost:9000/app for Admin. Public domain/HTTPS configuration is separate. Keep application and database ports closed to public traffic.
