# Verification — 7 November 2026

Executed against Node.js 24.22.1, PostgreSQL 17 and the local seeded development database.

| Check | Result |
| --- | --- |
| Medusa database migrations and link synchronization | Passed |
| Development seed: EUR region, products, variants, shipping, stock and publishable key | Passed |
| Medusa backend TypeScript build | Passed |
| Medusa Admin production build | Passed |
| Storefront strict TypeScript (`npm run typecheck`) | Passed |
| Next.js 15.5.29 production build | Passed; 59 generated pages |
| API `/health` | HTTP 200, `OK` |
| Medusa Admin `/app` | HTTP 200 |
| Product API with publishable key | Four seeded products returned |
| Cart creation and adding a stocked variant | Passed; item and EUR total verified |
| Shipping options and selection | Passed; two options returned |
| Manual payment session and cart completion | Passed; test order persisted with total EUR 20 |

The checkout smoke test used Medusa's manual development payment provider. No card was charged, external fulfillment requested, or production record changed.

Browser visual, keyboard and responsive interaction checks were not run: this managed environment does not expose the required `cua_repl.js` preview browser tool. The production storefront build validates compilation and API-backed static page generation, not complete browser behavior. Home, cart, account and checkout browser interactions still need visual/end-to-end review before launch.

No production hosting, domain, live payment provider, transactional email or real catalog has been configured. The provided editorial assets are stock examples and the product catalog uses Medusa sample images.

## Luxury storefront redesign — 2026-11-16

- `npm run typecheck` in `apps/storefront`: passed.
- `next build`: passed against an isolated empty-catalog Medusa API fixture (regions, locales, collections, categories, products). This verifies compilation, types and route generation, not live commerce.
- `git diff --check`: passed.
- Original Coffee Brown, Champagne and Noir images visually inspected before conversion; WebP dimensions and file sizes verified.
- Browser layout and interaction checks remain unverified: the managed preview runner appends Vite-only `--host` / `--strictPort` options to the existing Next.js dev script and exits before serving. The application script was preserved.
- Live backend credentials were not supplied. Purchases, inventory, payments and account operations were not exercised. Their existing data layer and routes are unchanged.
- No new packages, backend changes, database migrations or seeded catalog changes.

## Shopify-style storefront rebuild — 2026-11-16

Run against PostgreSQL 16, the seeded Medusa 2.18 backend and Chrome (headless, Playwright).

| Check | Result |
| --- | --- |
| `npm run typecheck` (storefront) | Passed |
| `next lint` | No errors; three pre-existing `react-hooks/exhaustive-deps` warnings |
| `next build` against the live seeded backend | Passed; 59 pages |
| Home, store, product, cart, checkout address step, account sign-in at 1440 px | Rendered, no console errors |
| Home, store, product and menu drawer at 390 px | Rendered, no horizontal overflow |
| Select size → Add to bag → cart drawer opens with the item | Passed |
| Drawer quantity + → quantity 2, subtotal €10 → €20 | Passed |
| Drawer → View bag → cart page (drawer closes) → Checkout | Passed |
| Mega menu on hover, product card image swap on hover | Passed |
| `?page=abc`, `?page=-3&sortBy=zzz` on `/store` | HTTP 200, first page |

Not verified: Safari and Firefox (scroll-driven animations and `::details-content` are progressive enhancements and fall back to static content there), keyboard-only and screen-reader passes, payment and order completion, real catalog imagery. Sample product images come from Medusa's public bucket.
