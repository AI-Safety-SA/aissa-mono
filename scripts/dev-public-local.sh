#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TRACK_RECORD_PORT="${TRACK_RECORD_PORT:-3000}"
PUBLIC_WEBSITE_PORT="${PUBLIC_WEBSITE_PORT:-3001}"
LOCAL_PUBLIC_TRACK_RECORD_TOKEN="${LOCAL_PUBLIC_TRACK_RECORD_TOKEN:-local-public-track-record-token}"
TRACK_RECORD_URL="http://localhost:${TRACK_RECORD_PORT}"
TRACK_RECORD_ENV_FILE="$ROOT_DIR/apps/track-record/.env"
TRACK_RECORD_DEV_ENV_FILE="$ROOT_DIR/apps/track-record/.env.development"

if [[ ! -f "$TRACK_RECORD_ENV_FILE" && ! -f "$TRACK_RECORD_DEV_ENV_FILE" ]]; then
  cat >&2 <<'EOF'
Missing track-record local env.

Create apps/track-record/.env or apps/track-record/.env.development with at least:
- DATABASE_URL
- PAYLOAD_SECRET
EOF
  exit 1
fi

read_track_record_env_value() {
  local name="$1"
  local file
  local line
  local value

  for file in "$TRACK_RECORD_DEV_ENV_FILE" "$TRACK_RECORD_ENV_FILE"; do
    if [[ -f "$file" ]]; then
      line="$(grep -E "^${name}=" "$file" | tail -n 1 || true)"
      if [[ -n "$line" ]]; then
        value="${line#*=}"
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        printf '%s' "$value"
        return 0
      fi
    fi
  done
}

PUBLIC_R2_PUBLIC_URL="${R2_PUBLIC_URL:-$(read_track_record_env_value R2_PUBLIC_URL)}"

cleanup() {
  if [[ -n "${TRACK_RECORD_PID:-}" ]]; then
    kill "$TRACK_RECORD_PID" 2>/dev/null || true
  fi
  if [[ -n "${PUBLIC_WEBSITE_PID:-}" ]]; then
    kill "$PUBLIC_WEBSITE_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting track-record API at ${TRACK_RECORD_URL}"
(
  cd "$ROOT_DIR"
  PUBLIC_TRACK_RECORD_API_TOKEN="$LOCAL_PUBLIC_TRACK_RECORD_TOKEN" \
    NEXT_PUBLIC_SERVER_URL="${NEXT_PUBLIC_SERVER_URL:-$TRACK_RECORD_URL}" \
    pnpm --filter track-record exec cross-env NODE_ENV=development next dev --port "$TRACK_RECORD_PORT"
) &
TRACK_RECORD_PID=$!

echo "Starting public website at http://localhost:${PUBLIC_WEBSITE_PORT}"
(
  cd "$ROOT_DIR"
  TRACK_RECORD_API_BASE_URL="$TRACK_RECORD_URL" \
    TRACK_RECORD_API_TOKEN="$LOCAL_PUBLIC_TRACK_RECORD_TOKEN" \
    NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:${PUBLIC_WEBSITE_PORT}}" \
    R2_PUBLIC_URL="$PUBLIC_R2_PUBLIC_URL" \
    pnpm --filter public-website exec next dev --port "$PUBLIC_WEBSITE_PORT"
) &
PUBLIC_WEBSITE_PID=$!

while kill -0 "$TRACK_RECORD_PID" 2>/dev/null && kill -0 "$PUBLIC_WEBSITE_PID" 2>/dev/null; do
  sleep 1
done
