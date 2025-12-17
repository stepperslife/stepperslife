# ==========================================
# SteppersLife Environment Configuration
# ==========================================
# Copy this file to .env.local and fill in your values
#
# IMPORTANT: Convex Project Configuration
# - Production: expert-vulture-775 (Events.stepperslife project)
# - Development: fearless-dragon-613 (Cloud dev deployment)
# ==========================================

NODE_ENV=development
PORT=3000

# ==========================================
# CONVEX DATABASE - IMPORTANT!
# ==========================================
# Production uses: expert-vulture-775
# Development uses: fearless-dragon-613
#
# DO NOT use neighborly-swordfish-681 - that's a different project!
# ==========================================
CONVEX_URL=https://expert-vulture-775.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://expert-vulture-775.convex.cloud
CONVEX_DEPLOYMENT=prod:expert-vulture-775

# For local development, use:
# CONVEX_URL=https://fearless-dragon-613.convex.cloud
# NEXT_PUBLIC_CONVEX_URL=https://fearless-dragon-613.convex.cloud
# CONVEX_DEPLOYMENT=dev:fearless-dragon-613

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_DOMAIN=localhost

# Auth Secrets (Generate unique values for production!)
NEXTAUTH_SECRET=your-secret-here
JWT_SECRET=your-secret-here
AUTH_SECRET=your-secret-here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_SECRET_KEY=your-paypal-secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id

# Google OAuth
AUTH_GOOGLE_CLIENT_ID=your-google-client-id
AUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Resend Email
RESEND_API_KEY=re_xxx

# Square Configuration
SQUARE_ACCESS_TOKEN=
SQUARE_APPLICATION_ID=
SQUARE_LOCATION_ID=
NEXT_PUBLIC_SQUARE_APPLICATION_ID=
NEXT_PUBLIC_SQUARE_LOCATION_ID=
NEXT_PUBLIC_SQUARE_ENVIRONMENT=sandbox

# Email Sender Configuration
FROM_EMAIL=noreply@stepperslife.com
SUPPORT_EMAIL=support@stepperslife.com
