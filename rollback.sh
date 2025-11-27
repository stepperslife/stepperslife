#!/bin/bash

# SteppersLife Blue/Green Rollback Script
# Quickly switch back to previous environment

set -e  # Exit on error

# ============================================================================
# CONFIGURATION
# ============================================================================

# Load from .env if exists
if [ -f .env.deployment ]; then
    source .env.deployment
fi

# VPS Configuration
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-your-vps-ip}"
VPS_DIR="${VPS_DIR:-/var/www/stepperlife}"
VPS_PORT="${VPS_PORT:-22}"

# Application Configuration
APP_NAME="stepperlife"

# ============================================================================
# COLOR OUTPUT
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}==>${NC} ${CYAN}$1${NC}\n"
}

# ============================================================================
# ROLLBACK FUNCTIONS
# ============================================================================

get_current_env() {
    local current=$(ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cat $VPS_DIR/current-env 2>/dev/null || echo 'unknown'")
    echo "$current"
}

get_previous_env() {
    local current=$1
    if [ "$current" = "blue" ]; then
        echo "green"
    elif [ "$current" = "green" ]; then
        echo "blue"
    else
        echo "unknown"
    fi
}

check_container_status() {
    local env=$1
    local container_name="${APP_NAME}-${env}"

    local status=$(ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "docker ps -a --filter name=^${container_name}$ --format '{{.Status}}'")

    if [ -z "$status" ]; then
        echo "not_found"
    elif echo "$status" | grep -q "Up"; then
        echo "running"
    else
        echo "stopped"
    fi
}

start_container() {
    local env=$1
    local container_name="${APP_NAME}-${env}"

    log_info "Starting container: $container_name"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "docker start $container_name"

    if [ $? -ne 0 ]; then
        log_error "Failed to start container"
        return 1
    fi

    log_success "Container started"

    # Wait for container to be healthy
    log_info "Waiting for container to be healthy..."
    sleep 5
}

switch_nginx() {
    local env=$1

    log_step "Switching nginx to $env environment"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
        # Update upstream configuration
        echo "set \\\$active_env $env;" > /etc/nginx/conf.d/active-env.conf

        # Update current environment marker
        echo "$env" > $VPS_DIR/current-env

        # Test nginx configuration
        nginx -t

        if [ \$? -ne 0 ]; then
            echo "Nginx configuration test failed"
            exit 1
        fi

        # Reload nginx
        nginx -s reload
EOF

    if [ $? -ne 0 ]; then
        log_error "Failed to switch nginx"
        return 1
    fi

    log_success "Nginx switched to $env"
}

# ============================================================================
# MAIN ROLLBACK FLOW
# ============================================================================

main() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║         SteppersLife Rollback Script                   ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    # Check VPS connectivity
    log_step "Checking VPS connection"

    if ! ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "echo 'Connected'" &>/dev/null; then
        log_error "Cannot connect to VPS at $VPS_USER@$VPS_HOST"
        exit 1
    fi

    log_success "VPS connection verified"

    # Detect current environment
    local current_env=$(get_current_env)

    if [ "$current_env" = "unknown" ]; then
        log_error "Cannot determine current active environment"
        exit 1
    fi

    local previous_env=$(get_previous_env $current_env)

    log_info "Current active environment: ${BLUE}$current_env${NC}"
    log_info "Will rollback to environment: ${GREEN}$previous_env${NC}"

    # Check previous container status
    local prev_status=$(check_container_status $previous_env)

    log_info "Previous container status: $prev_status"

    echo ""
    log_warning "This will switch traffic from $current_env to $previous_env"
    read -p "$(echo -e ${YELLOW}Continue with rollback? [y/N]:${NC} )" -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Rollback cancelled"
        exit 0
    fi

    # Start previous container if not running
    if [ "$prev_status" = "stopped" ]; then
        log_step "Previous container is stopped, starting it..."
        start_container $previous_env
    elif [ "$prev_status" = "not_found" ]; then
        log_error "Previous container not found! Cannot rollback."
        log_error "You may need to redeploy."
        exit 1
    else
        log_success "Previous container is already running"
    fi

    # Switch nginx traffic
    switch_nginx $previous_env

    # Stop current (now old) container
    log_step "Stopping current container"

    log_info "Waiting 10 seconds for connections to drain..."
    sleep 10

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "docker stop ${APP_NAME}-${current_env} 2>/dev/null || true"

    log_success "Container stopped: ${APP_NAME}-${current_env}"

    # Success message
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║            ✓  ROLLBACK SUCCESSFUL! ✓                   ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Rollback Summary:${NC}"
    echo -e "  • Rolled back from: ${RED}$current_env${NC}"
    echo -e "  • Active environment: ${GREEN}$previous_env${NC}"
    echo -e "  • Container: ${GREEN}${APP_NAME}-${previous_env}${NC}"
    echo -e "  • Status: ${GREEN}ACTIVE${NC}"
    echo ""
    echo -e "${CYAN}Access your application:${NC}"
    echo -e "  • https://stepperslife.com"
    echo ""
}

# ============================================================================
# SCRIPT ENTRY POINT
# ============================================================================

# Handle script interruption
trap 'echo -e "\n${RED}Rollback interrupted!${NC}"; exit 1' INT TERM

# Run main rollback
main "$@"
