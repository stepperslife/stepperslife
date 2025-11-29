FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables (all required for Next.js build)
ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG JWT_SECRET
ARG AUTH_SECRET
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG AUTH_GOOGLE_CLIENT_ID
ARG AUTH_GOOGLE_CLIENT_SECRET
ARG RESEND_API_KEY
ARG STRIPE_SECRET_KEY

ENV NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=${NEXT_PUBLIC_PAYPAL_CLIENT_ID}
ENV JWT_SECRET=${JWT_SECRET}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV AUTH_GOOGLE_CLIENT_ID=${AUTH_GOOGLE_CLIENT_ID}
ENV AUTH_GOOGLE_CLIENT_SECRET=${AUTH_GOOGLE_CLIENT_SECRET}
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
