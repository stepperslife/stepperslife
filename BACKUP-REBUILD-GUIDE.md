# SteppersLife Complete Backup & Rebuild Guide

**Date:** December 24, 2024
**Version:** 1.0.0
**Repository:** https://github.com/stepperslife/stepperslife

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [API Routes](#api-routes)
7. [Third-Party Integrations](#third-party-integrations)
8. [Deployment Configuration](#deployment-configuration)
9. [Rebuild Instructions](#rebuild-instructions)
10. [Testing](#testing)

---

## Project Overview

SteppersLife is a comprehensive event ticketing, marketplace, restaurant ordering, and community platform for the Chicago Stepping dance community. The platform supports:

- **Event Management**: Ticketed events, free events, save-the-date announcements, classes
- **Ticket Sales**: Multiple payment processors (Stripe, PayPal), QR code tickets, scanning
- **Marketplace**: Multi-vendor e-commerce with variable products, split payments
- **Restaurant Ordering**: Food ordering system with menu management
- **User Roles**: Admin, Organizer, Restaurateur, Vendor, Associate, User

### Key Features
- Real-time data sync via Convex
- Custom JWT authentication with RSA keys
- Split payments for organizers and vendors
- QR code ticket generation and scanning
- Email notifications via Resend
- Admin dashboard for platform management

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.10 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **Radix UI** | Various | Accessible UI components |
| **Framer Motion** | 12.x | Animations |
| **Lucide React** | 0.546.0 | Icons |

### Backend/Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **Convex** | 1.28.0 | Real-time backend & database |
| **Next.js API Routes** | - | REST API endpoints |

### Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| **jose** | 6.1.1 | JWT signing/verification (RSA) |
| **bcryptjs** | 3.0.2 | Password hashing |
| **next-auth** | 4.24.13 | Auth framework (Google OAuth) |

### Payments
| Technology | Version | Purpose |
|------------|---------|---------|
| **Stripe** | 20.1.0 | Card/CashApp payments, Connect |
| **@stripe/react-stripe-js** | 5.3.0 | Stripe Elements |
| **PayPal Server SDK** | 2.0.0 | PayPal payments |
| **@paypal/react-paypal-js** | 8.9.2 | PayPal buttons |

### Other Services
| Technology | Version | Purpose |
|------------|---------|---------|
| **Resend** | 6.4.2 | Transactional emails |
| **Sentry** | 10.22.0 | Error tracking |
| **QRCode/qrcode.react** | 1.5.4/4.2.0 | QR code generation |
| **html5-qrcode** | 2.3.8 | QR code scanning |

### Development
| Technology | Version | Purpose |
|------------|---------|---------|
| **Playwright** | 1.56.1 | E2E testing |
| **ESLint** | 9.x | Linting |
| **Prettier** | 3.6.2 | Code formatting |
| **Husky** | 9.1.7 | Git hooks |

---

## Project Structure

```
stepperslife/
├── convex/                    # Convex backend
│   ├── _generated/            # Auto-generated Convex files
│   ├── adminPanel/            # Admin dashboard functions
│   ├── credits/               # Credit system
│   ├── events/                # Event management
│   ├── productOrders/         # Marketplace orders
│   ├── products/              # Product catalog
│   ├── public/                # Public queries (no auth)
│   ├── scanning/              # Ticket scanning
│   ├── tickets/               # Ticket management
│   ├── users/                 # User management
│   ├── schema.ts              # Database schema (72KB)
│   ├── vendors.ts             # Vendor operations
│   ├── restaurants.ts         # Restaurant operations
│   ├── foodOrders.ts          # Food ordering
│   ├── menuItems.ts           # Restaurant menus
│   └── ...
│
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (public)/          # Public pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── stripe/        # Stripe payment routes
│   │   │   ├── paypal/        # PayPal payment routes
│   │   │   ├── webhooks/      # Payment webhooks
│   │   │   └── vendors/       # Vendor API
│   │   ├── associate/         # Sales associate portal
│   │   ├── classes/           # Class pages
│   │   ├── events/            # Event pages
│   │   ├── marketplace/       # E-commerce pages
│   │   ├── organizer/         # Event organizer portal
│   │   ├── restaurants/       # Restaurant pages
│   │   ├── restaurateur/      # Restaurant owner portal
│   │   └── vendor/            # Vendor portal
│   │
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   ├── events/            # Event components
│   │   ├── marketplace/       # Marketplace components
│   │   ├── restaurants/       # Restaurant components
│   │   ├── ui/                # UI primitives (shadcn/ui)
│   │   └── ...
│   │
│   ├── contexts/              # React contexts
│   │   ├── CartContext.tsx    # Shopping cart state
│   │   ├── AuthContext.tsx    # Authentication state
│   │   └── ...
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── auth/              # Auth utilities
│   │   ├── email/             # Email templates
│   │   └── utils.ts           # General utilities
│   │
│   └── styles/                # Global styles
│
├── tests/                     # Playwright E2E tests
├── scripts/                   # Utility scripts
├── docs/                      # Documentation
├── public/                    # Static assets
└── ...config files
```

---

## Environment Variables

### Required for Production

```env
# Convex
CONVEX_DEPLOYMENT=prod:expert-vulture-775
NEXT_PUBLIC_CONVEX_URL=https://expert-vulture-775.convex.cloud

# Authentication (RSA Keys)
AUTH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
AUTH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
AUTH_KEY_ID=stepperslife-auth-key-1
AUTH_ISSUER=https://stepperslife.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_MODE=live

# Resend (Email)
RESEND_API_KEY=re_...
EMAIL_FROM=SteppersLife <noreply@stepperslife.com>

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# URLs
NEXT_PUBLIC_SITE_URL=https://stepperslife.com
```

### For Development/Testing

```env
# Same as above but with test keys:
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
PAYPAL_MODE=sandbox
CONVEX_DEPLOYMENT=dev:...
```

---

## Database Schema

The Convex schema (`convex/schema.ts`) defines these main tables:

### Core Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts | email, role, passwordHash, stripeConnectedAccountId |
| `events` | Events/Classes | name, organizerId, eventType, ticketTypes |
| `tickets` | Purchased tickets | eventId, userId, qrCode, status |
| `ticketTypes` | Ticket pricing tiers | eventId, name, price, quantity |

### Marketplace Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `vendors` | Vendor stores | ownerId, name, stripeConnectedAccountId |
| `products` | Product catalog | vendorId, name, price, productType |
| `productVariations` | Size/Color variants | productId, attributes, price |
| `productOrders` | Customer orders | customerId, items, paymentStatus |
| `vendorEarnings` | Revenue tracking | vendorId, orderId, amount |

### Restaurant Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `restaurants` | Restaurant profiles | ownerId, name, slug |
| `menuItems` | Menu items | restaurantId, name, price |
| `menuCategories` | Menu organization | restaurantId, name |
| `foodOrders` | Food orders | customerId, restaurantId, items |

### Other Tables
| Table | Purpose |
|-------|---------|
| `credits` | Organizer ticket credits |
| `discountCodes` | Promo codes |
| `eventAssociates` | Sales associates |
| `eventStaff` | Event staff roles |
| `stripeTransactions` | Payment records |
| `paypalTransactions` | PayPal records |

---

## API Routes

### Authentication (`/api/auth/`)
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Session logout
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/me` - Get current user

### Stripe Payments (`/api/stripe/`)
- `POST /api/stripe/create-checkout-session` - Event ticket checkout
- `POST /api/stripe/create-product-order-payment` - Marketplace checkout
- `POST /api/stripe/create-class-payment` - Class registration
- `POST /api/stripe/create-connected-account` - Organizer onboarding
- `GET /api/stripe/account-link` - Stripe Connect link

### PayPal Payments (`/api/paypal/`)
- `POST /api/paypal/create-order` - Create PayPal order
- `POST /api/paypal/capture-order` - Capture payment
- `POST /api/paypal/create-partner-referral` - Merchant onboarding

### Webhooks (`/api/webhooks/`)
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/paypal` - PayPal webhook handler

### Vendors (`/api/vendors/`)
- `GET /api/vendors/[vendorId]/payment-info` - Vendor payment config

---

## Third-Party Integrations

### Stripe
- **Purpose**: Card payments, CashApp Pay, Connect for split payments
- **Webhook Events**: `payment_intent.succeeded`, `checkout.session.completed`
- **Split Payments**: Platform takes 15% commission, vendor receives 85%

### PayPal
- **Purpose**: Alternative payment method
- **Features**: PayPal buttons, merchant onboarding
- **Webhook Events**: `PAYMENT.CAPTURE.COMPLETED`

### Resend
- **Purpose**: Transactional emails
- **Templates**: Ticket confirmation, order confirmation, password reset
- **From**: `noreply@stepperslife.com`

### Convex
- **Deployment**: `prod:expert-vulture-775`
- **URL**: `https://expert-vulture-775.convex.cloud`
- **Features**: Real-time subscriptions, file storage, cron jobs

---

## Deployment Configuration

### Vercel
- **Project**: stepperslife
- **Team**: stepperslife
- **Production Domain**: stepperslife.com
- **Build Command**: `npm run build:with-convex`
- **Install Command**: `npm install`
- **Framework**: Next.js

### Convex Deployment
```bash
# Deploy to production
CONVEX_DEPLOY_KEY='prod:expert-vulture-775|...' npx convex deploy --yes

# View logs
CONVEX_DEPLOY_KEY='...' npx convex logs --history 20
```

### GitHub
- **Repository**: https://github.com/stepperslife/stepperslife
- **Branch**: main (auto-deploys to Vercel)

---

## Rebuild Instructions

### Prerequisites
1. Node.js 20+ installed
2. Git installed
3. Convex account
4. Vercel account
5. Stripe account
6. PayPal developer account
7. Resend account
8. Domain configured (stepperslife.com)

### Step 1: Clone Repository
```bash
git clone https://github.com/stepperslife/stepperslife.git
cd stepperslife
npm install
```

### Step 2: Create Convex Project
```bash
npx convex init
# Select "Create a new project"
# Name: stepperslife
```

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in all required environment variables
3. Generate RSA keys for authentication:
```bash
# Generate private key
openssl genrsa -out private.pem 2048

# Generate public key
openssl rsa -in private.pem -pubout -out public.pem
```

### Step 4: Deploy Convex
```bash
npx convex deploy
```

### Step 5: Configure Vercel
```bash
vercel link
vercel env add CONVEX_DEPLOYMENT
vercel env add NEXT_PUBLIC_CONVEX_URL
# Add all other env vars...
```

### Step 6: Deploy to Vercel
```bash
vercel --prod
```

### Step 7: Configure Stripe Webhooks
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://stepperslife.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `checkout.session.completed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Step 8: Configure PayPal Webhooks
1. Go to PayPal Developer Dashboard > Webhooks
2. Add endpoint: `https://stepperslife.com/api/webhooks/paypal`
3. Select events: `PAYMENT.CAPTURE.COMPLETED`
4. Copy webhook ID to `PAYPAL_WEBHOOK_ID`

---

## Testing

### Run E2E Tests
```bash
# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run specific test file
npx playwright test tests/marketplace-checkout-stripe.spec.ts

# Run with UI
npm run test:ui
```

### Test Stripe Payments
Use test card: `4242 4242 4242 4242` (any expiry, any CVC)

### Test PayPal Payments
Use sandbox account credentials from PayPal Developer Dashboard

---

## Data Backup

### Export Convex Data
```bash
# Query all tables
CONVEX_DEPLOY_KEY='...' npx convex run --no-push users/queries:getAllUsers '{}'
CONVEX_DEPLOY_KEY='...' npx convex run --no-push events/queries:getAllEventsInternal '{}'
CONVEX_DEPLOY_KEY='...' npx convex run --no-push vendors:getApprovedVendors '{}'
```

### GitHub Backup
All code is in the GitHub repository. Clone with:
```bash
git clone https://github.com/stepperslife/stepperslife.git
```

---

## Support & Contacts

- **GitHub Issues**: https://github.com/stepperslife/stepperslife/issues
- **Production URL**: https://stepperslife.com
- **Convex Dashboard**: https://dashboard.convex.dev/d/prod:expert-vulture-775

---

*Document generated: December 24, 2024*
*Last updated: December 24, 2024*
