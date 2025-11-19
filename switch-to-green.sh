#!/bin/bash

###############################################################################
# Switch Traffic to GREEN Environment
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Switching traffic to GREEN environment...${NC}"

# Configuration
VPS_HOST="72.60.28.175"
VPS_USER="root"
VPS_PATH="/root/stepperslife-v2-docker"

# Switch upstream to green
ssh ${VPS_USER}@${VPS_HOST} "cp ${VPS_PATH}/nginx/conf.d/upstream-green.conf ${VPS_PATH}/nginx/conf.d/upstream.conf"

# Test nginx configuration
ssh ${VPS_USER}@${VPS_HOST} "docker exec events-nginx nginx -t"

# Reload nginx
ssh ${VPS_USER}@${VPS_HOST} "docker exec events-nginx nginx -s reload"

echo -e "${GREEN}Traffic switched to GREEN environment successfully!${NC}"
echo ""
echo "Green environment is now serving traffic on port 3002"
echo "Blue environment is on standby on port 3001"
