# SteppersLife Unified Platform

A modern, modular platform for events and marketplace functionality built with Next.js 16, PostgreSQL, and Prisma.

## Architecture

### Modular Design
- **Core System**: Authentication, user management, feature flags
- **Events Module**: Event creation, ticketing, organizer dashboard
- **Store Module**: Vendor marketplace, products, orders
- **Blog Module**: Community content (future)

### Feature Flags
- Admin can enable/disable entire modules
- Users can hide modules they don't want to see
- Runtime configuration without code changes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth v5
- **UI**: Tailwind CSS + Radix UI
- **Payments**: Stripe + Square
- **Type Safety**: TypeScript strict mode

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your values
```

3. Generate secrets:
```bash
# Generate secure secrets for NextAuth
openssl rand -base64 32
```

4. Set up database:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed initial data
npm run db:seed
```

5. Initialize feature flags:
```bash
# Start dev server
npm run dev

# In another terminal, initialize features (requires admin login)
curl -X POST http://localhost:3000/api/admin/features/initialize
```

6. Open http://localhost:3000

## Project Structure

```
src/stepperslife-platform/
├── app/
│   ├── (public)/           # Public pages
│   ├── (auth)/             # Auth pages (signin, signup)
│   ├── (modules)/          # Feature modules
│   │   ├── events/         # Events module routes
│   │   └── store/          # Store module routes
│   ├── (admin)/            # Admin dashboard
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── layout/             # Navigation, header
│   ├── auth/               # Auth forms
│   └── modules/            # Module-specific components
├── lib/
│   ├── auth/               # Authentication logic
│   ├── features/           # Feature flag system
│   ├── db/                 # Database client & schema
│   └── utils/              # Utility functions
└── prisma/
    └── schema.prisma       # Database schema
```

## Feature Flag System

### For Admins
Enable/disable modules globally:
```typescript
// Admin Dashboard
POST /api/admin/features
{
  "name": "events",
  "enabled": true
}
```

### For Users
Hide/show modules in their UI:
```typescript
// User Settings
PATCH /api/user/preferences
{
  "showEvents": false,
  "showStore": true
}
```

## User Roles

- **ADMIN**: Full platform access, can manage features
- **USER**: Basic user access
- **EVENT_ORGANIZER**: Can create and manage events
- **VENDOR**: Can create stores and manage products

### Becoming an Organizer/Vendor
Users must explicitly create their first event/store to upgrade their role:
- Create first event → becomes EVENT_ORGANIZER
- Create first store → becomes VENDOR
- Admins (iradwatkins@gmail.com, bobbygwatkins@gmail.com) have all permissions

## Database Management

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Development

```bash
# Run dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm test
```

## Deployment

See `/DEPLOYMENT.md` for production deployment instructions.

## Admin Accounts

The following emails are automatically granted ADMIN role:
- iradwatkins@gmail.com
- bobbygwatkins@gmail.com

## API Routes

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `GET /api/auth/signout` - Sign out

### User
- `PATCH /api/user/preferences` - Update feature preferences

### Admin
- `GET /api/admin/features` - List all features
- `PATCH /api/admin/features` - Enable/disable feature
- `POST /api/admin/features/initialize` - Initialize feature flags

## License

Private - All rights reserved
