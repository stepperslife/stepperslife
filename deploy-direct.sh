#!/bin/bash

###############################################################################
# SteppersLife Direct VPS Deployment
# Pushes code directly to VPS via rsync, then builds Docker containers
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
VPS_HOST="72.60.28.175"
VPS_USER="root"
VPS_PASSWORD="Bobby321&Gloria321Watkins?"
VPS_PATH="/root/stepperslife"
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

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_step() {
    echo -e "\n${BLUE}==>${NC} ${CYAN}$1${NC}\n"
}

ssh_vps() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST "$@"
}

###############################################################################
# Deployment
###############################################################################

show_banner() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║        SteppersLife Direct VPS Deployment              ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
}

check_prerequisites() {
    log_step "Checking prerequisites"

    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass is not installed. Install with: brew install sshpass"
        exit 1
    fi

    if ! command -v rsync &> /dev/null; then
        log_error "rsync is not installed"
        exit 1
    fi

    log_success "Prerequisites OK"
}

create_vps_directory() {
    log_step "Creating VPS directory"

    ssh_vps "mkdir -p $VPS_PATH"

    log_success "VPS directory ready"
}

sync_code_to_vps() {
    log_step "Syncing code to VPS"

    log_info "Uploading project files..."

    sshpass -p "$VPS_PASSWORD" rsync -avz --delete \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.next' \
        --exclude '.claude' \
        --exclude 'AAA Ira' \
        --exclude '*.log' \
        --exclude '.DS_Store' \
        --exclude 'STORES-STEPPERSLIFE-BACKUP-*' \
        -e "ssh -o StrictHostKeyChecking=no" \
        ./ $VPS_USER@$VPS_HOST:$VPS_PATH/

    log_success "Code synced to VPS"
}

copy_env_file() {
    log_step "Setting up environment"

    if [ ! -f ".env.production" ]; then
        log_error ".env.production not found!"
        exit 1
    fi

    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no \
        .env.production $VPS_USER@$VPS_HOST:$VPS_PATH/.env

    log_success "Environment configured"
}

setup_docker() {
    log_step "Setting up Docker"

    ssh_vps << 'EOF'
        # Install Docker if needed
        if ! command -v docker &> /dev/null; then
            echo "Installing Docker..."
            curl -fsSL https://get.docker.com | sh
        fi

        # Install Docker Compose if needed
        if ! command -v docker-compose &> /dev/null; then
            echo "Installing Docker Compose..."
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi

        echo "Docker: $(docker --version)"
        echo "Compose: $(docker-compose --version)"
EOF

    log_success "Docker ready"
}

build_and_deploy() {
    log_step "Building and deploying containers"

    log_info "Stopping existing containers..."
    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE down 2>/dev/null || true"

    log_info "Building Docker images..."
    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE build --no-cache"

    log_info "Starting containers..."
    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE up -d"

    log_info "Waiting for containers to start..."
    sleep 15

    log_success "Containers deployed"
}

check_status() {
    log_step "Checking deployment status"

    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE ps"

    echo ""
    log_info "Checking logs..."
    ssh_vps "cd $VPS_PATH && docker-compose -f $COMPOSE_FILE logs --tail=20"
}

show_summary() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║            🎉  DEPLOYMENT COMPLETE! 🎉                 ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Application Access:${NC}"
    echo -e "  • URL: ${GREEN}http://$VPS_HOST:3004${NC}"
    echo -e "  • Health: ${GREEN}http://$VPS_HOST:3004/health${NC}"
    echo ""
    echo -e "${CYAN}Management Commands:${NC}"
    echo -e "  • Logs: ${YELLOW}ssh root@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE logs -f'${NC}"
    echo -e "  • Status: ${YELLOW}ssh root@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE ps'${NC}"
    echo -e "  • Restart: ${YELLOW}ssh root@$VPS_HOST 'cd $VPS_PATH && docker-compose -f $COMPOSE_FILE restart'${NC}"
    echo ""
}

###############################################################################
# Main
###############################################################################

main() {
    show_banner

    check_prerequisites
    create_vps_directory
    sync_code_to_vps
    copy_env_file
    setup_docker
    build_and_deploy
    check_status
    show_summary
}

# Handle interruption
trap 'echo -e "\n${RED}Deployment interrupted!${NC}"; exit 1' INT TERM

# Run
main "$@"
