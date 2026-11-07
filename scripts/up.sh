#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export npm_config_cache="${npm_config_cache:-$PWD/.cache/npm}"
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$PWD/.cache/config}"
command -v node >/dev/null || { echo 'Install Node.js 22 or newer first.'; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<22) process.exit(1)'
docker compose version >/dev/null
# npm install also repairs lockfiles produced by a different npm release.
npm --prefix apps/backend install --no-audit --no-fund
npm --prefix apps/storefront install --no-audit --no-fund
npm install --no-audit --no-fund
node scripts/configure.mjs backend
docker compose up -d --wait
npm run db:migrate
REGIONS="$(docker compose exec -T postgres psql -U medusa -d alicia_lux -Atc 'SELECT count(*) FROM region WHERE deleted_at IS NULL;')"
if [ "$REGIONS" = 0 ]; then
  npm run db:seed
fi
node scripts/configure.mjs storefront
PM2="$PWD/node_modules/.bin/pm2"
# Stop only these apps before replacing their build outputs.
for app in alicia-storefront alicia-backend; do
  if "$PM2" describe "$app" >/dev/null 2>&1; then "$PM2" stop "$app"; fi
done
npm run build:backend
cp apps/backend/.env apps/backend/.medusa/server/.env
chmod 600 apps/backend/.medusa/server/.env
start_app() {
  if "$PM2" describe "$1" >/dev/null 2>&1; then
    "$PM2" restart "$1" --update-env
  else
    "$PM2" start npm --name "$1" --cwd "$PWD/apps/$2" -- start
  fi
}
start_app alicia-backend backend
node scripts/wait.mjs http://localhost:9000/health
npm run build:storefront
start_app alicia-storefront storefront
node scripts/wait.mjs http://localhost:8000/de
"$PM2" save
"$PM2" status
printf '\nShop ready on http://localhost:8000/de\nAdmin: http://localhost:9000/app\nRun make logs to inspect logs.\n'
printf 'For reboot persistence, run: ./node_modules/.bin/pm2 startup\n'
