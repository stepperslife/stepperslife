#!/bin/bash

###############################################################################
# SteppersLife Events - Docker Production Deployment Script
###############################################################################
#
# This script handles deployment of the SteppersLife Events platform to
# production using Docker containers.
#
# Usage:
#   ./deploy-docker-production.sh [options]
#
# Options:
#   --first-time    First-time deployment (setup SSL, create directories)
#   --update        Update existing deployment (rebuild containers)
#   --ssl-renew     Renew SSL certificates only
#   --rollback      Rollback to previous version
#   --logs          Show container logs
#   --status        Show deployment status
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="72.60.28.175"
VPS_USER="root"
VPS_PATH="/root/stepperslife-v2-docker"
DOMAIN="stepperslife.com"
OLD_DOMAIN="events.stepperslife.com"
ADMIN_EMAIL="admin@stepperslife.com"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if .env.production exists
check_env_file() {
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found!"
        print_info "Please create .env.production from .env.production.template"
        exit 1
    fi
}

# First-time deployment
first_time_deployment() {
    print_header "FIRST-TIME PRODUCTION DEPLOYMENT"

    print_info "This will perform a complete first-time deployment to VPS"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_warning "Deployment cancelled"
        exit 0
    fi

    check_env_file

    print_info "Step 1: Creating directory structure on VPS..."
    ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${VPS_PATH}/data/{stepfiles,ssl} && mkdir -p ${VPS_PATH}/logs/{app,nginx}"
    print_success "Directories created"

    print_info "Step 2: Copying project files to VPS..."
    rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
        --exclude 'data' --exclude 'logs' \
        ./ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/
    print_success "Files copied"

    print_info "Step 3: Building Docker containers on VPS..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml build"
    print_success "Containers built"

    print_info "Step 4: Starting containers (HTTP only, before SSL)..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml up -d events-app"
    print_success "Application container started"

    print_info "Step 5: Setting up SSL certificates..."
    print_warning "Temporarily starting Nginx for SSL certificate validation..."

    # Start Nginx temporarily without SSL redirect
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml up -d nginx"

    print_info "Obtaining SSL certificate from Let's Encrypt..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml run --rm certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} --email ${ADMIN_EMAIL} --agree-tos --non-interactive"

    if [ $? -eq 0 ]; then
        print_success "SSL certificates obtained successfully"
    else
        print_error "Failed to obtain SSL certificates"
        print_info "You may need to manually run: docker-compose -f docker-compose.production.yml run --rm certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} --email ${ADMIN_EMAIL} --agree-tos"
        exit 1
    fi

    print_info "Step 6: Restarting Nginx with SSL enabled..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml restart nginx"
    print_success "Nginx restarted with SSL"

    print_info "Step 7: Starting Certbot for automatic renewal..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml up -d certbot"
    print_success "Certbot auto-renewal enabled"

    print_header "DEPLOYMENT COMPLETE"
    print_success "SteppersLife Events is now live at https://${DOMAIN}"
    print_info "Run './deploy-docker-production.sh --status' to check deployment status"
}

# Update existing deployment
update_deployment() {
    print_header "UPDATING PRODUCTION DEPLOYMENT"

    print_warning "This will rebuild and restart all containers"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_warning "Update cancelled"
        exit 0
    fi

    check_env_file

    print_info "Step 1: Copying updated files to VPS..."
    rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
        --exclude 'data' --exclude 'logs' \
        ./ ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/
    print_success "Files updated"

    print_info "Step 2: Rebuilding Docker containers..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml build --no-cache"
    print_success "Containers rebuilt"

    print_info "Step 3: Restarting containers with zero-downtime..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml up -d --force-recreate"
    print_success "Containers restarted"

    print_info "Step 4: Checking health status..."
    sleep 10
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml ps"

    print_header "UPDATE COMPLETE"
    print_success "Production deployment updated successfully"
}

# Renew SSL certificates
renew_ssl() {
    print_header "RENEWING SSL CERTIFICATES"

    print_info "Running Certbot renewal..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml exec certbot certbot renew"

    if [ $? -eq 0 ]; then
        print_success "SSL certificates renewed"
        print_info "Reloading Nginx..."
        ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml exec nginx nginx -s reload"
        print_success "Nginx reloaded"
    else
        print_warning "No certificates were due for renewal"
    fi
}

# Show deployment status
show_status() {
    print_header "DEPLOYMENT STATUS"

    print_info "Container status:"
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml ps"

    echo ""
    print_info "Health checks:"
    ssh ${VPS_USER}@${VPS_HOST} "curl -s http://localhost/health || echo 'Health check failed'"

    echo ""
    print_info "SSL certificate status:"
    ssh ${VPS_USER}@${VPS_HOST} "docker-compose -f ${VPS_PATH}/docker-compose.production.yml exec certbot certbot certificates"

    echo ""
    print_info "Disk usage:"
    ssh ${VPS_USER}@${VPS_HOST} "df -h ${VPS_PATH}"

    echo ""
    print_info "Recent logs (last 20 lines):"
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml logs --tail=20"
}

# Show container logs
show_logs() {
    print_header "CONTAINER LOGS"

    print_info "Showing logs (press Ctrl+C to exit)..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml logs -f"
}

# Rollback deployment
rollback_deployment() {
    print_header "ROLLBACK DEPLOYMENT"

    print_error "⚠️  WARNING: This will rollback to the previous version"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        print_warning "Rollback cancelled"
        exit 0
    fi

    print_info "Rolling back Git repository..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && git reset --hard HEAD~1"

    print_info "Rebuilding previous version..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml build"

    print_info "Restarting containers..."
    ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && docker-compose -f docker-compose.production.yml up -d --force-recreate"

    print_success "Rollback complete"
}

# Main script logic
case "${1}" in
    --first-time)
        first_time_deployment
        ;;
    --update)
        update_deployment
        ;;
    --ssl-renew)
        renew_ssl
        ;;
    --rollback)
        rollback_deployment
        ;;
    --logs)
        show_logs
        ;;
    --status)
        show_status
        ;;
    *)
        print_header "STEPPERSLIFE DOCKER DEPLOYMENT"
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --first-time    First-time deployment (setup SSL, create directories)"
        echo "  --update        Update existing deployment (rebuild containers)"
        echo "  --ssl-renew     Renew SSL certificates only"
        echo "  --rollback      Rollback to previous version"
        echo "  --logs          Show container logs"
        echo "  --status        Show deployment status"
        echo ""
        echo "Examples:"
        echo "  $0 --first-time   # Initial deployment"
        echo "  $0 --update       # Deploy updates"
        echo "  $0 --status       # Check status"
        echo ""
        exit 1
        ;;
esac
