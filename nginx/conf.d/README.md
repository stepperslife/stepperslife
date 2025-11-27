# Nginx Additional Configuration Directory

This directory is for additional site-specific Nginx configuration files.

## Usage

Place `.conf` files here for:
- Additional server blocks
- Custom upstream configurations
- Site-specific settings

## Note

The main configuration is in `/nginx/nginx.conf`.

All `.conf` files in this directory are automatically included by Nginx.

## Example

```nginx
# custom-headers.conf
add_header X-Custom-Header "value" always;
```
