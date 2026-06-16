#!/bin/sh
set -e


#read env from docker secret
export JWT_SECRET=$(cat /run/secrets/jwt_secret)
export GITHUB_CLIENT_SECRET=$(cat /run/secrets/github_client_secret)
export GOOGLE_CLIENT_SECRET=$(cat /run/secrets/google_client_secret)
export CHAIN_PRIVATE_KEY=$(cat /run/secrets/chain_private_key)


echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is ready"

while ! nc -z db 5432; do
  sleep 1
done
echo "Database is up!"

npm run db:migrate
npm run db:seed
exec "$@"