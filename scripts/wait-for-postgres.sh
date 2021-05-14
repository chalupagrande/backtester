#!/bin/sh
# wait-for-postgres.sh

#  _  _  ___ _____   ___ ___ ___ _  _  ___   _   _ ___ ___ ___
# | \| |/ _ \_   _| | _ ) __|_ _| \| |/ __| | | | / __| __|   \
# | .` | (_) || |   | _ \ _| | || .` | (_ | | |_| \__ \ _|| |) |
# |_|\_|\___/ |_|   |___/___|___|_|\_|\___|  \___/|___/___|___/
#

set -e

host="$1"
shift
cmd="$@"

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -U "postgres" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd