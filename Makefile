# kcw / ops — dev convenience targets.
# Run `make` (no args) for help.

.PHONY: help dev up down api web backup restore-list

BACKUP_DIR := $(HOME)/Backups/kcw_ops

help:
	@echo "Targets:"
	@echo "  make dev          — postgres + api + web together (⌃C stops both)"
	@echo "  make up           — start postgres (docker compose up -d)"
	@echo "  make down         — stop postgres"
	@echo "  make api          — run .NET API only (foreground)"
	@echo "  make web          — run Vite dev server only (foreground)"
	@echo "  make backup       — pg_dump → $(BACKUP_DIR)"
	@echo "  make restore-list — list recent backups"

up:
	@docker compose up -d
	@echo "▸ postgres ready on :5435"

down:
	@docker compose down

api:
	@dotnet run --project api

web:
	@cd web && npm run dev

# Run api + web in parallel with prefixed log lines. ⌃C kills both.
dev: up
	@echo "▸ api :5050  · web :5175  · ⌃C stops both"
	@trap 'kill 0' INT TERM EXIT; \
	  (dotnet run --project api 2>&1 | sed 's/^/[api] /') & \
	  (cd web && npm run dev 2>&1 | sed 's/^/[web] /') & \
	  wait

backup:
	@./bin/backup.sh

restore-list:
	@ls -lh $(BACKUP_DIR) 2>/dev/null || echo "(no backups yet — run \`make backup\`)"
