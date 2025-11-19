#!/bin/bash

###############################################################################
# Switch Traffic to BLUE Environment
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Switching traffic to BLUE environment...${NC}"

# Configuration
VPS_HOST="72.60.28.175"
VPS_USER="root"
VPS_PATH="/root/stepperslife-v2-docker"

# Switch upstream to blue
ssh ${VPS_USER}@${VPS_HOST} "cp ${VPS_PATH}/nginx/conf.d/upstream-blue.conf ${VPS_PATH}/nginx/conf.d/upstream.conf"

# Test nginx configuration
ssh ${VPS_USER}@${VPS_HOST} "docker exec events-nginx nginx -t"

# Reload nginx
ssh ${VPS_USER}@${VPS_HOST} "docker exec events-nginx nginx -s reload"

echo -e "${GREEN}Traffic switched to BLUE environment successfully!${NC}"
echo ""
echo "Blue environment is now serving traffic on port 3001"
echo "Green environment is on standby on port 3002"
