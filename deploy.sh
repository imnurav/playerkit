#!/bin/bash

set -e

NGINX_CONFIG="/etc/nginx/conf.d/player.conf"

echo "Checking active port..."

if grep -q "6969" "$NGINX_CONFIG"; then
    ACTIVE_PORT=6969
    NEW_PORT=6970
    OLD_CONTAINER=player-blue
    NEW_CONTAINER=player-green
else
    ACTIVE_PORT=6970
    NEW_PORT=6969
    OLD_CONTAINER=player-green
    NEW_CONTAINER=player-blue
fi

echo "Active port: $ACTIVE_PORT"
echo "Deploying to: $NEW_PORT"

echo "Building image..."
docker build -t player-app:latest .

echo "Removing stale container if exists..."
docker rm -f $NEW_CONTAINER 2>/dev/null || true

echo "Starting new container..."
docker run -d \
  --name $NEW_CONTAINER \
  -p $NEW_PORT:80 \
  player-app:latest

echo "Waiting for startup..."
sleep 10

echo "Running health check..."
curl -f http://localhost:$NEW_PORT >/dev/null

echo "Updating nginx..."

sudo sed -i \
"s/proxy_pass http:\/\/127.0.0.1:$ACTIVE_PORT;/proxy_pass http:\/\/127.0.0.1:$NEW_PORT;/" \
$NGINX_CONFIG

sudo nginx -t

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Waiting before cleanup..."
sleep 5

echo "Removing old container..."
docker rm -f $OLD_CONTAINER 2>/dev/null || true

echo "Deployment successful!"
echo "Traffic switched to port $NEW_PORT"