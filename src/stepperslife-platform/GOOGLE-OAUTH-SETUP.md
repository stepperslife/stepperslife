# Google OAuth Setup Guide for SteppersLife Platform

## Current Status

✅ **Database**: Connected and working
✅ **NextAuth.js**: Configured with AUTH_SECRET
⚠️ **Google OAuth**: Placeholder credentials - needs real setup

## Error You're Seeing

```
Sign in with Google
Access blocked: Authorization Error
The OAuth client was not found.
Error 401: invalid_client
```

This error occurs because `AUTH_GOOGLE_CLIENT_ID` and `AUTH_GOOGLE_CLIENT_SECRET` are set to placeholder values in `.env.local`.

## Step-by-Step Setup

### 1. Go to Google Cloud Console

Visit: https://console.cloud.google.com/apis/credentials

### 2. Create or Select a Project

- If you don't have a project, click "Create Project"
- Name it something like "SteppersLife Platform"
- Click "Create"

### 3. Configure OAuth Consent Screen

1. Click "OAuth consent screen" in the left sidebar
2. Select "External" (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in required fields:
   - **App name**: SteppersLife Platform
   - **User support email**: your email
   - **Developer contact email**: your email
5. Click "Save and Continue"
6. Skip "Scopes" (default scopes are fine)
7. Add test users if needed
8. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Click "Credentials" in the left sidebar
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Name it: "SteppersLife Web Client"
5. Add Authorized redirect URIs:

   **For Local Development:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   **For Production (when deployed):**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```

6. Click "Create"
7. **Copy your credentials** - you'll see a dialog with:
   - Client ID (starts with something like `123456789-abc.apps.googleusercontent.com`)
   - Client Secret (random string like `GOCSPX-abc123...`)

### 5. Update .env.local File

Replace the placeholder values in `/src/stepperslife-platform/.env.local`:

```bash
# Google OAuth - Replace with your real credentials
AUTH_GOOGLE_CLIENT_ID="YOUR_CLIENT_ID_HERE"
AUTH_GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
```

Example (with fake values):
```bash
AUTH_GOOGLE_CLIENT_ID="123456789-abc123def456.apps.googleusercontent.com"
AUTH_GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEf123456"
```

### 6. Restart Dev Server

After updating the credentials:

```bash
# Kill existing servers
pkill -f "npm run dev"

# Start fresh
npm run dev
```

### 7. Test Google Sign-In

1. Open http://localhost:3000/auth/signin
2. Click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. You should be redirected back and logged in!

## Admin Access

Your email (`iradwatkins@gmail.com`) is configured as an admin in the system. When you sign in with Google for the first time, you'll automatically be assigned the ADMIN role.

See `/lib/auth/config.ts:9`:
```typescript
const ADMIN_EMAILS = ['iradwatkins@gmail.com', 'bobbygwatkins@gmail.com']
```

## Troubleshooting

### "Redirect URI mismatch" error

Make sure the redirect URI in Google Cloud Console exactly matches:
- Protocol: `http://` for local, `https://` for production
- Domain: `localhost:3000` or your production domain
- Path: `/api/auth/callback/google`

### Still getting "invalid_client"

1. Double-check you copied the full Client ID and Secret
2. Make sure there are no extra spaces or quotes
3. Restart the dev server after changing .env.local
4. Clear your browser cache/cookies for localhost:3000

### "Access blocked: This app's request is invalid"

Your OAuth consent screen might not be configured. Go back to step 3.

## Security Notes

🔒 **Never commit .env.local to Git** - it's already in .gitignore
🔒 **Use separate credentials for production** - create additional OAuth clients for different environments
🔒 **Restrict your OAuth client** - in production, add only your actual domain to authorized redirect URIs

## Production Deployment

When deploying to production (Docker on VPS):

1. Create a new OAuth client in Google Cloud Console
2. Add your production domain redirect URI
3. Set environment variables in your production environment:
   ```bash
   AUTH_GOOGLE_CLIENT_ID="production_client_id"
   AUTH_GOOGLE_CLIENT_SECRET="production_client_secret"
   AUTH_SECRET="generate_new_secret_for_production"
   ```
4. Generate a new AUTH_SECRET for production:
   ```bash
   openssl rand -base64 32
   ```

## Current .env.local File

Located at: `/src/stepperslife-platform/.env.local`

```bash
# Database
DATABASE_URL="postgresql://irawatkins@localhost:5432/stepperslife_platform?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="Qk6ixGbt2CT9Rttom1GDPPvyC1l/2YjLubexkKPvzrI="
JWT_SECRET="Qk6ixGbt2CT9Rttom1GDPPvyC1l/2YjLubexkKPvzrI="
AUTH_SECRET="Qk6ixGbt2CT9Rttom1GDPPvzrI="

# Google OAuth - REPLACE THESE WITH REAL VALUES
AUTH_GOOGLE_CLIENT_ID="your-google-client-id-here"
AUTH_GOOGLE_CLIENT_SECRET="your-google-client-secret-here"

# Payment Processors (demo mode)
STRIPE_SECRET_KEY="sk_test_demo"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_demo"
```

## What's Working Now

✅ Dev server running on http://localhost:3000
✅ Database connected
✅ Auth system configured
✅ Email/password login working (credentials auth)
✅ Events page with masonry view
⏳ Google OAuth (waiting for real credentials)

## Next Steps

1. Follow this guide to get Google OAuth credentials
2. Update .env.local with real credentials
3. Restart dev server
4. Test Google sign-in
5. You're ready to go!
