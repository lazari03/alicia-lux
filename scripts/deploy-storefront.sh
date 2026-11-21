#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
repo="$PWD"
domain=shopalicialux.se
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
# The storefront release depends on the Swedish market configured by the full deploy.
if ! node --env-file=apps/storefront/.env.local --input-type=module <<'NODE'
const base = process.env.MEDUSA_BACKEND_URL ?? 'http://localhost:9000'
const response = await fetch(new URL('/store/regions', base), {
  headers: { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? '' },
  signal: AbortSignal.timeout(5000),
}).catch(() => null)
if (!response?.ok) process.exit(1)
const { regions } = await response.json()
const markets = regions.flatMap(region => region.countries.map(country => [country.iso_2, region.currency_code]))
if (markets.length !== 1 || markets[0][0] !== 'se' || markets[0][1] !== 'sek') process.exit(1)
NODE
then
  echo 'Could not verify the Sweden/SEK market on Medusa. Run make deploy once if the market setup is still pending.' >&2
  exit 1
fi

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
  rm -rf -- "$candidate"
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

git archive "$revision" apps/storefront | tar -xf - -C "$candidate"
storefront="$candidate/apps/storefront"
install -m 600 apps/storefront/.env.local "$storefront/.env.local"
release_id="${candidate##*.}-$revision"
marker="alicia-release-$release_id.txt"
printf '%s\n' "$revision" > "$storefront/public/$marker"
npm --prefix "$storefront" ci --no-audit --no-fund
npm --prefix "$storefront" run build

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
run_pm2 start "$storefront/node_modules/next/dist/bin/next" \
  --name "$app" --cwd "$storefront" -- start --hostname 127.0.0.1 --port "$target_port"
started=true
node scripts/wait.mjs "http://127.0.0.1:$target_port/se"
node scripts/wait.mjs "http://127.0.0.1:$target_port/se/store"

next_config="$(mktemp "$(dirname "$config")/.alicia-caddy-next.XXXXXXXX")"
cp -p "$original_config" "$next_config"
sed -E "s/^(\s*reverse_proxy\s+127\.0\.0\.1:)$active_port([[:blank:]]*)$/\1$target_port\2/" "$original_config" > "$next_config"
caddy validate --adapter caddyfile --config "$next_config"
cmp -s "$config" "$original_config" || { echo 'Caddyfile changed during deployment.' >&2; exit 1; }

# If activation or the public check fails, restore the previous routing.
mv -f -- "$next_config" "$config"
switched=true
if ! systemctl reload caddy || ! curl -fsS --max-time 10 --resolve "$domain:443:127.0.0.1" "https://$domain/$marker" | grep -Fxq "$revision"; then
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
printf 'Storefront live at https://%s on release %s. Previous storefront still running on port %s.\n' "$domain" "$revision" "$active_port"
