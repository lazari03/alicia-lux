#!/usr/bin/env bash
# Points the host's Caddy at the shop on 127.0.0.1:3000. Backs up the Caddyfile
# first and restores it automatically if the new config doesn't validate.
set -euo pipefail
DOMAIN="${DOMAIN:-shopalicialux.se}"
CF="${CADDYFILE:-/etc/caddy/Caddyfile}"
[[ -f "$CF" ]] || { echo "✗ $CF not found — is Caddy installed on this host?" >&2; exit 1; }

BACKUP="$CF.bak-$(date +%F-%H%M%S)"
cp "$CF" "$BACKUP"
python3 - "$CF" "$DOMAIN" <<'PY'
import re, sys
path, domain = sys.argv[1], sys.argv[2]
s = open(path).read()
block = f"{domain} {{\n\tencode zstd gzip\n\treverse_proxy 127.0.0.1:3000\n}}\n"
m = re.search(rf'(?m)^[^\n{{]*\b{re.escape(domain)}\b[^\n{{]*\{{', s)
if m:
    i, depth = m.end(), 1
    while depth:
        depth += {'{': 1, '}': -1}.get(s[i], 0); i += 1
    s = s[:m.start()] + block + "\n" + s[i:].lstrip('\n')
else:
    s = s.rstrip() + "\n\n" + block
open(path, 'w').write(s)
PY

if caddy validate --config "$CF" --adapter caddyfile >/dev/null 2>&1; then
  systemctl reload caddy
  echo "✓ Caddy now serves https://$DOMAIN from 127.0.0.1:3000 (backup: $BACKUP)"
else
  cp "$BACKUP" "$CF"
  echo "✗ New Caddyfile was invalid — restored $BACKUP" >&2
  caddy validate --config "$CF" --adapter caddyfile || true
  exit 1
fi
