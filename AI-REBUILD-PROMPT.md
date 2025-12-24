# AI Rebuild Prompt for SteppersLife

This document provides a comprehensive prompt for an AI assistant to understand, maintain, or rebuild the SteppersLife platform.

---

## System Context

You are working on **SteppersLife**, a full-stack event ticketing and e-commerce platform for the Chicago Stepping dance community. The platform is built with Next.js 16, Convex (real-time backend), and deployed on Vercel.

## Tech Stack Summary

```
Frontend:     Next.js 16 (App Router) + React 19 + TypeScript 5.9
Styling:      Tailwind CSS 4 + Radix UI + shadcn/ui components
Backend:      Convex 1.28 (real-time database + serverless functions)
Auth:         Custom JWT with RSA keys (jose library) + Google OAuth
Payments:     Stripe (cards, CashApp, Connect) + PayPal
Email:        Resend
Testing:      Playwright
Hosting:      Vercel (frontend) + Convex Cloud (backend)
```

## Project Architecture

### Directory Structure
```
/convex           - Backend (database schema, mutations, queries)
/src/app          - Next.js App Router pages
/src/app/api      - REST API routes (auth, payments, webhooks)
/src/components   - React components
/src/contexts     - React contexts (Cart, Auth)
/src/lib          - Utilities and helpers
/tests            - Playwright E2E tests
```

### Key Files
- `convex/schema.ts` - Database schema (72KB, all tables defined here)
- `src/app/api/auth/` - Authentication endpoints
- `src/app/api/stripe/` - Stripe payment routes
- `src/app/api/webhooks/` - Payment webhook handlers
- `src/contexts/CartContext.tsx` - Shopping cart state
- `src/lib/auth/` - JWT token utilities

## Core Features

### 1. Authentication
- **Method**: Custom JWT with RSA signing (not session-based)
- **Token Storage**: HTTP-only cookies
- **Endpoints**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **User Roles**: admin, organizer, restaurateur, vendor, user

```typescript
// Token structure
{
  sub: "https://stepperslife.com|convex|{userId}",
  iss: "https://stepperslife.com",
  aud: "convex",
  email: string,
  name: string,
  role: string,
  iat: number,
  exp: number
}
```

### 2. Event Ticketing
- Event types: TICKETED_EVENT, FREE_EVENT, SAVE_THE_DATE, CLASS
- Multiple ticket tiers with different prices
- QR code tickets for scanning at venue
- Split payments: Platform takes commission, organizer receives rest

### 3. Marketplace (Multi-Vendor E-Commerce)
- Vendors can create stores and list products
- Variable products with size/color variations
- Stripe split payments via Stripe Connect
- 15% platform commission (configurable per vendor)
- Cart persisted in localStorage via CartContext

### 4. Restaurant Ordering
- Restaurant owners manage menus
- Customers can order food for pickup/delivery
- Order status tracking (pending → preparing → ready → completed)

## Database Schema (Convex)

### Main Tables
```typescript
users: {
  email: string,
  passwordHash?: string,
  role?: "admin" | "organizer" | "restaurateur" | "user",
  stripeConnectedAccountId?: string,
  // ... payment fields
}

events: {
  name: string,
  organizerId: Id<"users">,
  eventType: "SAVE_THE_DATE" | "FREE_EVENT" | "TICKETED_EVENT" | "CLASS",
  startDate: number,
  location: { city, state, address, ... },
  // ... ticket settings
}

vendors: {
  ownerId: Id<"users">,
  name: string,
  stripeConnectedAccountId?: string,
  stripeAccountSetupComplete?: boolean,
  commissionPercent?: number, // Default 15
}

products: {
  vendorId: Id<"vendors">,
  name: string,
  price: number, // In cents
  productType: "SIMPLE" | "VARIABLE",
  status: "ACTIVE" | "DRAFT" | "ARCHIVED",
}

productVariations: {
  productId: Id<"products">,
  attributes: { size?: string, color?: string },
  price: number,
  inventoryQuantity: number,
}

productOrders: {
  customerId?: Id<"users">,
  items: [...],
  paymentStatus: "PENDING" | "PAID" | "FAILED",
  stripePaymentIntentId?: string,
}
```

## Payment Flow

### Stripe Checkout (Marketplace)
```
1. Customer adds items to cart
2. Proceeds to /marketplace/checkout
3. Fills shipping info, clicks "Continue to Payment"
4. Frontend calls POST /api/stripe/create-product-order-payment
5. API creates PaymentIntent with:
   - amount: total in cents
   - automatic_payment_methods: { enabled: true }
   - For real Stripe Connect accounts:
     - application_fee_amount: (amount * commissionPercent / 100)
     - transfer_data: { destination: vendorStripeAccountId }
6. Returns clientSecret to frontend
7. Stripe Elements displays payment form
8. Customer pays, Stripe webhook fires
9. Webhook handler updates order paymentStatus to PAID
```

### Split Payment Logic
```typescript
// In /api/stripe/create-product-order-payment/route.ts
const isRealStripeAccount = vendorStripeAccountId &&
  vendorStripeAccountId.startsWith('acct_') &&
  !vendorStripeAccountId.includes('_test_') &&
  vendorStripeAccountId.length >= 20;

if (isRealStripeAccount) {
  paymentIntentOptions.application_fee_amount = applicationFeeAmount;
  paymentIntentOptions.transfer_data = { destination: vendorStripeAccountId };
}
```

## Common Patterns

### Convex Query
```typescript
// convex/products/queries.ts
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getAllProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});
```

### Convex Mutation
```typescript
// convex/productOrders/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    items: v.array(v.object({...})),
    customerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("productOrders", {
      items: args.items,
      customerEmail: args.customerEmail,
      paymentStatus: "PENDING",
      createdAt: Date.now(),
    });
    return orderId;
  },
});
```

### API Route
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // ... process
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### React Component with Convex
```typescript
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function ProductList() {
  const products = useQuery(api.products.queries.getAllProducts);
  const createOrder = useMutation(api.productOrders.mutations.createOrder);

  if (!products) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

## Environment Variables Required

```env
# Convex
CONVEX_DEPLOYMENT=prod:expert-vulture-775
NEXT_PUBLIC_CONVEX_URL=https://expert-vulture-775.convex.cloud

# Auth (RSA keys for JWT)
AUTH_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----..."
AUTH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----..."
AUTH_KEY_ID=stepperslife-auth-key-1
AUTH_ISSUER=https://stepperslife.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# Resend (Email)
RESEND_API_KEY=re_...

# Site
NEXT_PUBLIC_SITE_URL=https://stepperslife.com
```

## Deployment Commands

```bash
# Deploy Convex backend
CONVEX_DEPLOY_KEY='prod:expert-vulture-775|...' npx convex deploy --yes

# Build Next.js
npm run build

# Deploy to Vercel
vercel --prod

# Run E2E tests
BASE_URL=https://stepperslife.com npx playwright test
```

## Common Tasks

### Adding a New Convex Table
1. Edit `convex/schema.ts`, add table definition
2. Run `npx convex deploy` to update schema
3. Create queries/mutations in appropriate folder

### Adding a New API Route
1. Create file at `src/app/api/[route]/route.ts`
2. Export `GET`, `POST`, etc. functions
3. Use `NextRequest`/`NextResponse` from "next/server"

### Adding a New Page
1. Create folder at `src/app/[route]/`
2. Add `page.tsx` for the page component
3. Use "use client" directive for client components

### Testing Payments
- Use Stripe test card: `4242 4242 4242 4242`
- Any future expiry date, any CVC
- Check Stripe Dashboard for payment intents

## Troubleshooting

### Convex Connection Issues
- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Check Convex dashboard for deployment status
- Run `npx convex logs` to see errors

### Stripe Payment Errors
- Verify `STRIPE_SECRET_KEY` is set in Vercel env
- Check webhook is configured correctly
- Test with `4000000000000002` for declined card

### Authentication Issues
- Verify RSA keys are correctly formatted (with \n newlines)
- Check token expiration (default 30 days)
- Verify cookies are being set (same-site, secure flags)

---

## Summary for AI

When working on this codebase:
1. **Backend changes**: Edit files in `/convex/`, then run `npx convex deploy`
2. **Frontend changes**: Edit files in `/src/`, Vercel auto-deploys on push
3. **API routes**: Located at `/src/app/api/`
4. **Database**: Schema in `convex/schema.ts`, data managed via Convex mutations
5. **Payments**: Stripe for cards, PayPal as alternative
6. **Testing**: Playwright E2E tests in `/tests/`

The platform is production-ready and serves the Chicago Stepping dance community with event ticketing, marketplace shopping, and restaurant ordering.
