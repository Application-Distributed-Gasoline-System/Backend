#!/bin/sh
set -eu
cd "$(dirname "$0")"
python3 prepare-env.py
docker compose --env-file .env -f compose.oracle.yml config --quiet
docker compose --env-file .env -f compose.oracle.yml build --parallel
if grep -q '^TUNNEL_TOKEN=.' .env; then
  docker compose --env-file .env -f compose.oracle.yml --profile public up -d --wait --wait-timeout 300
else
  docker compose --env-file .env -f compose.oracle.yml up -d --wait --wait-timeout 300
fi
if [ "${1:-}" = "--seed" ]; then
  for service in auth-ms drivers-ms vehicles-ms routes-ms fuel-ms; do
    docker compose --env-file .env -f compose.oracle.yml exec -T "$service" node deploy/seed.cjs
  done
fi
docker compose --env-file .env -f compose.oracle.yml ps
