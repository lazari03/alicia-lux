#!/usr/bin/env bash
# Manage admin logins for /admin.
#   make admin            add (or promote) an admin
#   make admins           list admins
#   make remove-admin     revoke admin access (the login itself is kept)
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE="${ENV_FILE:-.env.production}"
[[ -f "$ENV_FILE" ]] || { echo "✗ $ENV_FILE not found" >&2; exit 1; }
set -a; . "./$ENV_FILE"; set +a

PSQL=(psql "$SUPABASE_DB_URL" --no-psqlrc -q -v ON_ERROR_STOP=1)

list() {
  "${PSQL[@]}" -c "select u.email, a.created_at::date as admin_since, u.last_sign_in_at::timestamp(0) as last_sign_in
                   from public.admin_users a join auth.users u on u.id = a.user_id order by a.created_at;"
}

add() {
  local email="${EMAIL:-}" password="${PASSWORD:-}"
  [[ -n "$email" ]] || read -rp "Admin email: " email
  email=$(printf '%s' "$email" | tr '[:upper:]' '[:lower:]' | xargs)
  [[ "$email" == *@*.* ]] || { echo "✗ Enter a valid email." >&2; exit 1; }

  local exists
  exists=$("${PSQL[@]}" -At -v email="$email" <<'SQL'
select count(*) from auth.users where lower(email) = :'email';
SQL
)
  if [[ "$exists" == 0 ]]; then
    [[ -n "$password" ]] || { read -rsp "Password for $email (min 10 characters): " password; echo; }
    [[ ${#password} -ge 10 ]] || { echo "✗ Password must be at least 10 characters." >&2; exit 1; }
    local body status
    body=$(EMAIL="$email" PASSWORD="$password" node -e \
      'process.stdout.write(JSON.stringify({email:process.env.EMAIL,password:process.env.PASSWORD,email_confirm:true}))')
    status=$(curl -s -o /tmp/alicia-admin.json -w '%{http_code}' -X POST "${NEXT_PUBLIC_SUPABASE_URL%/}/auth/v1/admin/users" \
      -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Content-Type: application/json" --data-binary @- <<<"$body")
    if [[ "$status" != 200 && "$status" != 201 ]]; then
      echo "✗ Could not create the login (HTTP $status):" >&2; cat /tmp/alicia-admin.json >&2; echo >&2
      : > /tmp/alicia-admin.json; exit 1
    fi
    : > /tmp/alicia-admin.json
    echo "✓ Created login $email"
  else
    echo "• $email already has a login — granting admin access"
  fi

  "${PSQL[@]}" -v email="$email" <<'SQL'
insert into public.admin_users (user_id)
select id from auth.users where lower(email) = :'email'
on conflict do nothing;
SQL
  echo "✓ $email is an admin. Sign in at ${NEXT_PUBLIC_SITE_URL:-https://shopalicialux.se}/admin"
}

remove() {
  local email="${EMAIL:-}"
  [[ -n "$email" ]] || read -rp "Email to remove from admins: " email
  email=$(printf '%s' "$email" | tr '[:upper:]' '[:lower:]' | xargs)
  local count
  count=$("${PSQL[@]}" -At -c "select count(*) from public.admin_users")
  local is_admin
  is_admin=$("${PSQL[@]}" -At -v email="$email" <<'SQL'
select count(*) from public.admin_users a join auth.users u on u.id = a.user_id where lower(u.email) = :'email';
SQL
)
  [[ "$is_admin" == 1 ]] || { echo "✗ $email is not an admin." >&2; exit 1; }
  [[ "$count" -gt 1 ]] || { echo "✗ $email is the last admin — add another admin first." >&2; exit 1; }
  "${PSQL[@]}" -v email="$email" <<'SQL'
delete from public.admin_users a using auth.users u
where u.id = a.user_id and lower(u.email) = :'email';
SQL
  echo "✓ Removed admin access for $email"
}

case "${1:-add}" in
  add) add ;;
  list) list ;;
  remove) remove ;;
  *) echo "Usage: $0 add|list|remove" >&2; exit 1 ;;
esac
