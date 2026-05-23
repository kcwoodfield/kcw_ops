#!/usr/bin/env bash
# Daily pg_dump of the kcw_ops Postgres container to ~/Backups/kcw_ops/.
# Run on demand: make backup
# Run on a schedule: make cron-install (see Makefile)

set -euo pipefail

# Cron on macOS has a minimal PATH — Docker Desktop lives in one of these.
export PATH="/usr/local/bin:/opt/homebrew/bin:${PATH}"

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
REPO_DIR="$( cd "${SCRIPT_DIR}/.." && pwd )"

BACKUP_DIR="${HOME}/Backups/kcw_ops"
RETENTION_DAYS=30
HEALTH_TIMEOUT=60
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p "${BACKUP_DIR}"

# Auto-start the compose stack if the container isn't running — keeps the
# cron resilient on a laptop where the container may be down at 18:00.
if ! docker ps --format '{{.Names}}' | grep -q '^kcw_ops$'; then
  echo "▸ kcw_ops not running — starting docker compose…"
  docker compose -f "${REPO_DIR}/docker-compose.yml" up -d
fi

# Wait for the healthcheck so pg_dump doesn't race the boot.
status=""
for _ in $(seq 1 "${HEALTH_TIMEOUT}"); do
  status=$(docker inspect --format '{{.State.Health.Status}}' kcw_ops 2>/dev/null || echo "missing")
  [[ "${status}" == "healthy" ]] && break
  sleep 1
done

if [[ "${status}" != "healthy" ]]; then
  echo "✗ kcw_ops did not become healthy in ${HEALTH_TIMEOUT}s (last: ${status})" >&2
  exit 1
fi

OUT="${BACKUP_DIR}/kcw_ops-${TIMESTAMP}.sql.gz"
TMP="${OUT}.tmp"

docker exec kcw_ops pg_dump -U kcw_ops -d kcw_ops --no-owner --no-privileges \
  | gzip > "${TMP}"

# Atomic rename so a partial dump can't live as a final-named file.
mv "${TMP}" "${OUT}"

find "${BACKUP_DIR}" -name 'kcw_ops-*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "✓ ${OUT} ($(du -h "${OUT}" | cut -f1))"
