# Manual Google OAuth Login Test

## 🔍 Current Status

Based on browser console logs, you're seeing:
- ❌ `GET /api/auth/me` - 401 Unauthorized
- ❌ `GET /api/auth/convex-token` - 401 Unauthorized

This is **expected behavior** when not logged in.

## ✅ Quick Manual Test

### Step 1: Test Google Login Button

1. **Navigate to login page**:
   ```
   https://events.stepperslife.com/login
   ```

2. **Look for the Google button**:
   - Should see "Continue with Google" button
   - Should have Google logo (colored G icon)
   - Should be near the top of the page

### Step 2: Click Google Login

1. **Click "Continue with Google"**

2. **What should happen**:
   ```
   Browser redirects to:
   → https://events.stepperslife.com/api/auth/google

   Then redirects to:
   → https://accounts.google.com/o/oauth2/v2/auth?
     client_id=325543338490-brk0cmodprdeto2sg19prjjlsc9dikrv.apps.googleusercontent.com
     &redirect_uri=https://events.stepperslife.com/api/auth/callback/google
     &response_type=code
     &scope=email%20profile
     &state=<random_token>
   ```

### Step 3: Authenticate with Google

1. **Select your Google account** or enter credentials

2. **Grant permissions** (if asked)

### Step 4: Verify Success

1. **After Google authentication, you should be redirected to**:
   ```
   https://events.stepperslife.com/organizer/events
   ```

2. **Check browser console** (F12 → Console):
   - Should see no more 401 errors
   - Should see successful `/api/auth/me` and `/api/auth/convex-token` calls

3. **Check cookies** (F12 → Application → Cookies):
   - Should see `auth-token` cookie set
   - Domain: `.stepperslife.com`
   - HttpOnly: ✓
   - Secure: ✓

## 🐛 Troubleshooting

### If Google OAuth screen doesn't appear:

1. **Check browser console for errors**
2. **Verify redirect URL**:
   - Should start with `https://accounts.google.com`

3. **Check network tab** (F12 → Network):
   - Look for `/api/auth/google` request
   - Should be 302 redirect

### If stuck on Google page:

1. **Check Google Cloud Console**:
   - OAuth client configured correctly
   - Authorized redirect URIs include:
     ```
     https://events.stepperslife.com/api/auth/callback/google
     ```

### If callback fails:

1. **Check URL parameters**:
   - Should have `code=...` and `state=...`

2. **Check browser console** for errors

3. **Check network tab**:
   - `/api/auth/callback/google` should process successfully

## 📊 Expected Network Flow

```
1. GET /login
   Status: 200

2. GET /api/auth/google
   Status: 302 → Redirect to Google
   Sets cookie: oauth_state

3. GET https://accounts.google.com/o/oauth2/v2/auth
   Status: 200 (Google's page)

4. POST https://accounts.google.com/... (Google login)
   Status: 302 → Redirect to callback

5. GET /api/auth/callback/google?code=...&state=...
   Status: 302 → Redirect to /organizer/events
   Sets cookie: auth-token

6. GET /organizer/events
   Status: 200 (logged in!)

7. GET /api/auth/me
   Status: 200 (returns user info)

8. GET /api/auth/convex-token
   Status: 200 (returns JWT)
```

## ✅ Success Indicators

After successful login:

1. **URL changes to**: `/organizer/events` or your callback URL
2. **No 401 errors** in console
3. **User menu** appears (if implemented)
4. **Can access protected routes** without redirect

## 🔐 Security Check

### Verify CSRF Protection:

1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Before clicking Google login, note there are no auth cookies
4. Click "Continue with Google"
5. **Check cookies again** - should see `oauth_state` cookie:
   ```
   Name: oauth_state
   Value: <random_hash>
   HttpOnly: ✓
   Secure: ✓
   SameSite: Lax
   ```
6. After successful login, should see `auth-token` cookie

## 🧪 Quick Browser Console Test

Open browser console and run:

```javascript
// Before login - should fail
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log);
// Expected: 401 Unauthorized

// After successful Google login - should work
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log);
// Expected: { user: { id, email, name, ... } }
```

## 📝 What to Report

If login fails, capture:

1. **Screenshot of error page**
2. **Browser console errors** (F12 → Console)
3. **Network requests** (F12 → Network → filter: auth)
4. **Current URL** when error occurs
5. **Cookies present** (F12 → Application → Cookies)

## 🎯 Expected vs Current State

### Current (Not Logged In):
```
✅ Login page loads
✅ Google button visible
❌ Not authenticated
❌ 401 errors on /api/auth/me
❌ 401 errors on /api/auth/convex-token
```

### After Successful Login:
```
✅ Login page loads
✅ Google button visible
✅ Authenticated with Google
✅ 200 OK on /api/auth/me
✅ 200 OK on /api/auth/convex-token
✅ auth-token cookie set
✅ Can access /organizer/events
```

## 🚀 Try It Now

**Quick Test URL**:
```
https://events.stepperslife.com/login
```

1. Click "Continue with Google"
2. Login with your Google account
3. Verify redirect to organizer dashboard
4. Check console for no 401 errors

---

**Note**: The 401 errors you're seeing are **normal** when not logged in. They indicate the auth system is working correctly - it's properly denying access to unauthenticated users.

To test the Google login, simply visit the login page and click the Google button!
