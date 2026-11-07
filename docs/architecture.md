# Architecture

## Boundaries

`apps/backend` owns commerce and persistence. It uses Medusa v2 modules and workflows for products, pricing, regions, stock, customers, carts, orders, payments and fulfillment. PostgreSQL stores business data. Keep extensions in Medusa's `src/modules`, `src/workflows`, `src/subscribers` and `src/api` conventions rather than writing directly to Medusa tables.

`apps/storefront` owns presentation. Next.js App Router server components fetch commerce data through `src/lib/data` and the typed Medusa SDK in `src/lib/config.ts`. `src/modules` organizes UI by commerce feature; client components handle interactive controls. Server actions maintain cart and authenticated session cookies. Browser code never receives backend admin credentials. A publishable key scopes storefront access to its sales channel; it is intentionally public.

Country-prefixed routes select a Medusa region so product prices, currency and checkout use the same region. Default development country is `de`, matching the seeded region. Change supported markets through Medusa and environment configuration together.

## Rendering and design

The homepage is rendered on the server. Hero and collection presentation do not ship client state or timers. Image assets use Next Image sizing and priority only for the hero. Tailwind handles responsive layout; CSS defines focus outlines, neutral brand colors and reduced-motion behavior. Existing Medusa interactive components provide product options, carts, customer forms and checkout.

Independent backend and storefront deployments permit API and presentation changes separately. Each app owns its dependency lockfile. TypeScript failures are not ignored in the storefront build.

## Operational limits

Development uses one API process and PostgreSQL, manual fulfillment and test/manual payment. Production needs provider configuration, durable external assets, transactional notifications, appropriate distributed infrastructure, and business-approved shipping/tax/legal configuration. No successful card charge is implied by completing the manual development checkout.

## Starter provenance

Backend starter commit: `9565d9d5487e470137c63824fe58c59a2098bde8`. Storefront starter commit: `9818886f06e493cb2249733d114d339aa216ef00`. Application source has been adapted for Alicia Lux; dependency resolutions are in the per-app npm lockfiles.
