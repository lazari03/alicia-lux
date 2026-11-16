# Repository audit — 16 November 2026

Scope: `apps/storefront` (Next.js 15, React 19, Tailwind 3), `apps/backend` (Medusa 2.18), root scripts and docs, at commit `831ec02`. Findings were checked against a local run (PostgreSQL 16, seeded Medusa backend, production storefront build) unless marked *by reading*.

Status: **Fixed** = addressed in the storefront redesign branch. **Open** = not changed; needs a decision or is outside the redesign.

## Blocking before launch

| # | Finding | Evidence | Status |
| --- | --- | --- | --- |
| 1 | **Region middleware matches country codes by substring.** `pathname.split("/")[1].includes(countryCode)` treats any first segment *containing* the code as localized. With region `de`, `/order/abc/confirmed` returns 404 instead of redirecting to `/de/order/...` ("or**de**r" contains "de"). Any un-prefixed link whose first segment contains a served country code breaks. | `src/middleware.ts:120`; `curl /order/abc/confirmed` → 404, `curl /store` → 307 | Open — one-line fix (`=== countryCode`), left out because it changes routing |
| 2 | **`npm ci` fails in the backend.** The lockfile is out of sync (`picomatch@2.3.2` vs `3.0.2`), so the README's documented install does not work and `scripts/up.sh` falls back to `npm install`, which makes server installs non-reproducible. | `npm --prefix apps/backend ci` → `EUSAGE` on npm 10.9 | Open |
| 3 | **Starter placeholder policy text is live on every product page.** "Shipping & Returns" promises 3–5 day delivery, free exchanges and "no questions asked" refunds, and talks about "fit". These are Medusa demo strings, not Alicia Lux policy. | `modules/products/components/product-tabs/index.tsx` | Open — needs the real policy |
| 4 | **No legal pages or links.** The default region is Germany, and the site has no imprint, privacy policy, terms or withdrawal information; the cart shows the subtotal "excl. taxes". Worth confirming requirements with whoever handles compliance for the markets served. | Footer, cart summary | Open |
| 5 | **Demo catalog and manual payment only.** Products are Medusa sample apparel at €10; the only payment provider is the manual one; no email, file storage or Redis modules are configured (`medusa-config.ts` holds only DB/CORS/secrets). | Seed data, `medusa-config.ts` | Open (already noted in README) |
| 6 | **Product images will not load in production.** `next.config.js` only allows `localhost` and Medusa's sample S3 buckets as remote image hosts. A real backend or CDN host is rejected by `next/image`. | `next.config.js` `images.remotePatterns` | Open |

## Security and dependencies

| # | Finding | Status |
| --- | --- | --- |
| 7 | `npm audit --omit=dev` (storefront): 3 advisories — 2 high (`sharp`/libvips, fixable with `npm audit fix`), 1 moderate (`postcss` bundled inside `next`, fixed only in Next 16). Backend: 87 advisories (20 high, 67 moderate), all in Medusa 2.18's dependency tree. | Open |
| 8 | No security headers (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, frame protection); `X-Powered-By: Next.js` is sent. | Open |
| 9 | `REVALIDATE_SECRET` is generated and documented, but no revalidation route exists (`src/app/api` is absent). Catalog changes only appear when the per-visitor cache expires or the site is rebuilt. | Open |
| 10 | `compose.yaml` falls back to the password `medusa_local`. The port is bound to 127.0.0.1, so exposure is local only. | Open (low) |
| 11 | Auth and cart cookies are `httpOnly`, `sameSite=strict`, `secure` in production; secrets are required at boot and env files are git-ignored. | No action |
| 12 | Version drift: `@medusajs/js-sdk`/`types` 2.18.0 vs `@medusajs/icons`/`ui-preset` 2.22.4. | Open (low) |

## Correctness

| # | Finding | Status |
| --- | --- | --- |
| 13 | **Add-to-cart button said "Out of stock" before a size was chosen.** The guard `!selectedVariant && !options` can never be true (`options` is always an object), so the "select" label was unreachable. | **Fixed** — now "Select options" |
| 14 | `?page=` and `?sortBy=` were passed through `parseInt` unvalidated; `page=abc` produced `NaN` offsets. | **Fixed** — `lib/util/listing-params.ts` |
| 15 | Changing the sort order kept the current `page`, which could land on an empty page. | **Fixed** |
| 16 | Sorting fetches at most 100 products and sorts in memory; beyond 100 products, order and page count are wrong. *By reading.* | Open |
| 17 | Cart link was an `<a>` nested inside a `<button>` (invalid HTML, double tab stop). | **Fixed** — single button opening the cart drawer |

## SEO and accessibility

| # | Finding | Status |
| --- | --- | --- |
| 18 | No `robots.txt` or sitemap: `next-sitemap.js` exists but the package is not installed, `siteUrl` reads an unset Vercel variable, and `excludedPaths + [...]` concatenates a string. Both URLs return 404. | Open |
| 19 | Product page had no `<h1>` (title was an `h2`); product images used `alt="Thumbnail"` / "Product image 1". | **Fixed** |
| 20 | No product structured data (JSON-LD), so no rich results. Product meta description is just the title; title renders as "… \| Alicia Lux \| Alicia Lux". | Open |
| 21 | `<html lang="en">` is hard-coded while the default market is `de`; no `hreflang`. Content is English only. | Open |
| 22 | `getBaseURL()` falls back to `https://localhost:8000` for canonical/OG URLs if `NEXT_PUBLIC_BASE_URL` is missing. | Open (low) |
| 23 | Sort control was a custom radio list with hidden inputs; pagination had no landmark or `aria-current`. | **Fixed** — native `<select>`, `<nav aria-label="Pagination">` |

## Maintainability

| # | Finding | Status |
| --- | --- | --- |
| 24 | ~150 lines of hand-written, minified one-line `.lux-*` CSS with hard-coded hex values duplicated across components, alongside Tailwind. | **Fixed** — tokens in `tailwind.config.js`, components in `@layer components` |
| 25 | Unused storefront dependencies: `pg`, `@types/pg`, `webpack`, `babel-loader`, `@babel/core`, `@types/react-instantsearch-dom`; `lodash` is imported only for `isEqual`. `@types/node` is 17 on Node 22; `tsconfig` targets ES5. | Open |
| 26 | Unused assets and starter leftovers: `public/images/{boutique,collection,editorial}.jpg` (468 KB, unrelated stock photos), `medusa-cta`, onboarding CTAs, `payment-test`, `featured-products`. | Open |
| 27 | `eslint.ignoreDuringBuilds: true`, no CI, and the only test is a backend health check. Lint currently reports three `react-hooks/exhaustive-deps` warnings. | Open |
| 28 | `apps/backend/.env.example` and `.env.template` are identical duplicates. | Open (low) |
| 29 | `logging.fetches.fullUrl: true` prints every backend URL in production logs. | Open (low) |

## Suggested order

1. Fix the middleware match (#1) and the backend lockfile (#2).
2. Replace placeholder policy copy and add legal pages (#3, #4).
3. Allow the production image host (#6), add security headers (#8) and run `npm audit fix` (#7).
4. Add sitemap/robots and product JSON-LD (#18, #20).
5. Real catalog, payment provider and email (#5), then remove starter leftovers (#25, #26).
