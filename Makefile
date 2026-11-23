SHELL := /bin/bash
.DEFAULT_GOAL := help
.PHONY: help deploy setup caddy logs status restart stop

help: ## Show commands
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-9s %s\n", $$1, $$2}'

deploy: ## Pull main, rebuild and restart the shop
	./deploy/deploy.sh

setup: ## One-time: Supabase schema, products and admin login
	ENV_FILE=.env.production ./scripts/supabase-setup.sh

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
