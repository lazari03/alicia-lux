SHELL := /bin/bash
.DEFAULT_GOAL := up
.PHONY: deploy deploy-storefront fix-admin pull-main up db-check db-repair stock-status catalog-import stop status logs
deploy: pull-main
	bash scripts/deploy-storefront.sh --with-backend

deploy-storefront: pull-main
	bash scripts/deploy-storefront.sh

fix-admin:
	bash scripts/fix-admin.sh

pull-main:
	@test "$$(git branch --show-current)" = main || { echo "Switch to main before deploying." >&2; exit 1; }
	git pull --ff-only origin main
	@test "$$(git rev-parse HEAD)" = "$$(git rev-parse FETCH_HEAD)" || { echo "Local main has commits that are absent from origin/main." >&2; exit 1; }

up:
	bash scripts/up.sh
db-check:
	node scripts/database.mjs check
db-repair:
	node scripts/database.mjs repair
stock-status:
	bash scripts/stock-status.sh
catalog-import:
	cd apps/backend && ./node_modules/.bin/medusa exec ./src/scripts/import-catalog.ts
	cd apps/backend && ./node_modules/.bin/medusa exec ./src/scripts/configure-sweden.ts
stop:
	@set -e; for app in alicia-backend alicia-storefront alicia-backend-9001 alicia-backend-9002 alicia-storefront-8001 alicia-storefront-8002; do \
	  if ./node_modules/.bin/pm2 describe "$$app" >/dev/null 2>&1; then ./node_modules/.bin/pm2 stop "$$app"; fi; \
	done
status:
	./node_modules/.bin/pm2 status
logs:
	./node_modules/.bin/pm2 logs
