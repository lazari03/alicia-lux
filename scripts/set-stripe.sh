#!/usr/bin/env bash
# Sets Stripe keys (test or live) + webhook secret in .env.production,
# verifies the secret key with Stripe, then redeploys.
#   make stripe
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE="${ENV_FILE:-.env.production}"
[[ -f "$ENV_FILE" ]] || { echo "✗ $ENV_FILE not found" >&2; exit 1; }

# set_var NAME VALUE — replace the line, or append it if missing
set_var() {
  local name="$1" value="$2" tmp="$ENV_FILE.tmp"
  if grep -q "^${name}=" "$ENV_FILE"; then
    awk -v n="$name" -v v="$value" 'index($0, n"=")==1 { print n"="v; next } { print }' "$ENV_FILE" > "$tmp"
    cat "$tmp" > "$ENV_FILE"
    : > "$tmp"
  else
    printf '%s=%s\n' "$name" "$value" >> "$ENV_FILE"
  fi
}

SITE_URL=$(grep -m1 '^NEXT_PUBLIC_SITE_URL=' "$ENV_FILE" | cut -d= -f2-)
SITE_URL="${SITE_URL:-https://shopalicialux.se}"

if [[ "${SKIP_PROMPTS:-}" != 1 ]]; then
  echo "Stripe → Developers → API keys (switch Test/Live mode top-right)"
  read -rp  "Publishable key (pk_live_… or pk_test_…): " PK
  read -rsp "Secret key      (sk_live_… / rk_live_… or test): " SK; echo
fi

[[ "$PK" =~ ^pk_(live|test)_[A-Za-z0-9]+$ ]] || { echo "✗ Publishable key must start with pk_live_ or pk_test_" >&2; exit 1; }
[[ "$SK" =~ ^(sk|rk)_(live|test)_[A-Za-z0-9]+$ ]] || { echo "✗ Secret key must start with sk_live_, rk_live_, sk_test_ or rk_test_" >&2; exit 1; }
[[ "$PK" == pk_live_* ]] && PK_MODE=live || PK_MODE=test
[[ "$SK" == *_live_* ]] && SK_MODE=live || SK_MODE=test
[[ "$PK_MODE" == "$SK_MODE" ]] || { echo "✗ Mixed keys: publishable is $PK_MODE, secret is $SK_MODE. Use both from the same mode." >&2; exit 1; }

if [[ "${SKIP_VERIFY:-}" != 1 ]]; then
  echo "→ Verifying the secret key with Stripe…"
  code=$(curl -s -o /dev/null -w '%{http_code}' -u "$SK:" "https://api.stripe.com/v1/payment_intents?limit=1")
  [[ "$code" == 200 ]] || { echo "✗ Stripe rejected the secret key (HTTP $code). Copy it again." >&2; exit 1; }
  echo "  ✓ Key valid ($SK_MODE mode)"
fi

if [[ "${SKIP_PROMPTS:-}" != 1 ]]; then
  echo
  echo "Webhook: Stripe → Developers → Webhooks → Add endpoint ($SK_MODE mode)"
  echo "  URL:    $SITE_URL/api/stripe/webhook"
  echo "  Events: payment_intent.succeeded, charge.refunded"
  read -rsp "Webhook signing secret (whsec_…, Enter to skip): " WH; echo
fi
WH="${WH:-}"
[[ -z "$WH" || "$WH" =~ ^whsec_[A-Za-z0-9]+$ ]] || { echo "✗ Webhook secret must start with whsec_" >&2; exit 1; }

cp "$ENV_FILE" "$ENV_FILE.bak-$(date +%F-%H%M%S)"
set_var NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "$PK"
set_var STRIPE_SECRET_KEY "$SK"
[[ -n "$WH" ]] && set_var STRIPE_WEBHOOK_SECRET "$WH"
chmod 600 "$ENV_FILE"
unset PK SK WH
echo "✓ Saved to $ENV_FILE ($SK_MODE mode)"
[[ "$SK_MODE" == live ]] && echo "  ⚠ LIVE mode — real cards will be charged."

[[ "${SKIP_DEPLOY:-}" == 1 ]] && exit 0
echo
echo "→ Rebuilding (the publishable key is built into the page)…"
./deploy/deploy.sh
