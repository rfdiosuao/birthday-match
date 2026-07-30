#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/birthday-match}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/backups}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

mkdir -p "$BACKUP_DIR"
set -a
. "$ENV_FILE"
set +a

docker exec birthday-match-db \
  pg_dump --clean --if-exists --no-owner --username "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip -9 > "$BACKUP_DIR/birthday-match-$STAMP.sql.gz"

find "$BACKUP_DIR" -type f -name 'birthday-match-*.sql.gz' -mtime +14 -delete
