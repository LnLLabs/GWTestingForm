#!/bin/sh
set -eu

data_dir=$(dirname "${DATABASE_PATH:-/var/lib/gw-tester/tester.db}")
mkdir -p "$data_dir"
chown -R node:node "$data_dir"

exec su -s /bin/sh node -c "exec npm start -- -H 0.0.0.0 -p ${PORT:-3000}"
