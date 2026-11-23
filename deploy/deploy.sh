#!/usr/bin/env bash
# Pull the latest main and rebuild on the Hetzner server.
#   ./deploy/deploy.sh            # app only (Caddy already installed on the host)
#   WITH_CADDY=1 ./deploy/deploy.sh   # also run the bundled Caddy container
set -euo pipefail
cd "$(dirname "$0")/.."

[[ -f .env.production ]] || { echo "✗ Create .env.production first (cp .env.example .env.production)" >&2; exit 1; }
set -a; source .env.production; set +a

git pull --ff-only
PROFILE=(); [[ "${WITH_CADDY:-}" == 1 ]] && PROFILE=(--profile caddy)

docker compose "${PROFILE[@]}" build shop
docker compose "${PROFILE[@]}" up -d --remove-orphans
docker image prune -f >/dev/null

for i in {1..30}; do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then echo "✓ Alicia Lux is live"; exit 0; fi
  sleep 2
done
echo "✗ The app did not come up — check: docker compose logs shop" >&2
exit 1
