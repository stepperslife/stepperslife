# 🔧 Google OAuth Login Fix

## Issue
Google OAuth sign-in is rejecting authentication attempts.

## Root Cause
The redirect URI `http://localhost:3004/api/auth/callback/google` needs to be registered in Google Cloud Console.

---

## ✅ SOLUTION: Register Redirect URI in Google Cloud Console

### Step 1: Open Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Sign in with the Google account that owns the OAuth client

### Step 2: Navigate to OAuth Credentials
1. Click on the project dropdown (top left)
2. Select your project
3. Go to: **APIs & Services** > **Credentials**

### Step 3: Find Your OAuth Client ID
- **Client ID:** `325543338490-brk0cmodprdeto2sg19prjjlsc9dikrv.apps.googleusercontent.com`

### Step 4: Add Authorized Redirect URI
1. Click on the OAuth 2.0 Client ID
2. Scroll to **Authorized redirect URIs**
3. Click **+ ADD URI**
4. Enter: `http://localhost:3004/api/auth/callback/google`
5. Click **SAVE**

### Step 5: Verify Current Redirect URIs
Make sure you have these redirect URIs registered:
- `http://localhost:3000/api/auth/callback/google` (existing)
- `http://localhost:3004/api/auth/callback/google` (add this)
- Any production URLs (e.g., `https://events.stepperslife.com/api/auth/callback/google`)

---

## 🧪 Test After Fix

### Test Google OAuth Login
1. Go to: http://localhost:3004/login
2. Click "Continue with Google"
3. You should be redirected to Google sign-in
4. After signing in, you should be redirected back to the app

### Test With Test Accounts
- **Organizer:** thestepperslife@gmail.com
- **Customer:** appvillagellc@gmail.com
- **Team Member:** taxgenius.tax@gmail.com

---

## 🔍 Troubleshooting

### If still getting rejected:
1. **Clear browser cookies** for localhost:3004
2. **Wait 1-2 minutes** after saving redirect URI (Google needs time to propagate changes)
3. **Try incognito/private browser window**
4. **Check server logs** for specific error messages

### Check Server Logs
```bash
# Look for OAuth errors in server output
# Common errors:
# - "redirect_uri_mismatch"
# - "invalid_state"
# - "Failed to exchange code for token"
```

### Alternative: Use Magic Link
While fixing OAuth, you can use Magic Link authentication:
1. Go to http://localhost:3004/login
2. Enter email address
3. Click "Send Magic Link"
4. Check email inbox for sign-in link

---

## 📝 Current Configuration

**Environment Variables (.env.local):**
```
AUTH_GOOGLE_CLIENT_ID=325543338490-brk0cmodprdeto2sg19prjjlsc9dikrv.apps.googleusercontent.com
AUTH_GOOGLE_CLIENT_SECRET=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
NEXTAUTH_URL=http://localhost:3004
```

**OAuth Flow:**
1. User clicks "Continue with Google" → `/api/auth/google`
2. Redirected to Google OAuth consent screen
3. After consent, Google redirects to → `/api/auth/callback/google`
4. Callback creates session and redirects to app

---

## ⚠️ Common Errors

### Error: "redirect_uri_mismatch"
**Cause:** Redirect URI not registered in Google Cloud Console
**Fix:** Add `http://localhost:3004/api/auth/callback/google` to authorized redirect URIs

### Error: "invalid_state"
**Cause:** CSRF protection state mismatch (usually due to expired cookie)
**Fix:** Clear cookies and try again

### Error: "Failed to exchange code for token"
**Cause:** Invalid client secret or client ID
**Fix:** Verify credentials in `.env.local` match Google Cloud Console

---

## ✅ Quick Fix Summary

1. **Go to:** https://console.cloud.google.com/apis/credentials
2. **Edit OAuth Client ID**
3. **Add redirect URI:** `http://localhost:3004/api/auth/callback/google`
4. **Save** and wait 1-2 minutes
5. **Test:** http://localhost:3004/login → Click "Continue with Google"

---

**Last Updated:** November 17, 2025
**Status:** Waiting for Google Cloud Console configuration
