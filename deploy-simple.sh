#!/bin/bash

###############################################################################
# SteppersLife Simple Production Deployment
# Single container deployment with minimal downtime
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
VPS_PASSWORD="Bobby321&Gloria321Watkins?"
VPS_PATH="/root/stepperslife"
GIT_REMOTE="origin"
GIT_BRANCH="main"
COMPOSE_FILE="docker-compose.production.simple.yml"

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

# SSH wrapper using sshpass
ssh_vps() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "$@"
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

    # Check sshpass
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass is not installed. Install with: brew install sshpass"
        exit 1
    fi

    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "You have uncommitted changes - they will be committed"
    fi

    # Check SSH connection
    log_info "Testing VPS connection..."
    if ! ssh_vps "echo 'Connection OK'" &>/dev/null; then
        log_error "Cannot connect to VPS at $VPS_USER@$VPS_HOST"
        exit 1
    fi

    log_success "Prerequisites checked"
}

###############################################################################
# Git Operations
###############################################################################

git_commit_and_push() {
    log_step "Committing and pushing to repository"

    # Check if there are changes
    if [ -z "$(git status --porcelain)" ]; then
        log_info "No changes to commit"
    else
        log_info "Staging all changes..."
        git add -A

        local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
        local commit_msg="Production deployment: $timestamp"

        log_info "Creating commit..."
        git commit -m "$commit_msg"

        log_success "Changes committed"
    fi

    log_info "Pushing to $GIT_REMOTE/$GIT_BRANCH..."
    git push $GIT_REMOTE $GIT_BRANCH

    log_success "Code pushed to repository"
}

###############################################################################
# VPS Operations
###############################################################################

setup_vps_environment() {
    log_step "Setting up VPS environment"

    ssh_vps << 'EOF'
        # Install Docker if not present
        if ! command -v docker &> /dev/null; then
            echo "Installing Docker..."
            curl -fsSL https://get.docker.com | sh
            systemctl enable docker
            systemctl start docker
        fi

        # Install Docker Compose if not present
        if ! command -v docker-compose &> /dev/null; then
            echo "Installing Docker Compose..."
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi

        echo "Docker version: $(docker --version)"
        echo "Docker Compose version: $(docker-compose --version)"
EOF

    log_success "VPS environment ready"
}

setup_vps_git_repo() {
    log_step "Setting up VPS git repository"

    ssh_vps << EOF
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

    ssh_vps << EOF
        cd $VPS_PATH

        echo "Fetching latest changes..."
        git fetch origin

        echo "Pulling $GIT_BRANCH branch..."
        git checkout $GIT_BRANCH
        git reset --hard origin/$GIT_BRANCH

        echo "Current commit:"
        git log -1 --oneline
EOF

    log_success "Latest code pulled on VPS"
}

copy_env_file() {
    log_step "Copying environment file to VPS"

    log_info "Checking for .env.production file..."
    if [ ! -f ".env.production" ]; then
        log_error ".env.production file not found!"
        exit 1
    fi

    log_info "Copying .env.production to VPS..."
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no .env.production $VPS_USER@$VPS_HOST:$VPS_PATH/.env

    log_success "Environment file copied"
}

###############################################################################
# Docker Operations
###############################################################################

build_and_deploy() {
    log_step "Building and deploying Docker containers"

    ssh_vps << EOF
        cd $VPS_PATH

        # Stop existing containers
        echo "Stopping existing containers..."
        docker-compose -f $COMPOSE_FILE down || true

        # Remove old images to force rebuild
        echo "Removing old images..."
        docker-compose -f $COMPOSE_FILE rm -f || true

        # Build new images
        echo "Building Docker images (this may take a few minutes)..."
        docker-compose -f $COMPOSE_FILE build --no-cache

        # Start services
        echo "Starting services..."
        docker-compose -f $COMPOSE_FILE up -d

        # Wait for services to be ready
        echo "Waiting for services to start..."
        sleep 15

        # Show status
        echo ""
        echo "Container status:"
        docker-compose -f $COMPOSE_FILE ps
EOF

    log_success "Containers deployed"
}

check_health() {
    log_step "Checking application health"

    log_info "Waiting for application to be ready..."
    sleep 10

    log_info "Checking container status..."
    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE ps"

    log_info "Checking application endpoint..."
    local health_status=$(ssh_vps "curl -sf http://localhost:3004/health 2>&1 || echo 'WAITING'")

    if [[ "$health_status" == *"WAITING"* ]]; then
        log_warning "Application is still starting up..."
        log_info "Check logs with: ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE logs -f'"
    else
        log_success "Application is responding"
    fi
}

show_logs() {
    log_step "Recent container logs"

    ssh_vps << EOF
        cd $VPS_PATH
        echo "=== Events Application Logs ==="
        docker-compose -f $COMPOSE_FILE logs --tail=30 events-app

        echo ""
        echo "=== Nginx Logs ==="
        docker-compose -f $COMPOSE_FILE logs --tail=20 nginx
EOF
}

###############################################################################
# Main Deployment Flow
###############################################################################

show_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║        SteppersLife Production Deployment              ║"
    echo "║        Simple Docker Container Setup                   ║"
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
    echo -e "  • Application: ${GREEN}SteppersLife Events${NC}"
    echo -e "  • Duration: ${GREEN}${duration}s${NC}"
    echo ""
    echo -e "${CYAN}Access your application:${NC}"
    echo -e "  • Public URL: ${GREEN}http://$VPS_HOST:3004${NC}"
    echo -e "  • Health Check: ${GREEN}http://$VPS_HOST:3004/health${NC}"
    echo ""
    echo -e "${CYAN}Useful commands:${NC}"
    echo -e "  • View logs: ${YELLOW}ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE logs -f'${NC}"
    echo -e "  • Container status: ${YELLOW}ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE ps'${NC}"
    echo -e "  • Restart: ${YELLOW}ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE restart'${NC}"
    echo -e "  • Stop: ${YELLOW}ssh $VPS_USER@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE down'${NC}"
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
    setup_vps_environment
    setup_vps_git_repo
    pull_latest_code
    copy_env_file
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
    echo "SteppersLife Simple Production Deployment"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --logs              Show container logs after deployment"
    echo "  --status            Show container status only"
    echo ""
    echo "Environment Variables:"
    echo "  VPS_HOST            VPS IP address (default: 72.60.28.175)"
    echo "  VPS_USER            VPS SSH user (default: root)"
    echo ""
    echo "Examples:"
    echo "  $0                  # Normal deployment"
    echo "  $0 --logs           # Deploy and show logs"
    echo "  $0 --status         # Check deployment status"
    echo ""
    exit 0
fi

# Handle --status flag
if [ "$1" = "--status" ]; then
    log_step "Checking deployment status"
    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE ps"
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
