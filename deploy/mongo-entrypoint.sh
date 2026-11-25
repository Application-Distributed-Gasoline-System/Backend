#!/bin/bash
set -eu
printf '%s' "$MONGO_REPLICA_KEY" > /tmp/fuelops-replica.key
chmod 400 /tmp/fuelops-replica.key
chown mongodb:mongodb /tmp/fuelops-replica.key
exec /usr/local/bin/docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --keyFile /tmp/fuelops-replica.key
