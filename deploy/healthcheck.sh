#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/birthday-match}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"
MAX_DISK_PERCENT="${MAX_DISK_PERCENT:-90}"
MAX_BACKUP_AGE_MINUTES="${MAX_BACKUP_AGE_MINUTES:-1500}"
failed=0

disk_percent="$(df -P / | awk 'NR == 2 { gsub(/%/, "", $5); print $5 }')"
if [ "$disk_percent" -ge "$MAX_DISK_PERCENT" ]; then
  echo "CRITICAL disk_usage=${disk_percent}% threshold=${MAX_DISK_PERCENT}%"
  failed=1
else
  echo "OK disk_usage=${disk_percent}%"
fi

for container in birthday-match-app birthday-match-db; do
  health="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container" 2>/dev/null || true)"
  if [ "$health" != "healthy" ]; then
    echo "CRITICAL container=$container status=${health:-missing}"
    failed=1
  else
    echo "OK container=$container status=healthy"
  fi
done

latest_backup="$(find "$APP_DIR/backups" -type f -name 'birthday-match-*.sql.gz' -mmin "-$MAX_BACKUP_AGE_MINUTES" -print -quit 2>/dev/null || true)"
if [ -z "$latest_backup" ]; then
  echo "CRITICAL backup=fresh_copy_missing max_age_minutes=$MAX_BACKUP_AGE_MINUTES"
  failed=1
else
  echo "OK backup=fresh"
fi

set -a
. "$ENV_FILE"
set +a
open_reports="$(docker exec birthday-match-db psql -At -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select count(*) from reports where status in ('open', 'reviewing')" 2>/dev/null || echo unknown)"
open_support="$(docker exec birthday-match-db psql -At -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select count(*) from support_requests where status = 'open'" 2>/dev/null || echo unknown)"
echo "INFO open_reports=$open_reports open_support=$open_support"

exit "$failed"
