# Nginx configuration for SteppersLife Stores
# Domain: stores.stepperslife.com
# Internal Port: 3008

upstream stores_stepperslife {
    server 127.0.0.1:3008;
    keepalive 64;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name stores.stepperslife.com;

    # Let's Encrypt ACME challenge
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stores.stepperslife.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/stores.stepperslife.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stores.stepperslife.com/privkey.pem;

    # SSL configuration (Mozilla Intermediate)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client upload size
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/stores.stepperslife.com.access.log;
    error_log /var/log/nginx/stores.stepperslife.com.error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript image/svg+xml;

    # Redirects
    location = /vendor/register {
        return 307 /create-store;
    }

    # MinIO CDN proxy for product images
    location /minio/ {
        proxy_pass http://127.0.0.1:9005/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # MinIO specific settings
        proxy_buffering off;
        proxy_request_buffering off;
        client_max_body_size 100M;

        # Cache images for 7 days
        expires 7d;
        add_header Cache-Control "public, immutable";

        # CORS headers for images
        add_header Access-Control-Allow-Origin "https://stores.stepperslife.com" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
    }

    # Proxy settings
    location / {
        proxy_pass http://stores_stepperslife;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets
    location /_next/static {
        proxy_pass http://stores_stepperslife;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /public {
        proxy_pass http://stores_stepperslife;
        proxy_cache_valid 200 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # Health check
    location /api/health {
        proxy_pass http://stores_stepperslife;
        access_log off;
    }
}
