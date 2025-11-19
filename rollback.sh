#!/bin/bash

###############################################################################
# Rollback to Previous Environment
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
VPS_HOST="72.60.28.175"
VPS_USER="root"
VPS_PATH="/root/stepperslife-v2-docker"

echo -e "${BLUE}Checking current active environment...${NC}"

# Check current upstream
CURRENT=$(ssh ${VPS_USER}@${VPS_HOST} "grep -o 'events-[a-z]*' ${VPS_PATH}/nginx/conf.d/upstream.conf | head -1")

if [ "$CURRENT" == "events-blue" ]; then
    TARGET="green"
    TARGET_PORT="3002"
    echo -e "${YELLOW}Current: BLUE (port 3001)${NC}"
    echo -e "${YELLOW}Rollback target: GREEN (port 3002)${NC}"
elif [ "$CURRENT" == "events-green" ]; then
    TARGET="blue"
    TARGET_PORT="3001"
    echo -e "${YELLOW}Current: GREEN (port 3002)${NC}"
    echo -e "${YELLOW}Rollback target: BLUE (port 3001)${NC}"
else
    echo -e "${RED}Error: Could not determine current environment${NC}"
    exit 1
fi

echo ""
read -p "Rollback to ${TARGET^^} environment? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

echo -e "${BLUE}Rolling back to ${TARGET^^} environment...${NC}"

# Switch upstream
ssh ${VPS_USER}@${VPS_HOST} "cp ${VPS_PATH}/nginx/conf.d/upstream-${TARGET}.conf ${VPS_PATH}/nginx/conf.d/upstream.conf"

# Test and reload nginx
ssh ${VPS_USER}@${VPS_HOST} "docker exec events-nginx nginx -t && docker exec events-nginx nginx -s reload"

echo -e "${GREEN}Rollback complete!${NC}"
echo "Traffic is now being served by ${TARGET^^} environment on port ${TARGET_PORT}"
