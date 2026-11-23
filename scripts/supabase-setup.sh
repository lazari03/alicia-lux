#!/usr/bin/env bash
# Alicia Lux — one-shot Supabase setup.
#   1. creates tables, RLS policies, functions and the image bucket
#   2. seeds the three Signature Organizer products
#   3. creates (or promotes) your admin login
#
# Safe to re-run. Needs: psql (apt install postgresql-client), curl.
#
# Usage:
#   ./scripts/supabase-setup.sh                 # reads .env.local
#   ENV_FILE=.env.production ./scripts/supabase-setup.sh
set -euo pipefail

cd "$(dirname "$0")/.."
ENV_FILE="${ENV_FILE:-.env.local}"

if [[ -f "$ENV_FILE" ]]; then
  set -a; source "$ENV_FILE"; set +a
else
  echo "⚠  $ENV_FILE not found — using variables from the current shell." >&2
fi

need() { [[ -n "${!1:-}" ]] || { echo "✗ Missing $1 (set it in $ENV_FILE)" >&2; exit 1; }; }
need SUPABASE_DB_URL                # Project Settings → Database → Connection string (URI, session pooler)
need NEXT_PUBLIC_SUPABASE_URL
need SUPABASE_SERVICE_ROLE_KEY

command -v psql >/dev/null || { echo "✗ psql not found. Install it: sudo apt install -y postgresql-client  (macOS: brew install libpq)" >&2; exit 1; }
command -v curl >/dev/null || { echo "✗ curl not found." >&2; exit 1; }

PSQL=(psql "$SUPABASE_DB_URL" --no-psqlrc -v ON_ERROR_STOP=1 -q)

echo "→ Checking database connection…"
"${PSQL[@]}" -c "select 1" >/dev/null

echo "→ Applying schema (supabase/migrations)…"
for file in supabase/migrations/*.sql; do
  echo "   • $file"
  "${PSQL[@]}" -f "$file"
done

read -r -p "Initial stock per product [0]: " STOCK
STOCK="${STOCK:-0}"
read -r -p "Flat shipping fee in SEK (0 = free) [0]: " SHIPPING
SHIPPING="${SHIPPING:-0}"
[[ "$STOCK" =~ ^[0-9]+$ && "$SHIPPING" =~ ^[0-9]+([.,][0-9]{1,2})?$ ]] || { echo "✗ Use whole numbers for stock and a number for shipping." >&2; exit 1; }
SHIPPING_ORE=$(awk -v s="${SHIPPING/,/.}" 'BEGIN { printf "%d", s * 100 + 0.5 }')

echo "→ Seeding products…"
"${PSQL[@]}" -v stock="$STOCK" -v shipping_ore="$SHIPPING_ORE" -f supabase/seed.sql
"${PSQL[@]}" -At -c "select '   • ' || name || ' — ' || subtitle || ' (stock ' || stock || ')' from public.products order by sort_order"

echo
read -r -p "Admin email: " ADMIN_EMAIL
[[ "$ADMIN_EMAIL" == *@*.* ]] || { echo "✗ Enter a valid email." >&2; exit 1; }

EXISTS=$("${PSQL[@]}" -At -v email="$ADMIN_EMAIL" <<'SQL'
select count(*) from auth.users where lower(email) = lower(:'email');
SQL
)

if [[ "$EXISTS" == "0" ]]; then
  read -r -s -p "Admin password (min 10 characters): " ADMIN_PASSWORD; echo
  [[ ${#ADMIN_PASSWORD} -ge 10 ]] || { echo "✗ Password too short." >&2; exit 1; }

  # Same headers supabase-js sends: works for sb_secret_ keys and legacy service_role JWTs.
  AUTH_HEADERS=(-H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json")

  BODY=$(ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" node -e \
    'process.stdout.write(JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, email_confirm: true }))' 2>/dev/null \
    || printf '{"email":"%s","password":"%s","email_confirm":true}' "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

  STATUS=$(curl -sS -o /tmp/alicia-admin.json -w "%{http_code}" -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL%/}/auth/v1/admin/users" "${AUTH_HEADERS[@]}" --data-binary @- <<<"$BODY")
  if [[ "$STATUS" != "200" && "$STATUS" != "201" ]]; then
    echo "✗ Could not create the user (HTTP $STATUS):" >&2; cat /tmp/alicia-admin.json >&2; echo >&2
    rm -f /tmp/alicia-admin.json; exit 1
  fi
  rm -f /tmp/alicia-admin.json
  echo "   • Created user $ADMIN_EMAIL"
else
  echo "   • User exists — granting admin access"
fi

"${PSQL[@]}" -v email="$ADMIN_EMAIL" <<'SQL'
insert into public.admin_users (user_id)
select id from auth.users where lower(email) = lower(:'email')
on conflict do nothing;
SQL

echo
echo "✓ Supabase is ready. Sign in at ${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}/admin"
