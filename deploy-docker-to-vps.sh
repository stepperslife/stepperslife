#!/bin/bash

# Deploy Docker Application to VPS
# This script syncs the Docker configuration to VPS and rebuilds containers

set -e

VPS_HOST="events-production"
VPS_IP="72.60.28.175"
VPS_PATH="/root/stepperslife-v2-docker"
LOCAL_PATH="/Users/irawatkins/stepperslife-v2-docker"

echo "🚀 Deploying Docker Application to VPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 VPS: $VPS_HOST ($VPS_IP)"
echo "📁 Local: $LOCAL_PATH"
echo "📁 Remote: $VPS_PATH"
echo ""

# Step 1: Sync files to VPS
echo "📦 Step 1: Syncing project files to VPS..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'src/events-stepperslife/node_modules' \
  --exclude 'src/events-stepperslife/.next' \
  --exclude '*.backup.*' \
  --exclude '.env.local' \
  "$LOCAL_PATH/" "$VPS_HOST:$VPS_PATH/"

echo ""
echo "✅ Files synced successfully!"
echo ""

# Step 2: Build and deploy on VPS
echo "🔧 Step 2: Building and deploying Docker containers on VPS..."
echo ""

ssh -t "$VPS_HOST" << 'ENDSSH'
cd /root/stepperslife-v2-docker

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Current Docker status:"
docker compose ps
echo ""

echo "🛑 Stopping existing containers..."
docker compose down

echo ""
echo "🏗️  Building Docker images..."
docker compose build --no-cache

echo ""
echo "🚀 Starting containers..."
docker compose up -d

echo ""
echo "⏳ Waiting for containers to be healthy..."
sleep 10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Deployment Status:"
docker compose ps

echo ""
echo "📝 Recent logs:"
docker compose logs --tail=20

echo ""
echo "✅ Deployment complete!"
echo "🌐 Visit: https://events.stepperslife.com"

ENDSSH

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Docker deployment to VPS complete!"
echo "🌐 Your application is live at: https://events.stepperslife.com"
echo ""
echo "💡 Useful commands:"
echo "   • Check logs:    ssh $VPS_HOST 'cd $VPS_PATH && docker compose logs -f'"
echo "   • Restart:       ssh $VPS_HOST 'cd $VPS_PATH && docker compose restart'"
echo "   • Stop:          ssh $VPS_HOST 'cd $VPS_PATH && docker compose down'"
echo ""
