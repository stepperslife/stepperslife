#!/bin/bash

###############################################################################
# SteppersLife Automated Production Deployment (Non-Interactive)
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
# Deployment Steps
###############################################################################

show_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║        SteppersLife Production Deployment              ║"
    echo "║        Automated Docker Container Setup                ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

check_prerequisites() {
    log_step "Checking prerequisites"

    # Check sshpass
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass is not installed. Install with: brew install sshpass"
        exit 1
    fi

    # Check SSH connection
    log_info "Testing VPS connection..."
    if ! ssh_vps "echo 'Connection OK'" &>/dev/null; then
        log_error "Cannot connect to VPS at $VPS_USER@$VPS_HOST"
        exit 1
    fi

    log_success "Prerequisites checked"
}

git_commit_and_push() {
    log_step "Committing and pushing to repository"

    # Check if there are changes
    if [ -z "$(git status --porcelain)" ]; then
        log_info "No changes to commit"
    else
        log_info "Staging all changes..."
        git add deploy-now.sh docker-compose.production.simple.yml .env.production

        local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
        local commit_msg="Production deployment: $timestamp"

        log_info "Creating commit..."
        git commit -m "$commit_msg" || true

        log_success "Changes committed"
    fi

    log_info "Pushing to $GIT_REMOTE/$GIT_BRANCH..."
    git push $GIT_REMOTE $GIT_BRANCH || log_warning "Nothing to push or push failed"

    log_success "Repository synchronized"
}

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
                git remote add origin https://github.com/iradwatkins/stepperslife.git || true
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

build_and_deploy() {
    log_step "Building and deploying Docker containers"

    ssh_vps << EOF
        cd $VPS_PATH

        # Stop existing containers
        echo "Stopping existing containers..."
        docker-compose -f $COMPOSE_FILE down 2>/dev/null || true

        # Remove old images
        echo "Cleaning up old images..."
        docker system prune -f || true

        # Build new images
        echo "Building Docker images..."
        docker-compose -f $COMPOSE_FILE build --no-cache

        # Start services
        echo "Starting services..."
        docker-compose -f $COMPOSE_FILE up -d

        # Wait for services
        echo "Waiting for services to start..."
        sleep 20

        # Show status
        echo ""
        echo "Container status:"
        docker-compose -f $COMPOSE_FILE ps
EOF

    log_success "Containers deployed"
}

check_health() {
    log_step "Checking application health"

    log_info "Checking container status..."
    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE ps"

    log_info "Checking logs for errors..."
    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE logs --tail=50 events-app"
}

show_summary() {
    local duration=$1

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║            🎉  DEPLOYMENT COMPLETE! 🎉                 ║${NC}"
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
    echo -e "  • URL: ${GREEN}http://$VPS_HOST:3004${NC}"
    echo -e "  • Health: ${GREEN}http://$VPS_HOST:3004/health${NC}"
    echo ""
    echo -e "${CYAN}Monitor deployment:${NC}"
    echo -e "  • View logs: ${YELLOW}ssh root@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE logs -f'${NC}"
    echo -e "  • Check status: ${YELLOW}ssh root@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE ps'${NC}"
    echo ""
}

###############################################################################
# Main
###############################################################################

main() {
    local start_time=$(date +%s)

    show_banner

    log_info "Starting automated deployment..."
    log_info "VPS: ${BLUE}$VPS_USER@$VPS_HOST${NC}"
    log_info "Path: ${BLUE}$VPS_PATH${NC}"
    echo ""

    # Execute all deployment steps
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
}

# Handle interruption
trap 'echo -e "\n${RED}Deployment interrupted!${NC}"; exit 1' INT TERM

# Run deployment
main "$@"
