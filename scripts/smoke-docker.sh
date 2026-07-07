#!/usr/bin/env sh
set -eu

COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-whatsapp-n8n-server-smoke}"
export COMPOSE_PROJECT_NAME

cleanup() {
  docker compose down --volumes --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

cleanup
docker compose build
docker compose up -d

attempt=1
max_attempts=30

while [ "$attempt" -le "$max_attempts" ]; do
  if docker compose exec -T app node -e "fetch('http://127.0.0.1:3000/api/v1/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    echo "Docker smoke test passed."
    exit 0
  fi

  attempt=$((attempt + 1))
  sleep 2
done

docker compose logs app
echo "Docker smoke test failed: health endpoint did not become ready." >&2
exit 1
