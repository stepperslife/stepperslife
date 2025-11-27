# ⚡ PRODUCTION DEPLOYMENT - DO THIS NOW

## 🎯 Critical Fix Applied - Deploy to Production

Your Google OAuth login was broken due to JWT secret mismatch. **The code is now fixed**, but you need to update production environment.

---

## 📋 3-Step Production Deployment

### Step 1: Generate Secure Secret (30 seconds)

Run on your production server:

```bash
openssl rand -base64 32
```

Copy the output (looks like: `K3x9mP2qR8nV5wY7bL4cT6gF1hN0jS9dM`)

### Step 2: Update Production Environment (1 minute)

**Find your production .env file** (one of these locations):
- `/path/to/stepperslife-v2-docker/src/events-stepperslife/.env`
- `/path/to/stepperslife-v2-docker/src/events-stepperslife/.env.production`
- PM2 ecosystem file
- Docker environment config

**Add these lines** (use the secret you generated in Step 1):

```bash
JWT_SECRET=<paste-your-generated-secret-here>
AUTH_SECRET=<paste-same-secret-again>
```

**Example**:
```bash
JWT_SECRET=K3x9mP2qR8nV5wY7bL4cT6gF1hN0jS9dM
AUTH_SECRET=K3x9mP2qR8nV5wY7bL4cT6gF1hN0jS9dM
```

### Step 3: Restart Production (1 minute)

```bash
# Navigate to your project
cd /path/to/stepperslife-v2-docker/src/events-stepperslife

# Build (if needed)
npm run build

# Restart with PM2
pm2 restart all

# OR restart with Docker
docker-compose restart nextjs

# Verify it restarted
pm2 status
# OR
docker-compose ps
```

---

## ✅ Test It Works

1. **Clear your browser cookies** for `events.stepperslife.com`
   - Chrome: DevTools (F12) → Application → Cookies → Delete all

2. **Visit**: https://events.stepperslife.com/login

3. **Click**: "Continue with Google"

4. **Login** with your Google account

5. **✅ SUCCESS** if you:
   - Land on `/organizer/events` (your dashboard)
   - See profile navigation menu
   - See NO 401 errors in console (F12 → Console)

6. **❌ STILL BROKEN** if you:
   - Get redirected back to `/login`
   - See 401 errors in console
   - Don't see profile navigation

---

## 🐛 If It Doesn't Work

### Check 1: Environment Variables Loaded

```bash
# SSH into production server
# Check if JWT_SECRET is set
node -e "console.log('JWT_SECRET:', process.env.JWT_SECRET)"

# If it says "undefined", env vars not loaded
# Make sure you restarted the app after adding them
```

### Check 2: Server Logs

```bash
# PM2 logs
pm2 logs --lines 50

# Docker logs
docker-compose logs -f nextjs --tail=50

# Look for JWT errors:
# "[Auth /me] Verification error"
# "[Convex Token] Invalid session token"
```

### Check 3: Browser Console

After clicking Google login, check browser console (F12):

**Good** (working):
```
GET /api/auth/me → 200 OK
GET /api/auth/convex-token → 200 OK
```

**Bad** (still broken):
```
GET /api/auth/me → 401 Unauthorized
GET /api/auth/convex-token → 401 Unauthorized
```

---

## 📞 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Still getting 401 errors | Verify JWT_SECRET is in production .env AND restart was successful |
| Can't find .env file | Check PM2 ecosystem config or Docker environment section |
| Server won't restart | Check logs: `pm2 logs` or `docker-compose logs` |
| Works locally, not production | Production .env missing JWT_SECRET (different from .env.local) |

---

## 🎯 What Changed (for your reference)

### Files Modified:
1. `.env.local` - Added JWT_SECRET and AUTH_SECRET
2. `lib/auth/jwt-secret.ts` - NEW centralized secret manager
3. `app/api/auth/callback/google/route.ts` - Updated to use centralized secret
4. `app/api/auth/me/route.ts` - Updated to use centralized secret
5. `app/api/auth/convex-token/route.ts` - Updated to use centralized secret
6. `app/api/auth/login/route.ts` - Updated to use centralized secret

### Why This Fixes It:
**Before**: Different routes used different fallback secrets → JWT verification failed
**After**: All routes use same centralized secret → JWT verification succeeds

---

## ⏱️ Estimated Time

- **Step 1** (Generate secret): 30 seconds
- **Step 2** (Update .env): 1 minute
- **Step 3** (Restart): 1 minute
- **Testing**: 2 minutes

**Total: ~5 minutes**

---

## 📱 Quick Copy-Paste Commands

```bash
# 1. Generate secret
SECRET=$(openssl rand -base64 32)
echo "Your JWT_SECRET: $SECRET"

# 2. Add to production .env (edit path to your .env file)
echo "JWT_SECRET=$SECRET" >> .env.production
echo "AUTH_SECRET=$SECRET" >> .env.production

# 3. Restart
npm run build && pm2 restart all
# OR
docker-compose down && docker-compose up -d

# 4. Verify
pm2 status
# OR
docker-compose ps
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Generated secure JWT_SECRET (32+ characters)
- [ ] Added JWT_SECRET to production .env
- [ ] Added AUTH_SECRET to production .env (same value)
- [ ] Restarted production application
- [ ] Cleared browser cookies
- [ ] Tested Google login
- [ ] Successfully redirected to dashboard
- [ ] No 401 errors in console
- [ ] Profile navigation visible

---

**Status**: Ready to Deploy
**Time Required**: 5 minutes
**Risk Level**: Low (only adds missing env vars, all code changes are backward compatible)

**🚀 GO AHEAD AND DEPLOY NOW!**
