#!/bin/bash

###############################################################################
# SteppersLife - Blue-Green Deployment Script
###############################################################################
#
# This script handles blue-green deployment for zero-downtime updates.
#
# Usage:
#   ./deploy-blue-green.sh [option]
#
# Options:
#   --first-time    First-time setup (create directories, get SSL certs)
#   --deploy-blue   Deploy new version to BLUE environment
#   --deploy-green  Deploy new version to GREEN environment
#   --switch-blue   Switch traffic to BLUE
#   --switch-green  Switch traffic to GREEN
#   --status        Show current deployment status
#   --logs          Show container logs
#   --rollback      Rollback to previous environment
#
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
DOMAIN="stepperslife.com"
OLD_DOMAIN="events.stepperslife.com"
ADMIN_EMAIL="admin@stepperslife.com"

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

check_env_file() {
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found!"
        exit 1
    fi
}

get_current_env() {
    CURRENT=$(ssh ${VPS_USER}@${VPS_HOST} "grep -o 'events-[a-z]*' ${VPS_PATH}/nginx/conf.d/upstream.conf 2>/dev/null | head -1" || echo "none")
    echo "$CURRENT"
}

# First-time setup
first_time_setup() {
    print_header "FIRST-TIME BLUE-GREEN SETUP"

    check_env_file

    print_info "Step 1: Creating directory structure..."
    ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${VPS_PATH}/data/{stepfiles,ssl} && mkdir -p ${VPS_PATH}/logs/{app-blue,app-green,nginx}"
    print_success "Directories created"

    print_info "Step 2: Copying project files..."
    rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
        --exclude 'data' --exclude 'logs' \
        ./ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/
    print_success "Files copied"

    print_info "Step 3: Building BLUE container..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml build events-blue"
    print_success "Blue container built"

    print_info "Step 4: Starting BLUE container..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml up -d events-blue"
    print_success "Blue container started"

    print_info "Step 5: Starting Nginx..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml up -d nginx"
    print_success "Nginx started"

    print_info "Step 6: Obtaining SSL certificates..."
    print_warning "Getting certificate for ${DOMAIN}..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml run --rm certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} -d www.${DOMAIN} --email ${ADMIN_EMAIL} --agree-tos --non-interactive"

    print_info "Step 7: Restarting Nginx with SSL..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml restart nginx"

    print_info "Step 8: Starting Certbot renewal service..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml up -d certbot"

    print_header "SETUP COMPLETE"
    print_success "SteppersLife is now live at https://${DOMAIN}/events"
    print_info "BLUE environment is active"
    print_info "Run './deploy-blue-green.sh --status' to check status"
}

# Deploy to specific environment
deploy_to_env() {
    local ENV=$1
    local OTHER_ENV=$([ "$ENV" == "blue" ] && echo "green" || echo "blue")

    print_header "DEPLOYING TO ${ENV^^} ENVIRONMENT"

    check_env_file

    CURRENT=$(get_current_env)
    if [ "$CURRENT" == "events-${ENV}" ]; then
        print_warning "${ENV^^} is currently ACTIVE! Traffic will be affected during build."
        read -p "Continue anyway? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_warning "Deployment cancelled"
            exit 0
        fi
    else
        print_info "Current active: ${CURRENT:-none}"
        print_info "Deploying to: ${ENV^^} (inactive)"
    fi

    print_info "Step 1: Copying files to VPS..."
    rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
        --exclude 'data' --exclude 'logs' \
        ./ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/
    print_success "Files copied"

    print_info "Step 2: Building ${ENV^^} container..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml build --no-cache events-${ENV}"
    print_success "${ENV^^} container built"

    print_info "Step 3: Starting ${ENV^^} container..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml up -d events-${ENV}"
    print_success "${ENV^^} container started"

    print_info "Step 4: Waiting for health check..."
    sleep 15

    # Check health
    PORT=$([ "$ENV" == "blue" ] && echo "3001" || echo "3002")
    HEALTH=$(ssh ${VPS_USER}@${VPS_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:${PORT}/events/api/health" || echo "000")

    if [ "$HEALTH" == "200" ]; then
        print_success "${ENV^^} environment is healthy!"
    else
        print_warning "Health check returned: ${HEALTH}"
        print_info "Container may still be starting up"
    fi

    print_header "DEPLOYMENT COMPLETE"
    print_success "New version deployed to ${ENV^^} environment"
    echo ""
    echo "Next steps:"
    echo "  1. Test the ${ENV^^} environment: http://VPS_IP:${PORT}/events"
    echo "  2. Switch traffic: ./deploy-blue-green.sh --switch-${ENV}"
}

# Switch traffic
switch_traffic() {
    local TARGET=$1

    print_header "SWITCHING TRAFFIC TO ${TARGET^^}"

    print_info "Updating upstream configuration..."
    ssh ${VPS_USER}@${VPS_HOST} "cp ${VPS_PATH}/nginx/conf.d/upstream-${TARGET}.conf ${VPS_PATH}/nginx/conf.d/upstream.conf"

    print_info "Testing nginx configuration..."
    ssh ${VPS_USER}@${VPS_HOST} "docker exec events-nginx nginx -t"

    print_info "Reloading nginx..."
    ssh ${VPS_USER}@${VPS_HOST} "docker exec events-nginx nginx -s reload"

    print_success "Traffic switched to ${TARGET^^} environment!"
}

# Show status
show_status() {
    print_header "DEPLOYMENT STATUS"

    CURRENT=$(get_current_env)
    echo "Active environment: ${CURRENT:-unknown}"
    echo ""

    print_info "Container status:"
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml ps"

    echo ""
    print_info "Health checks:"
    echo -n "  Blue (3001):  "
    ssh ${VPS_USER}@${VPS_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/events/api/health || echo 'N/A'"
    echo ""
    echo -n "  Green (3002): "
    ssh ${VPS_USER}@${VPS_HOST} "curl -s -o /dev/null -w '%{http_code}' http://localhost:3002/events/api/health || echo 'N/A'"
    echo ""
}

# Show logs
show_logs() {
    print_header "CONTAINER LOGS"
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.blue-green.yml logs -f --tail=100"
}

# Rollback
do_rollback() {
    CURRENT=$(get_current_env)

    if [ "$CURRENT" == "events-blue" ]; then
        switch_traffic "green"
    elif [ "$CURRENT" == "events-green" ]; then
        switch_traffic "blue"
    else
        print_error "Could not determine current environment"
        exit 1
    fi
}

# Main
case "${1}" in
    --first-time)
        first_time_setup
        ;;
    --deploy-blue)
        deploy_to_env "blue"
        ;;
    --deploy-green)
        deploy_to_env "green"
        ;;
    --switch-blue)
        switch_traffic "blue"
        ;;
    --switch-green)
        switch_traffic "green"
        ;;
    --status)
        show_status
        ;;
    --logs)
        show_logs
        ;;
    --rollback)
        do_rollback
        ;;
    *)
        print_header "STEPPERSLIFE BLUE-GREEN DEPLOYMENT"
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --first-time    First-time setup (SSL, directories)"
        echo "  --deploy-blue   Deploy to BLUE environment"
        echo "  --deploy-green  Deploy to GREEN environment"
        echo "  --switch-blue   Switch traffic to BLUE"
        echo "  --switch-green  Switch traffic to GREEN"
        echo "  --status        Show deployment status"
        echo "  --logs          Show container logs"
        echo "  --rollback      Quick rollback to other environment"
        echo ""
        echo "Typical workflow:"
        echo "  1. ./deploy-blue-green.sh --first-time    # Initial setup"
        echo "  2. ./deploy-blue-green.sh --deploy-green  # Deploy update to inactive env"
        echo "  3. ./deploy-blue-green.sh --switch-green  # Switch traffic"
        echo "  4. ./deploy-blue-green.sh --rollback      # Rollback if issues"
        echo ""
        exit 1
        ;;
esac
