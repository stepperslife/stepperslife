# 🔧 Google OAuth Fix Applied - Session Token Issue Resolved

**Date**: November 17, 2025
**Issue**: Users redirected back to login after Google authentication
**Status**: ✅ FIXED

---

## 🐛 Problem Identified

### Root Cause: JWT Secret Mismatch

The application was creating JWT tokens with one secret but verifying them with a different secret, causing all authentication attempts to fail.

**Before Fix**:
```typescript
// Callback route created tokens with:
JWT_SECRET || AUTH_SECRET || "development-secret-change-in-production"

// /api/auth/me verified tokens with:
AUTH_SECRET || JWT_SECRET || "your-secret-key-change-this-in-production"

// /api/auth/convex-token verified tokens with:
JWT_SECRET || AUTH_SECRET  // No fallback!

// .env.local only had: NEXTAUTH_SECRET (not JWT_SECRET or AUTH_SECRET)
```

**Result**: Different secrets = JWT verification fails = Session invalid = Redirect to login

---

## ✅ Solutions Applied

### 1. Added Missing Environment Variables

**File**: `.env.local`

Added:
```bash
# JWT Secret for session tokens (CRITICAL)
JWT_SECRET=supersecretkey123456789forlocaldevelopment
AUTH_SECRET=supersecretkey123456789forlocaldevelopment
```

### 2. Created Centralized JWT Secret Management

**File**: `lib/auth/jwt-secret.ts` (NEW)

```typescript
/**
 * Centralized JWT Secret Management
 * Ensures ALL auth routes use the SAME secret
 */

export function getJwtSecret(): string {
  return (
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "development-secret-change-in-production"
  );
}

export function getJwtSecretEncoded(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

export function validateJwtSecret(): { valid: boolean; error?: string } {
  // Validates JWT secret is configured
}
```

### 3. Updated All Auth Routes

**Updated Files**:
- ✅ `app/api/auth/callback/google/route.ts` - Google OAuth callback
- ✅ `app/api/auth/me/route.ts` - Session verification
- ✅ `app/api/auth/convex-token/route.ts` - Convex token generation
- ✅ `app/api/auth/login/route.ts` - Password login

**Changes**:
```typescript
// BEFORE (inconsistent)
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.AUTH_SECRET || "fallback1"
);

// AFTER (consistent)
import { getJwtSecretEncoded } from "@/lib/auth/jwt-secret";
const secret = getJwtSecretEncoded();
```

---

## 🚀 How to Apply This Fix to Production

### Step 1: Update Production Environment Variables

**CRITICAL**: Add these to your production environment:

```bash
# For PM2 .env file or docker-compose.yml
JWT_SECRET=your-super-secure-production-secret-minimum-32-characters
AUTH_SECRET=your-super-secure-production-secret-minimum-32-characters

# OR use existing NEXTAUTH_SECRET if it's secure
JWT_SECRET=${NEXTAUTH_SECRET}
AUTH_SECRET=${NEXTAUTH_SECRET}
```

**⚠️ IMPORTANT**:
- Use a strong, random secret (at least 32 characters)
- Use the SAME value for both JWT_SECRET and AUTH_SECRET
- Do NOT use the development secret in production!

**Generate a secure secret**:
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 2: Verify Environment Variables Are Loaded

**For Docker/PM2**:
```bash
# Check if env vars are set
echo $JWT_SECRET
echo $AUTH_SECRET

# Or in Node.js
node -e "console.log('JWT_SECRET:', process.env.JWT_SECRET)"
```

### Step 3: Restart the Application

```bash
# PM2
pm2 restart all

# Docker
docker-compose restart nextjs

# Or full rebuild if needed
docker-compose down && docker-compose up -d
```

### Step 4: Test Google Login

1. Clear your browser cookies for `events.stepperslife.com`
2. Go to `https://events.stepperslife.com/login`
3. Click "Continue with Google"
4. Complete Google authentication
5. **✅ Should redirect to `/organizer/events` and show your dashboard**
6. **✅ Should see profile navigation and options**
7. **✅ No more 401 errors in console**

---

## 🔍 How to Verify the Fix

### Check 1: Environment Variables

```bash
# In production, verify JWT_SECRET is set
curl http://localhost:3000/api/health  # Or your health check endpoint
```

### Check 2: Browser DevTools

After logging in with Google:

1. **Open DevTools** (F12)
2. **Application → Cookies**
   - Should see `session_token` cookie
   - Domain: `.stepperslife.com`
   - HttpOnly: ✓
   - Secure: ✓ (if HTTPS)

3. **Console Tab**
   - Should see NO 401 errors
   - `/api/auth/me` should return 200 OK
   - `/api/auth/convex-token` should return 200 OK

4. **Network Tab**
   - Filter: `auth`
   - All auth endpoints should return 200 OK (not 401)

### Check 3: API Test

```bash
# After logging in, get your session_token from cookies
# Then test the /api/auth/me endpoint

curl -X GET https://events.stepperslife.com/api/auth/me \
  -H "Cookie: session_token=YOUR_TOKEN_HERE" \
  -v

# Should return 200 OK with user data
# Not 401 Unauthorized
```

---

## 📋 Deployment Checklist

Use this checklist when deploying to production:

- [ ] Generate secure JWT_SECRET (32+ characters)
- [ ] Add JWT_SECRET to production environment
- [ ] Add AUTH_SECRET to production environment (same value as JWT_SECRET)
- [ ] Verify NEXTAUTH_SECRET is also set (if used)
- [ ] Restart production application
- [ ] Clear browser cookies
- [ ] Test Google login flow
- [ ] Verify `/api/auth/me` returns 200 OK after login
- [ ] Verify `/api/auth/convex-token` returns 200 OK after login
- [ ] Verify dashboard loads and shows user profile
- [ ] Check browser console for no 401 errors
- [ ] Test logout and re-login

---

## 🔐 Security Notes

### Current Implementation

**✅ Secure**:
- HTTP-only cookies (JavaScript cannot access)
- Secure flag enabled (HTTPS only in production)
- SameSite: Lax (CSRF protection)
- 30-day token expiration
- Domain: `.stepperslife.com` (works across subdomains)

**⚠️ Recommendations**:
1. **Use different secrets per environment** (dev, staging, production)
2. **Rotate secrets periodically** (every 90 days)
3. **Store secrets in secure vault** (AWS Secrets Manager, etc.)
4. **Never commit secrets to git**
5. **Use strong secrets** (minimum 32 random characters)

### Environment Variable Priority

The system checks in this order:
1. `JWT_SECRET` (recommended)
2. `AUTH_SECRET` (alternative)
3. `NEXTAUTH_SECRET` (fallback for compatibility)
4. Development fallback (only if none set)

**Best Practice**: Set both `JWT_SECRET` and `AUTH_SECRET` to the same value.

---

## 🐛 If Issues Persist

### Issue: Still getting 401 errors

**Check**:
1. Environment variables loaded correctly
2. Application restarted after env changes
3. Browser cookies cleared
4. Using correct domain (not localhost in production)

**Debug**:
```bash
# Check server logs for JWT errors
pm2 logs

# Or Docker logs
docker-compose logs -f nextjs

# Look for:
# "[Auth /me] Verification error"
# "[Convex Token] Invalid session token"
```

### Issue: Cookie not being set

**Check**:
1. Domain setting in route (should be `.stepperslife.com` for production)
2. HTTPS is enabled (secure flag requires HTTPS)
3. No browser extensions blocking cookies
4. Cookies not disabled in browser

### Issue: Token created but verification fails

**Likely Cause**: JWT_SECRET mismatch

**Solution**:
```bash
# Verify all routes use the same secret
grep -r "JWT_SECRET\|AUTH_SECRET" app/api/auth/

# Should all import from lib/auth/jwt-secret.ts
grep -r "getJwtSecretEncoded" app/api/auth/
```

---

## 📊 Changes Summary

| File | Change | Status |
|------|--------|--------|
| `.env.local` | Added JWT_SECRET and AUTH_SECRET | ✅ |
| `lib/auth/jwt-secret.ts` | Created centralized secret management | ✅ |
| `app/api/auth/callback/google/route.ts` | Use centralized secret | ✅ |
| `app/api/auth/me/route.ts` | Use centralized secret | ✅ |
| `app/api/auth/convex-token/route.ts` | Use centralized secret | ✅ |
| `app/api/auth/login/route.ts` | Use centralized secret | ✅ |

---

## 🎯 Expected Behavior After Fix

### ✅ Success Flow

```
1. User visits: https://events.stepperslife.com/login
2. Clicks: "Continue with Google"
3. Redirects to: Google OAuth consent
4. User authenticates with Google
5. Google redirects to: /api/auth/callback/google?code=...&state=...
6. Server:
   - Validates state token ✅
   - Exchanges code for user info ✅
   - Creates/updates user in database ✅
   - Generates JWT with getJwtSecretEncoded() ✅
   - Sets session_token cookie ✅
7. Redirects to: /organizer/events
8. Browser loads dashboard:
   - Calls /api/auth/me ✅ 200 OK
   - Calls /api/auth/convex-token ✅ 200 OK
   - Shows user profile ✅
   - Shows navigation menu ✅
9. User is authenticated! ✅
```

### ❌ Previous Broken Flow (Fixed)

```
1-6. Same as above...
7. Redirects to: /organizer/events
8. Browser loads dashboard:
   - Calls /api/auth/me ❌ 401 (JWT secret mismatch)
   - Calls /api/auth/convex-token ❌ 401 (JWT secret mismatch)
   - No user profile ❌
   - No navigation menu ❌
9. Dashboard sees no auth → Redirects back to /login ❌
```

---

## 📞 Support

If you continue experiencing issues after applying this fix:

1. Check server logs for JWT verification errors
2. Verify environment variables are loaded correctly
3. Ensure application was restarted after env changes
4. Clear browser cookies and try again
5. Test with incognito/private browsing mode

---

**Fix Applied**: November 17, 2025
**Version**: 1.0.0
**Status**: ✅ Ready for Production Deployment
