#!/bin/bash

# SteppersLife VPS Setup Script
# One-time setup for blue/green deployment infrastructure on VPS

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
DOMAIN="${DOMAIN:-stepperslife.com}"

# Application Configuration
APP_NAME="stepperlife"
DOCKER_NETWORK="app-network"

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
# SETUP FUNCTIONS
# ============================================================================

check_vps_connection() {
    log_step "Checking VPS connection"

    if ! ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "echo 'Connected'" &>/dev/null; then
        log_error "Cannot connect to VPS at $VPS_USER@$VPS_HOST"
        exit 1
    fi

    log_success "VPS connection verified"
}

install_prerequisites() {
    log_step "Installing prerequisites on VPS"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
        # Update package list
        echo "Updating package list..."
        apt-get update -qq

        # Install Docker if not present
        if ! command -v docker &> /dev/null; then
            echo "Installing Docker..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            rm get-docker.sh
            systemctl enable docker
            systemctl start docker
        else
            echo "Docker already installed"
        fi

        # Install Nginx if not present
        if ! command -v nginx &> /dev/null; then
            echo "Installing Nginx..."
            apt-get install -y nginx
            systemctl enable nginx
        else
            echo "Nginx already installed"
        fi

        # Install certbot for SSL
        if ! command -v certbot &> /dev/null; then
            echo "Installing certbot..."
            apt-get install -y certbot python3-certbot-nginx
        else
            echo "Certbot already installed"
        fi

        # Install other utilities
        apt-get install -y curl wget git htop
EOF

    log_success "Prerequisites installed"
}

create_directory_structure() {
    log_step "Creating directory structure"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
        # Create application directory
        mkdir -p $VPS_DIR
        mkdir -p $VPS_DIR/logs
        mkdir -p /var/www/certbot

        # Set permissions
        chmod 755 $VPS_DIR
EOF

    log_success "Directory structure created"
}

setup_docker_network() {
    log_step "Setting up Docker network"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
        # Create Docker network if it doesn't exist
        if ! docker network ls --format '{{.Name}}' | grep -q "^${DOCKER_NETWORK}$"; then
            echo "Creating Docker network: ${DOCKER_NETWORK}"
            docker network create ${DOCKER_NETWORK}
        else
            echo "Docker network already exists: ${DOCKER_NETWORK}"
        fi
EOF

    log_success "Docker network ready"
}

upload_nginx_config() {
    log_step "Uploading Nginx configuration"

    # Check if config files exist locally
    if [ ! -f "nginx-vps.conf" ] || [ ! -f "nginx-site.conf" ]; then
        log_error "Nginx configuration files not found"
        log_error "Please ensure nginx-vps.conf and nginx-site.conf exist"
        exit 1
    fi

    # Upload main nginx config
    log_info "Uploading nginx.conf..."
    scp -P $VPS_PORT nginx-vps.conf $VPS_USER@$VPS_HOST:/etc/nginx/nginx.conf

    # Upload site config
    log_info "Uploading site configuration..."
    scp -P $VPS_PORT nginx-site.conf $VPS_USER@$VPS_HOST:/etc/nginx/conf.d/stepperslife.conf

    # Create initial active-env.conf (default to green)
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << EOF
        # Set initial environment to green
        echo "set \\\$active_env green;" > /etc/nginx/conf.d/active-env.conf
        echo "green" > $VPS_DIR/current-env

        # Test nginx configuration
        nginx -t
EOF

    log_success "Nginx configuration uploaded"
}

setup_ssl_certificates() {
    log_step "Setting up SSL certificates"

    log_warning "SSL certificate setup requires manual intervention"
    echo ""
    echo "Please run the following command on your VPS to obtain SSL certificates:"
    echo ""
    echo -e "${CYAN}sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
    echo ""
    echo "This will:"
    echo "  1. Verify domain ownership"
    echo "  2. Obtain SSL certificates from Let's Encrypt"
    echo "  3. Configure Nginx to use the certificates"
    echo "  4. Set up automatic renewal"
    echo ""

    read -p "$(echo -e ${YELLOW}Have you already obtained SSL certificates? [y/N]:${NC} )" -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_success "SSL certificates confirmed"
    else
        log_warning "Please obtain SSL certificates before deploying"
        log_warning "You can continue setup and get certificates later"
    fi
}

create_env_file() {
    log_step "Creating .env file on VPS"

    log_info "You need to create a .env file at $VPS_DIR/.env on your VPS"
    log_info "This file should contain all environment variables needed by your application"
    echo ""

    read -p "$(echo -e ${YELLOW}Do you want to upload a local .env file? [y/N]:${NC} )" -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f ".env.production" ]; then
            log_info "Uploading .env.production..."
            scp -P $VPS_PORT .env.production $VPS_USER@$VPS_HOST:$VPS_DIR/.env
            log_success ".env file uploaded"
        else
            log_error ".env.production file not found"
            log_warning "Please create $VPS_DIR/.env manually on your VPS"
        fi
    else
        log_warning "Please create $VPS_DIR/.env manually on your VPS"
    fi
}

configure_firewall() {
    log_step "Configuring firewall"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
        # Check if UFW is available
        if command -v ufw &> /dev/null; then
            echo "Configuring UFW firewall..."

            # Allow SSH
            ufw allow 22/tcp

            # Allow HTTP and HTTPS
            ufw allow 80/tcp
            ufw allow 443/tcp

            # Enable UFW if not already enabled
            if ! ufw status | grep -q "Status: active"; then
                echo "y" | ufw enable
            fi

            ufw status
        else
            echo "UFW not available, skipping firewall configuration"
        fi
EOF

    log_success "Firewall configured"
}

restart_nginx() {
    log_step "Restarting Nginx"

    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST << 'EOF'
        # Test nginx configuration
        nginx -t

        # Restart nginx
        systemctl restart nginx

        # Check status
        systemctl status nginx --no-pager
EOF

    log_success "Nginx restarted"
}

# ============================================================================
# MAIN SETUP FLOW
# ============================================================================

main() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║                                                        ║"
    echo "║      SteppersLife VPS Setup Script                     ║"
    echo "║                                                        ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    log_info "VPS Host: ${BLUE}$VPS_HOST${NC}"
    log_info "VPS User: ${BLUE}$VPS_USER${NC}"
    log_info "App Directory: ${BLUE}$VPS_DIR${NC}"
    log_info "Domain: ${BLUE}$DOMAIN${NC}"
    echo ""

    log_warning "This script will set up the VPS for blue/green deployment"
    log_warning "It will install Docker, Nginx, and configure the environment"
    echo ""

    read -p "$(echo -e ${YELLOW}Continue with VPS setup? [y/N]:${NC} )" -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Setup cancelled"
        exit 0
    fi

    # Run setup steps
    check_vps_connection
    install_prerequisites
    create_directory_structure
    setup_docker_network
    upload_nginx_config
    configure_firewall
    create_env_file
    setup_ssl_certificates
    restart_nginx

    # Success message
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║         🎉  VPS SETUP COMPLETE! 🎉                     ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Next Steps:${NC}"
    echo ""
    echo "1. ${GREEN}Verify .env file:${NC}"
    echo "   SSH into your VPS and ensure $VPS_DIR/.env is configured"
    echo ""
    echo "2. ${GREEN}Obtain SSL certificates (if not done):${NC}"
    echo "   ssh $VPS_USER@$VPS_HOST"
    echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo ""
    echo "3. ${GREEN}Deploy your application:${NC}"
    echo "   ./deploy.sh"
    echo ""
    echo -e "${YELLOW}Important files on VPS:${NC}"
    echo "  • Application directory: $VPS_DIR"
    echo "  • Environment file: $VPS_DIR/.env"
    echo "  • Current environment marker: $VPS_DIR/current-env"
    echo "  • Nginx config: /etc/nginx/conf.d/stepperslife.conf"
    echo "  • Active environment: /etc/nginx/conf.d/active-env.conf"
    echo ""
}

# ============================================================================
# SCRIPT ENTRY POINT
# ============================================================================

# Handle script interruption
trap 'echo -e "\n${RED}Setup interrupted!${NC}"; exit 1' INT TERM

# Run main setup
main "$@"
