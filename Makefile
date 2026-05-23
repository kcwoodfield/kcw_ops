# kcw / ops — dev convenience targets.
# Run `make` (no args) for help.

.PHONY: help dev up down api web backup restore-list cron-install cron-uninstall cron-status

BACKUP_DIR    := $(HOME)/Backups/kcw_ops
CRON_SCHEDULE := 0 18 * * *
# The tag stays a shell variable inside the recipes — Make treats # as a
# comment marker, so we can't put it in a := assignment.

help:
	@echo "Targets:"
	@echo "  make dev            — postgres + api + web together (⌃C stops both)"
	@echo "  make up             — start postgres (docker compose up -d)"
	@echo "  make down           — stop postgres"
	@echo "  make api            — run .NET API only (foreground)"
	@echo "  make web            — run Vite dev server only (foreground)"
	@echo "  make backup         — pg_dump → $(BACKUP_DIR)"
	@echo "  make restore-list   — list recent backups"
	@echo "  make cron-install   — install daily 18:00 backup in your crontab"
	@echo "  make cron-uninstall — remove the kcw_ops backup cron entry"
	@echo "  make cron-status    — show whether the backup cron is installed"

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

# Cron management — uses a tag comment so we can find/remove our own line
# without touching unrelated crontab entries. Idempotent.
cron-install:
	@TAG='# kcw_ops backup'; \
	 LINE='$(CRON_SCHEDULE) $(CURDIR)/bin/backup.sh >> /tmp/kcw_ops-backup.log 2>&1 '"$$TAG"; \
	 ( crontab -l 2>/dev/null | grep -vF "$$TAG"; echo "$$LINE" ) | crontab -; \
	 echo "✓ installed: $$LINE"; \
	 echo "  (macOS may prompt for Full Disk Access — grant it to Terminal/iTerm.)"

cron-uninstall:
	@TAG='# kcw_ops backup'; \
	 crontab -l 2>/dev/null | grep -vF "$$TAG" | crontab -; \
	 echo "✓ removed kcw_ops backup cron entry"

cron-status:
	@TAG='# kcw_ops backup'; \
	 crontab -l 2>/dev/null | grep -F "$$TAG" || echo "(not installed — run \`make cron-install\`)"
