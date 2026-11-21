SHELL := /bin/bash
.DEFAULT_GOAL := up
.PHONY: deploy deploy-storefront pull-main up db-check db-repair catalog-import stop status logs
deploy: pull-main
	$(MAKE) up

deploy-storefront: pull-main
	bash scripts/deploy-storefront.sh

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
catalog-import:
	cd apps/backend && ./node_modules/.bin/medusa exec ./src/scripts/import-catalog.ts
	cd apps/backend && ./node_modules/.bin/medusa exec ./src/scripts/configure-sweden.ts
stop:
	./node_modules/.bin/pm2 stop alicia-backend alicia-storefront
status:
	./node_modules/.bin/pm2 status
logs:
	./node_modules/.bin/pm2 logs
