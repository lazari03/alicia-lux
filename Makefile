SHELL := /bin/bash
.DEFAULT_GOAL := help
.PHONY: help deploy setup migrate stripe caddy logs status restart stop

help: ## Show commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-9s %s\n", $$1, $$2}'

deploy: ## Pull main, rebuild and restart the shop
	./deploy/deploy.sh

setup: ## One-time: Supabase schema, products and admin login
	ENV_FILE=.env.production ./scripts/supabase-setup.sh

migrate: ## Apply database migrations only (safe to re-run)
	@set -a; . ./.env.production; set +a; \
	for f in supabase/migrations/*.sql; do echo "→ $$f"; psql "$$SUPABASE_DB_URL" --no-psqlrc -q -v ON_ERROR_STOP=1 -f "$$f" || exit 1; done; \
	echo "✓ Database is up to date"

stripe: ## Set Stripe keys + webhook (test or live), verify, redeploy
	./scripts/set-stripe.sh

caddy: ## One-time: point the host Caddy at the shop (port 3000)
	./deploy/caddy.sh

logs: ## Follow the shop logs
	docker compose logs -f --tail=100 shop

status: ## Show running containers
	docker compose ps

restart: ## Restart without rebuilding
	docker compose restart shop

stop: ## Stop the shop
	docker compose down
