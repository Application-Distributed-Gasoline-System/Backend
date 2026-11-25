#!/bin/sh
set -eu
if [ "${1:-}" = "node" ] && [ "${2:-}" = "dist/main.js" ] && [ -f prisma/schema.prisma ]; then
  if [ "$SERVICE" = "fuel-ms" ]; then
    ./node_modules/.bin/prisma db push --skip-generate
  else
    ./node_modules/.bin/prisma migrate deploy
  fi
fi
exec "$@"
