#!/bin/bash

###############################################################################
# SteppersLife Multi-Module VPS Deployment Script
# Deploys: Events + Store modules
# Method: Git push → VPS pull → Docker rebuild
# Downtime: ~30-60 seconds (simple direct deployment)
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
VPS_HOST="${VPS_HOST:-72.60.28.175}"
VPS_USER="${VPS_USER:-root}"
VPS_PATH="/root/stepperslife"
GIT_REMOTE="origin"
GIT_BRANCH="main"
COMPOSE_FILE="docker-compose.blue-green.yml"

# Services to deploy
SERVICES=("events-blue" "events-nginx" "postgres" "redis" "minio" "store-blue")

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}==>${NC} ${CYAN}$1${NC}\n"
}

###############################################################################
# Pre-flight Checks
###############################################################################

check_prerequisites() {
    log_step "Checking prerequisites"

    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "You have uncommitted changes"
    fi

    # Check SSH connection
    if ! ssh -o ConnectTimeout=5 $VPS_USER@$VPS_HOST "echo 'Connection OK'" &>/dev/null; then
        log_error "Cannot connect to VPS at $VPS_USER@$VPS_HOST"
        log_info "Make sure SSH is configured and VPS is accessible"
        exit 1
    fi

    log_success "Prerequisites checked"
}

###############################################################################
# Git Operations
###############################################################################

git_commit_and_push() {
    log_step "Committing and pushing to GitHub"

    # Check if there are changes
    if [ -z "$(git status --porcelain)" ]; then
        log_info "No changes to commit"
    else
        log_info "Staging all changes..."
        git add -A

        local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
        local commit_msg="Deploy to VPS: $timestamp"

        log_info "Creating commit..."
        git commit -m "$commit_msg"

        log_success "Changes committed"
    fi

    log_info "Pushing to $GIT_REMOTE/$GIT_BRANCH..."
    git push $GIT_REMOTE $GIT_BRANCH

    log_success "Code pushed to GitHub"
}

###############################################################################
# VPS Operations
###############################################################################

setup_vps_git_repo() {
    log_step "Setting up VPS git repository"

    ssh $VPS_USER@$VPS_HOST << EOF
        # Create directory if it doesn't exist
        if [ ! -d "$VPS_PATH" ]; then
            echo "Creating directory: $VPS_PATH"
            mkdir -p $VPS_PATH
            cd $VPS_PATH

            echo "Cloning repository..."
            git clone https://github.com/iradwatkins/stepperslife.git .
        else
            echo "Directory exists: $VPS_PATH"
            cd $VPS_PATH

            # Check if it's a git repo
            if [ ! -d ".git" ]; then
                echo "Initializing git repository..."
                git init
                git remote add origin https://github.com/iradwatkins/stepperslife.git
                git fetch origin
                git checkout -b main origin/main
            fi
        fi

        echo "Git repository ready"
EOF

    log_success "VPS git repository configured"
}

pull_latest_code() {
    log_step "Pulling latest code on VPS"

    ssh $VPS_USER@$VPS_HOST << EOF
        cd $VPS_PATH

        echo "Fetching latest changes..."
        git fetch origin

        echo "Pulling $GIT_BRANCH branch..."
        git checkout $GIT_BRANCH
        git pull origin $GIT_BRANCH

        echo "Current commit:"
        git log -1 --oneline
EOF

    log_success "Latest code pulled on VPS"
}

###############################################################################
# Docker Operations
###############################################################################

build_and_deploy() {
    log_step "Building and deploying containers"

    log_warning "Stopping existing containers..."

    ssh $VPS_USER@$VPS_HOST << EOF
        cd $VPS_PATH

        # Stop containers (allow failure if not running)
        echo "Stopping containers..."
        docker-compose -f $COMPOSE_FILE down || true

        # Build images
        echo "Building Docker images..."
        docker-compose -f $COMPOSE_FILE build --no-cache events-blue store-blue

        # Start services
        echo "Starting services..."
        docker-compose -f $COMPOSE_FILE up -d

        # Wait for services to be ready
        echo "Waiting for services to start..."
        sleep 10

        # Show status
        echo ""
        echo "Container status:"
        docker-compose -f $COMPOSE_FILE ps
EOF

    log_success "Containers deployed"
}

check_health() {
    log_step "Checking application health"

    log_info "Waiting for applications to be ready..."
    sleep 5

    # Check events module
    log_info "Checking events module..."
    local events_health=$(ssh $VPS_USER@$VPS_HOST "curl -sf http://localhost:3001/health || echo 'FAILED'")

    if [ "$events_health" != "FAILED" ]; then
        log_success "Events module is healthy"
    else
        log_warning "Events module health check failed (might still be starting)"
    fi

    # Check store module
    log_info "Checking store module..."
    local store_health=$(ssh $VPS_USER@$VPS_HOST "curl -sf http://localhost:3005/health || echo 'FAILED'")

    if [ "$store_health" != "FAILED" ]; then
        log_success "Store module is healthy"
    else
        log_warning "Store module health check failed (might still be starting)"
    fi
}

show_logs() {
    log_step "Recent container logs"

    ssh $VPS_USER@$VPS_HOST << EOF
        cd $VPS_PATH
        echo "=== Events Module Logs ==="
        docker-compose -f $COMPOSE_FILE logs --tail=20 events-blue

        echo ""
        echo "=== Store Module Logs ==="
        docker-compose -f $COMPOSE_FILE logs --tail=20 store-blue
EOF
}

###############################################################################
# Main Deployment Flow
###############################################################################

show_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║    SteppersLife Multi-Module VPS Deployment            ║"
    echo "║    Events + Store Modules                              ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

show_summary() {
    local duration=$1

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║            🎉  DEPLOYMENT SUCCESSFUL! 🎉               ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Deployment Summary:${NC}"
    echo -e "  • VPS Host: ${GREEN}$VPS_HOST${NC}"
    echo -e "  • VPS Path: ${GREEN}$VPS_PATH${NC}"
    echo -e "  • Modules Deployed: ${GREEN}Events + Store${NC}"
    echo -e "  • Duration: ${GREEN}${duration}s${NC}"
    echo ""
    echo -e "${CYAN}Access your applications:${NC}"
    echo -e "  • Events: ${GREEN}https://events.stepperslife.com${NC} or ${GREEN}https://stepperslife.com/events${NC}"
    echo -e "  • Store: ${GREEN}https://stepperslife.com/store${NC}"
    echo ""
    echo -e "${CYAN}Useful commands:${NC}"
    echo -e "  • View logs: ${YELLOW}ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE logs -f'${NC}"
    echo -e "  • Container status: ${YELLOW}ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE ps'${NC}"
    echo -e "  • Restart services: ${YELLOW}ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE restart'${NC}"
    echo ""
}

main() {
    local start_time=$(date +%s)

    show_banner

    log_info "VPS: ${BLUE}$VPS_USER@$VPS_HOST${NC}"
    log_info "Path: ${BLUE}$VPS_PATH${NC}"
    log_info "Branch: ${BLUE}$GIT_BRANCH${NC}"
    echo ""

    read -p "$(echo -e ${YELLOW}Continue with deployment? [y/N]:${NC} )" -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Deployment cancelled"
        exit 0
    fi

    # Execute deployment steps
    check_prerequisites
    git_commit_and_push
    setup_vps_git_repo
    pull_latest_code
    build_and_deploy
    check_health

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    show_summary $duration

    # Optionally show logs
    echo ""
    read -p "$(echo -e ${YELLOW}View recent logs? [y/N]:${NC} )" -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        show_logs
    fi
}

###############################################################################
# Script Entry Point
###############################################################################

# Handle interruption
trap 'echo -e "\n${RED}Deployment interrupted!${NC}"; exit 1' INT TERM

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "SteppersLife Multi-Module VPS Deployment"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --logs              Show container logs after deployment"
    echo "  --no-push           Skip git push (pull only on VPS)"
    echo ""
    echo "Environment Variables:"
    echo "  VPS_HOST            VPS IP address (default: 72.60.28.175)"
    echo "  VPS_USER            VPS SSH user (default: root)"
    echo ""
    echo "Examples:"
    echo "  $0                  # Normal deployment"
    echo "  $0 --logs           # Deploy and show logs"
    echo "  $0 --no-push        # Deploy without pushing to GitHub"
    echo ""
    exit 0
fi

# Handle --no-push flag
if [ "$1" = "--no-push" ]; then
    log_warning "Skipping git push (--no-push flag)"
    check_prerequisites
    setup_vps_git_repo
    pull_latest_code
    build_and_deploy
    check_health
    exit 0
fi

# Handle --logs flag
if [ "$1" = "--logs" ]; then
    main
    show_logs
    exit 0
fi

# Run main deployment
main "$@"
