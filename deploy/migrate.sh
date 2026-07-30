#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/birthday-match}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"

set -a
. "$ENV_FILE"
set +a

docker exec -i birthday-match-db \
  psql --set ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  < "$APP_DIR/database/schema.sql"
