#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
config="$(realpath /etc/caddy/Caddyfile)"
mkdir -p .cache/storefront-releases
exec 9>.cache/storefront-releases/deploy.lock
flock -n 9 || { echo 'A deployment is already running.' >&2; exit 1; }

mapfile -t api < <(sed -nE 's/^[[:blank:]]*reverse_proxy[[:blank:]]+127\.0\.0\.1:(900[012])[[:blank:]]*$/\1/p' "$config")
[[ ${#api[@]} -eq 1 ]] || { echo 'Expected one direct Medusa upstream.' >&2; exit 1; }
port="${api[0]}"
candidate="$(mktemp "$(dirname "$config")/.alicia-admin-next.XXXXXXXX")"
backup="$(mktemp "$(dirname "$config")/.alicia-admin-backup.XXXXXXXX")"
trap 'rm -f -- "$candidate" "$backup"' EXIT
cp -p "$config" "$backup"
cp -p "$backup" "$candidate"
node scripts/caddy-dashboard.mjs "$backup" "$port" > "$candidate"
curl -fsS --max-time 10 "http://127.0.0.1:$port/health" >/dev/null
caddy validate --adapter caddyfile --config "$candidate"
cmp -s "$config" "$backup" || { echo 'Caddyfile changed during the update.' >&2; exit 1; }
mv -f -- "$candidate" "$config"
if ! systemctl reload caddy || ! curl -fsS --max-time 12 --resolve shopalicialux.se:443:127.0.0.1 https://shopalicialux.se/app | grep -Ei '<(html|!doctype)' >/dev/null; then
  mv -f -- "$backup" "$config"
  systemctl reload caddy
  echo 'Dashboard verification failed. Restored the previous Caddy routing.' >&2
  exit 1
fi
echo 'Dashboard ready at https://shopalicialux.se/app'
