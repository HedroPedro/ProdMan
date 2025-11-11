#!/bin/bash
set -e

# REMOVE server.pid
rm -f /app/tmp/pids/server.pid

echo "Waiting for database to be ready..."
while ! bundle exec ruby -e 'require "mysql2"; exit(Mysql2::Client.new(host: ENV.fetch("DATABASE_HOST"), username: ENV.fetch("DATABASE_USER"), password: ENV.fetch("DATABASE_PASSWORD"), database: ENV.fetch("DATABASE_NAME")).ping)' > /dev/null 2>&1; do
    echo "Trying to connect..."
    sleep 2
done
echo "Database is ready"

# RUN MIGRATIONS
bundle exec rails db:migrate

# CMD Dockerfile
exec "$@"