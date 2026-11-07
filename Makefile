SHELL := /bin/bash
.DEFAULT_GOAL := up
.PHONY: up stop status logs
up:
	bash scripts/up.sh
stop:
	./node_modules/.bin/pm2 stop alicia-backend alicia-storefront
status:
	./node_modules/.bin/pm2 status
logs:
	./node_modules/.bin/pm2 logs
