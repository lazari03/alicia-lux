#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo="$PWD"
domain=shopalicialux.se
mode="${1:-storefront}"
config="$(realpath /etc/caddy/Caddyfile)"
pm2="$repo/node_modules/.bin/pm2"

if [[ ! -x "$pm2" || ! -r "$config" || ! -w "$(dirname "$config")" || ! -f apps/storefront/.env.local ]]; then
  echo 'Run on the existing Alicia Lux server as the user who manages Caddy and PM2.' >&2
  exit 1
fi

releases="$repo/.cache/storefront-releases"
mkdir -p "$releases"
exec 9>"$releases/deploy.lock"
flock -n 9 || { echo 'A storefront deployment is already running.' >&2; exit 1; }
export npm_config_cache="${npm_config_cache:-$repo/.cache/npm}"
run_pm2() { "$pm2" "$@" 9>&-; }

# Match only the single direct storefront upstream shown in the live Caddyfile.
pattern='^[[:blank:]]*reverse_proxy[[:blank:]]+127\.0\.0\.1:(8000|8001|8002)[[:blank:]]*$'
mapfile -t upstreams < <(grep -E "$pattern" "$config")
if [[ ${#upstreams[@]} -ne 1 ]]; then
  echo 'Expected one storefront reverse_proxy to 127.0.0.1 on port 8000, 8001, or 8002.' >&2
  exit 1
fi
active_port="${upstreams[0]##*:}"
active_port="${active_port//[[:space:]]/}"
if [[ -z "$(ss -H -ltn "sport = :$active_port")" ]]; then
  echo "The storefront upstream on port $active_port is not listening. Restore the existing deployment first." >&2
  exit 1
fi
target_port=8001
if [[ "$active_port" == 8001 ]]; then target_port=8002; fi
api_pattern='^[[:blank:]]*reverse_proxy[[:blank:]]+127\.0\.0\.1:(9000|9001|9002)[[:blank:]]*$'
mapfile -t api < <(grep -E "$api_pattern" "$config")
[[ ${#api[@]} -eq 1 ]] || { echo 'Expected one direct Medusa reverse_proxy on port 9000, 9001, or 9002.' >&2; exit 1; }
active_api="${api[0]##*:}"
active_api="${active_api//[[:space:]]/}"
target_api="$active_api"
if [[ "$mode" == --with-backend ]]; then
  target_api=9001
  if [[ "$active_api" == 9001 ]]; then target_api=9002; fi
fi
backend_url="http://127.0.0.1:$target_api"
backend_app="alicia-backend-$target_api"
backend_candidate=''
backend_started=false

app="alicia-storefront-$target_port"
revision="$(git rev-parse HEAD)"
slot="$releases/$target_port"
candidate="$(mktemp -d "$releases/build.XXXXXXXX")"
next_config=''
original_config=''
started=false
switched=false
cleanup() {
  if [[ "$started" == true && "$switched" == false ]]; then run_pm2 delete "$app" >/dev/null 2>&1 || true; fi
  if [[ "$backend_started" == true && "$switched" == false ]]; then run_pm2 delete "$backend_app" >/dev/null 2>&1 || true; fi
  rm -rf -- "$candidate"
  if [[ -n "$backend_candidate" ]]; then rm -rf -- "$backend_candidate"; fi
  if [[ -n "$next_config" ]]; then rm -f -- "$next_config"; fi
  if [[ -n "$original_config" ]]; then rm -f -- "$original_config"; fi
}
trap cleanup EXIT

original_config="$(mktemp "$(dirname "$config")/.alicia-caddy-original.XXXXXXXX")"
cp -p "$config" "$original_config"
[[ "$(grep -E "$pattern" "$original_config")" == "${upstreams[0]}" ]] || {
  echo 'Caddyfile changed while starting the deployment.' >&2
  exit 1
}

if [[ "$mode" == --with-backend ]]; then
  export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$repo/.cache/config}"
  node scripts/configure.mjs backend
  node --env-file=apps/backend/.env --env-file=apps/storefront/.env.local --input-type=module <<'NODE'
import { existsSync } from 'node:fs'
const hostedCheckout = process.env.STRIPE_HOSTED_CHECKOUT === "true" ||
  (process.env.STRIPE_HOSTED_CHECKOUT !== "false" && !process.env.STRIPE_API_KEY && existsSync('apps/backend/.env.stripe-hosted'))
const stripeKey = process.env.STRIPE_API_KEY
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!hostedCheckout && (stripeKey || webhookSecret)) {
  const mode = stripeKey?.match(/^(?:sk|rk)_(test|live)_/)?.[1]
  if (!mode || !webhookSecret?.startsWith('whsec_') || !process.env.NEXT_PUBLIC_STRIPE_KEY?.startsWith(`pk_${mode}_`)) {
    console.error('Stripe requires a server API key, webhook secret, and matching test or live storefront public key.')
    process.exit(1)
  }
}
NODE
  node scripts/database.mjs check
  backend_candidate="$(mktemp -d "$releases/backend-build.XXXXXXXX")"
  git archive "$revision" apps/backend | tar -xf - -C "$backend_candidate"
  backend="$backend_candidate/apps/backend"
  install -m 600 apps/backend/.env "$backend/.env"
  if [[ -f "apps/backend/.env.stripe-hosted" ]]; then
    install -m 600 "apps/backend/.env.stripe-hosted" "$backend/.env.stripe-hosted"
  fi
  npm --prefix "$backend" ci --no-audit --no-fund
  npm --prefix "$backend" run build

  # Never recreate the live database. Schema changes must work with both releases.
  npm --prefix "$backend" run db:migrate
  (
    cd "$backend"
    ./node_modules/.bin/medusa exec ./src/scripts/import-catalog.ts
    ./node_modules/.bin/medusa exec ./src/scripts/configure-sweden.ts
  )
  install -m 600 "$backend/.env" "$backend/.medusa/server/.env"
  if [[ -f "$backend/.env.stripe-hosted" ]]; then
    install -m 600 "$backend/.env.stripe-hosted" "$backend/.medusa/server/.env.stripe-hosted"
  fi
  node scripts/configure.mjs storefront

  # Share the default local upload directory across backend releases.
  old_backend="$releases/backend-$active_api/apps/backend"
  if [[ "$active_api" == 9000 ]]; then old_backend="$repo/apps/backend"; fi
  uploads="$old_backend/.medusa/server/static"
  if [[ -d "$uploads" ]]; then
    uploads="$(realpath "$uploads")"
  else
    uploads="$releases/uploads"
    mkdir -p "$uploads"
  fi
  if [[ ! -e "$backend/.medusa/server/static" ]]; then
    ln -s "$uploads" "$backend/.medusa/server/static"
  fi

  cmp -s "$config" "$original_config" || { echo 'Caddyfile changed during the backend build.' >&2; exit 1; }
  if run_pm2 describe "$backend_app" >/dev/null 2>&1; then run_pm2 delete "$backend_app"; fi
  if [[ -n "$(ss -H -ltn "sport = :$target_api")" ]]; then
    echo "Backend port $target_api is already in use." >&2
    exit 1
  fi
  backend_slot="$releases/backend-$target_api"
  rm -rf -- "$backend_slot"
  mv -- "$backend_candidate" "$backend_slot"
  backend="$backend_slot/apps/backend"
  run_pm2 start npm --name "$backend_app" --cwd "$backend" -- start --host 127.0.0.1 --port "$target_api"
  backend_started=true
  node scripts/wait.mjs "$backend_url/health"
fi

# The storefront release depends on the Swedish market configured by the full deploy.
if ! MEDUSA_BACKEND_URL="$backend_url" node --env-file=apps/storefront/.env.local --input-type=module <<'NODE'
const base = process.env.MEDUSA_BACKEND_URL ?? 'http://localhost:9000'
const response = await fetch(new URL('/store/regions', base), {
  headers: { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? '' },
  signal: AbortSignal.timeout(5000),
}).catch(() => null)
if (!response?.ok) process.exit(1)
const { regions } = await response.json()
const markets = regions.flatMap(region => region.countries.map(country => ({ region, country })))
if (markets.length !== 1 || markets[0].country.iso_2 !== 'se' || markets[0].region.currency_code !== 'sek') process.exit(1)
const methodsUrl = new URL('/store/payment-providers', base)
methodsUrl.searchParams.set('region_id', markets[0].region.id)
const methodsResponse = await fetch(methodsUrl, {
  headers: { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? '' },
  signal: AbortSignal.timeout(5000),
}).catch(() => null)
if (!methodsResponse?.ok) process.exit(1)
const { payment_providers } = await methodsResponse.json()
if (payment_providers.length !== 1 || !['pp_stripe_stripe', 'pp_stripe-hosted_stripe-hosted'].includes(payment_providers[0].id)) {
  console.error('Stripe must be the only payment provider for the Sweden region. Set STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET and NEXT_PUBLIC_STRIPE_KEY (or apps/backend/.env.stripe-hosted) and run make deploy.')
  process.exit(1)
}
NODE
then
  echo 'Could not verify the Sweden/SEK market and Stripe payments on Medusa. Run make deploy once if the market setup is still pending.' >&2
  exit 1
fi


git archive "$revision" apps/storefront | tar -xf - -C "$candidate"
storefront="$candidate/apps/storefront"
install -m 600 apps/storefront/.env.local "$storefront/.env.local"
release_id="${candidate##*.}-$revision"
marker="alicia-release-$release_id.txt"
printf '%s\n' "$revision" > "$storefront/public/$marker"
npm --prefix "$storefront" ci --no-audit --no-fund
MEDUSA_BACKEND_URL="$backend_url" npm --prefix "$storefront" run build

# Give browsers with an open tab access to the previous release’s static chunks.
previous="$releases/$active_port/apps/storefront"
if [[ "$active_port" == 8000 ]]; then previous="$repo/apps/storefront"; fi
if [[ -d "$previous/.next/static" ]]; then
  cp -an "$previous/.next/static/." "$storefront/.next/static/"
fi

cmp -s "$config" "$original_config" || { echo 'Caddyfile changed during the build.' >&2; exit 1; }
if run_pm2 describe "$app" >/dev/null 2>&1; then run_pm2 delete "$app"; fi
if [[ -n "$(ss -H -ltn "sport = :$target_port")" ]]; then
  echo "Port $target_port is in use. The active storefront is still on $active_port." >&2
  exit 1
fi
rm -rf -- "$slot"
mv -- "$candidate" "$slot"
storefront="$slot/apps/storefront"
MEDUSA_BACKEND_URL="$backend_url" run_pm2 start "$storefront/node_modules/next/dist/bin/next" \
  --name "$app" --cwd "$storefront" -- start --hostname 127.0.0.1 --port "$target_port"
started=true
node scripts/wait.mjs "http://127.0.0.1:$target_port/se"
node scripts/wait.mjs "http://127.0.0.1:$target_port/se/store"

next_config="$(mktemp "$(dirname "$config")/.alicia-caddy-next.XXXXXXXX")"
cp -p "$original_config" "$next_config"
sed -E -e "s/^(\s*reverse_proxy\s+127\.0\.0\.1:)$active_port([[:blank:]]*)$/\1$target_port\2/" \
       -e "s/^(\s*reverse_proxy\s+127\.0\.0\.1:)$active_api([[:blank:]]*)$/\1$target_api\2/" \
       "$original_config" > "$next_config"
dashboard_config="$(node scripts/caddy-dashboard.mjs "$next_config" "$target_api")"
printf '%s\n' "$dashboard_config" > "$next_config"
caddy validate --adapter caddyfile --config "$next_config"
cmp -s "$config" "$original_config" || { echo 'Caddyfile changed during deployment.' >&2; exit 1; }

# If activation or the public check fails, restore the previous routing.
mv -f -- "$next_config" "$config"
switched=true
if ! systemctl reload caddy ||
   ! curl -fsS --max-time 10 --resolve "$domain:443:127.0.0.1" "https://$domain/$marker" | grep -Fxq "$revision" ||
   ! curl -fsS --max-time 10 --resolve "$domain:443:127.0.0.1" "https://$domain/app" | grep -Ei '<(html|!doctype)' >/dev/null; then
  mv -f -- "$original_config" "$config"
  if systemctl reload caddy; then
    switched=false
    echo 'Caddy cutover failed. Restored the previous storefront.' >&2
  else
    echo 'Caddy could not reload the original configuration. Both storefronts are still running.' >&2
  fi
  exit 1
fi

run_pm2 save
if [[ "$backend_started" == true ]]; then
  printf 'Medusa live on port %s. Dashboard: https://%s/app\n' "$target_api" "$domain"
fi
printf 'Storefront live at https://%s on release %s. Previous storefront still running on port %s.\n' "$domain" "$revision" "$active_port"
