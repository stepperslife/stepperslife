#!/bin/bash

# SteppersLife Blue/Green Deployment Script
# Automatically handles git commit, build, transfer, and zero-downtime deployment

set -e  # Exit on error

# ============================================================================
# CONFIGURATION - Update these variables or load from .env
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
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-main}"

# Docker Configuration
DOCKER_NETWORK="app-network"
BLUE_PORT=3001
GREEN_PORT=3002
CONTAINER_PORT=3000

# Health Check Configuration
HEALTH_ENDPOINT="/health"
HEALTH_TIMEOUT=30
HEALTH_RETRY_INTERVAL=2

# Deployment Configuration
GRACEFUL_SHUTDOWN_DELAY=30

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

show_progress() {
    local pid=$1
    local message=$2
    local spin='-\|/'
    local i=0

    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) %4 ))
        printf "\r${CYAN}[${spin:$i:1}]${NC} $message"
        sleep 0.1
    done
    printf "\r${GREEN}[✓]${NC} $message\n"
}

check_prerequisites() {
    log_step "Checking prerequisites"

    local missing_tools=()

    if ! command -v docker &> /dev/null; then
        missing_tools+=("docker")
    fi

    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi

    if ! command -v ssh &> /dev/null; then
        missing_tools+=("ssh")
    fi

    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi

    if [ ${#missing_tools[@]} -gt 0 ]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        exit 1
    fi

    log_success "All prerequisites satisfied"
}

validate_config() {
    log_step "Validating configuration"

    if [ "$VPS_HOST" = "your-vps-ip" ]; then
        log_error "VPS_HOST not configured. Please set it in .env.deployment"
        exit 1
    fi

    if [ ! -f "Dockerfile" ]; then
        log_error "Dockerfile not found in current directory"
        exit 1
    fi

    log_success "Configuration validated"
}

get_current_active_env() {
    log_info "Detecting current active environment..."

    local active_env=$(ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cat $VPS_DIR/current-env 2>/dev/null || echo 'green'")
    echo "$active_env"
}

get_next_env() {
    local current=$1
    if [ "$current" = "blue" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

# ============================================================================
# GIT OPERATIONS
# ============================================================================

git_commit_and_push() {
    log_step "Committing and pushing changes to Git"

    # Check if there are changes to commit
    if [ -z "$(git status --porcelain)" ]; then
        log_info "No changes to commit"
    else
        local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
        local commit_message="Deploy: $timestamp"

        log_info "Staging all changes..."
        git add -A

        log_info "Creating commit..."
        git commit -m "$commit_message"

        log_success "Changes committed"
    fi

    log_info "Pushing to $GIT_REMOTE/$GIT_BRANCH..."
    git push $GIT_REMOTE $GIT_BRANCH

    log_success "Changes pushed to remote"
}

# ============================================================================
# DOCKER OPERATIONS
# ============================================================================

build_docker_image() {
    local env=$1
    local image_tag="${APP_NAME}:${env}"

    log_step "Building Docker image: $image_tag"

    log_info "Building for linux/amd64 platform (VPS compatibility)..."
    docker build --platform linux/amd64 -t $image_tag . 2>&1 | while read line; do
        echo "  $line"
    done

    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        log_error "Docker build failed"
        exit 1
    fi

    log_success "Docker image built: $image_tag"
}

save_and_transfer_image() {
    local env=$1
    local image_tag="${APP_NAME}:${env}"
    local image_file="${APP_NAME}-${env}.tar"

    log_step "Transferring Docker image to VPS"

    log_info "Saving Docker image to file..."
    docker save $image_tag -o $image_file

    log_success "Image saved: $image_file"

    log_info "Transferring to VPS..."
    scp -P $VPS_PORT $image_file $VPS_USER@$VPS_HOST:$VPS_DIR/

    log_success "Image transferred"

    log_info "Cleaning up local image file..."
    rm $image_file

    log_success "Local cleanup complete"
}

load_image_on_vps() {
    local env=$1
    local image_file="${APP_NAME}-${env}.tar"

    log_step "Loading Docker image on VPS"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "cd $VPS_DIR && docker load -i $image_file && rm $image_file"

    log_success "Image loaded on VPS"
}

# ============================================================================
# DEPLOYMENT OPERATIONS
# ============================================================================

deploy_container() {
    local env=$1
    local port=$2
    local image_tag="${APP_NAME}:${env}"
    local container_name="${APP_NAME}-${env}"

    log_step "Deploying container: $container_name"

    # Stop and remove existing container if exists
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
        if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
            echo "Stopping existing container..."
            docker stop $container_name 2>/dev/null || true
            docker rm $container_name 2>/dev/null || true
        fi

        # Ensure network exists
        if ! docker network ls --format '{{.Name}}' | grep -q "^${DOCKER_NETWORK}$"; then
            echo "Creating Docker network: ${DOCKER_NETWORK}"
            docker network create ${DOCKER_NETWORK}
        fi

        # Start new container
        echo "Starting new container..."
        docker run -d \
            --name $container_name \
            --network $DOCKER_NETWORK \
            -p 127.0.0.1:${port}:${CONTAINER_PORT} \
            --restart unless-stopped \
            --env-file $VPS_DIR/.env \
            $image_tag
EOF

    if [ $? -ne 0 ]; then
        log_error "Failed to deploy container"
        return 1
    fi

    log_success "Container deployed: $container_name"
}

health_check() {
    local port=$1
    local env=$2

    log_step "Running health check for $env environment"

    log_info "Waiting for application to start..."
    sleep 5

    local elapsed=0
    local max_wait=$HEALTH_TIMEOUT

    while [ $elapsed -lt $max_wait ]; do
        log_info "Health check attempt $(($elapsed / $HEALTH_RETRY_INTERVAL + 1))..."

        local response=$(ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "curl -sf http://localhost:${port}${HEALTH_ENDPOINT}" 2>/dev/null)

        if [ $? -eq 0 ]; then
            log_success "Health check passed! Application is healthy"
            return 0
        fi

        sleep $HEALTH_RETRY_INTERVAL
        elapsed=$((elapsed + HEALTH_RETRY_INTERVAL))
    done

    log_error "Health check failed after ${HEALTH_TIMEOUT}s"
    return 1
}

switch_nginx_traffic() {
    local new_env=$1

    log_step "Switching nginx traffic to $new_env"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
        # Update upstream configuration
        echo "set \\\$active_env $new_env;" > /etc/nginx/conf.d/active-env.conf

        # Update current environment marker
        echo "$new_env" > $VPS_DIR/current-env

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
        log_error "Failed to switch nginx traffic"
        return 1
    fi

    log_success "Traffic switched to $new_env environment"
}

stop_old_container() {
    local old_env=$1
    local container_name="${APP_NAME}-${old_env}"

    log_step "Gracefully stopping old container"

    log_info "Waiting ${GRACEFUL_SHUTDOWN_DELAY}s for connections to drain..."
    sleep $GRACEFUL_SHUTDOWN_DELAY

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "docker stop $container_name 2>/dev/null || true"

    log_success "Old container stopped: $container_name"
}

# ============================================================================
# ROLLBACK OPERATIONS
# ============================================================================

rollback_deployment() {
    local old_env=$1
    local new_env=$2

    log_error "Deployment failed! Initiating rollback..."

    # Stop the failed container
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "docker stop ${APP_NAME}-${new_env} 2>/dev/null || true"

    # Check if old container is still running
    local old_running=$(ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "docker ps --filter name=${APP_NAME}-${old_env} --format '{{.Names}}'")

    if [ -z "$old_running" ]; then
        log_info "Restarting old container..."
        ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "docker start ${APP_NAME}-${old_env}"
    fi

    # Switch nginx back
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
        echo "set \\\$active_env $old_env;" > /etc/nginx/conf.d/active-env.conf
        echo "$old_env" > $VPS_DIR/current-env
        nginx -s reload
EOF

    log_warning "Rollback complete. System restored to $old_env environment"
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
    local start_time=$(date +%s)

    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║      SteppersLife Blue/Green Deployment Script         ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    # Pre-flight checks
    check_prerequisites
    validate_config

    # Determine environments
    local current_env=$(get_current_active_env)
    local new_env=$(get_next_env $current_env)

    log_info "Current active environment: ${BLUE}$current_env${NC}"
    log_info "Deploying to environment: ${GREEN}$new_env${NC}"

    # Get port for new environment
    local new_port
    if [ "$new_env" = "blue" ]; then
        new_port=$BLUE_PORT
    else
        new_port=$GREEN_PORT
    fi

    echo ""
    read -p "$(echo -e ${YELLOW}Continue with deployment? [y/N]:${NC} )" -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Deployment cancelled"
        exit 0
    fi

    # Execute deployment steps
    git_commit_and_push
    build_docker_image $new_env
    save_and_transfer_image $new_env
    load_image_on_vps $new_env
    deploy_container $new_env $new_port

    # Health check and traffic switch
    if health_check $new_port $new_env; then
        switch_nginx_traffic $new_env

        if [ $? -eq 0 ]; then
            stop_old_container $current_env

            local end_time=$(date +%s)
            local duration=$((end_time - start_time))

            echo ""
            echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║                                                        ║${NC}"
            echo -e "${GREEN}║            🎉  DEPLOYMENT SUCCESSFUL! 🎉               ║${NC}"
            echo -e "${GREEN}║                                                        ║${NC}"
            echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${CYAN}Deployment Summary:${NC}"
            echo -e "  • Environment: ${GREEN}$new_env${NC}"
            echo -e "  • Container: ${GREEN}${APP_NAME}-${new_env}${NC}"
            echo -e "  • Port: ${GREEN}$new_port${NC}"
            echo -e "  • Duration: ${GREEN}${duration}s${NC}"
            echo -e "  • Status: ${GREEN}ACTIVE${NC}"
            echo ""
            echo -e "${CYAN}Access your application:${NC}"
            echo -e "  • https://stepperslife.com"
            echo ""
            echo -e "${YELLOW}Note:${NC} Old container (${current_env}) has been stopped"
            echo -e "${YELLOW}Tip:${NC} If issues occur, run ${CYAN}./rollback.sh${NC} to revert"
            echo ""
        else
            rollback_deployment $current_env $new_env
            exit 1
        fi
    else
        rollback_deployment $current_env $new_env
        exit 1
    fi
}

# ============================================================================
# SCRIPT ENTRY POINT
# ============================================================================

# Handle script interruption
trap 'echo -e "\n${RED}Deployment interrupted!${NC}"; exit 1' INT TERM

# Run main deployment
main "$@"
