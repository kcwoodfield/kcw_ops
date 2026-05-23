#!/usr/bin/env bash
# Daily pg_dump of the kcw_ops Postgres container to ~/Backups/kcw_ops/.
# Run on demand: make backup
# Run on a schedule: see the cron snippet at the bottom of this file.

set -euo pipefail

BACKUP_DIR="${HOME}/Backups/kcw_ops"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "${BACKUP_DIR}"

if ! docker ps --format '{{.Names}}' | grep -q '^kcw_ops$'; then
  echo "✗ kcw_ops container is not running — start it with: make up" >&2
  exit 1
fi

OUT="${BACKUP_DIR}/kcw_ops-${TIMESTAMP}.sql.gz"
TMP="${OUT}.tmp"

docker exec kcw_ops pg_dump -U kcw_ops -d kcw_ops --no-owner --no-privileges \
  | gzip > "${TMP}"

# Atomic rename so partial dumps never live as final-named files.
mv "${TMP}" "${OUT}"

# Prune anything older than the retention window.
find "${BACKUP_DIR}" -name 'kcw_ops-*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "✓ ${OUT} ($(du -h "${OUT}" | cut -f1))"

# ── Run daily at 18:00 (crontab -e on macOS/Linux) ───────────────────────
#   0 18 * * * /Users/kcw/Sites/kcw_ops/bin/backup.sh >> /tmp/kcw_ops-backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────────
