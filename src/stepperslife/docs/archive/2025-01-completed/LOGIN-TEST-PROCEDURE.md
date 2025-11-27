# Login/Logout Test Procedure

**Date:** 2025-11-14
**Test Objective:** Verify login/logout functionality works correctly after authentication fixes
**Tester:** Manual testing required

---

## Test Credentials

**Test Account:**
- Email: `bobby@stepperslife.com`
- Password: `admin123`

---

## Test Cycle 1

### Step 1: Initial State
1. Open https://events.stepperslife.com
2. **VERIFY:** Header shows "Sign In" button
3. **VERIFY:** Not logged in (no user profile visible)

### Step 2: Login
1. Click "Sign In" button
2. Scroll down and expand "Sign in with password" section
3. Enter email: `bobby@stepperslife.com`
4. Enter password: `admin123`
5. Click "Sign In"

### Step 3: Post-Login Verification
1. **VERIFY:** Redirected to homepage
2. **VERIFY:** Header now shows user profile (bobby@stepperslife.com)
3. **VERIFY:** Header shows "Sign Out" option (NOT "Sign In")
4. **VERIFY:** No console errors related to CSP or WebSocket
5. **VERIFY:** Page background is white/light (light theme)

### Step 4: Logout
1. Click on user profile dropdown
2. Click "Sign Out"

### Step 5: Post-Logout Verification
1. **VERIFY:** Redirected to homepage
2. **VERIFY:** Header shows "Sign In" button again
3. **VERIFY:** User profile no longer visible

---

## Test Cycle 2

Repeat all steps from Cycle 1 to ensure consistency.

---

## Test Cycle 3

Repeat all steps from Cycle 1 to ensure consistency.

---

## Light Theme Color Verification

After successful login, verify these elements are showing light theme colors:

### Homepage Elements
- [ ] Background: White (#FFFFFF or similar light color)
- [ ] Header: Light background (not dark)
- [ ] Text: Dark text on light background (good contrast)
- [ ] Buttons: Primary blue color (#0066CC or similar)
- [ ] Cards/Sections: Light gray backgrounds (#F5F5F5 or similar)

### Specific Color Checks
- [ ] NO purple/violet colors (should be blue/primary)
- [ ] NO dark mode backgrounds (no dark gray/black)
- [ ] NO white text on dark backgrounds

---

## Expected Results

### ✅ Pass Criteria
- All 3 login/logout cycles complete without errors
- Header updates correctly after login (shows "Sign Out")
- Header updates correctly after logout (shows "Sign In")
- No CSP violations in browser console
- No WebSocket connection errors
- Light theme colors displaying throughout

### ❌ Fail Criteria
- Login fails or shows error
- Header doesn't update after login
- CSP errors in console
- WebSocket connection blocked
- Dark theme colors showing

---

## Browser Console Checks

Open browser DevTools (F12) and check Console tab:

### Should NOT See:
- ❌ CSP violation errors
- ❌ WebSocket connection blocked
- ❌ 401 errors after successful login
- ❌ Cookie-related errors

### May See (Normal):
- ✅ 401 errors BEFORE login (expected)
- ✅ Normal Next.js hydration messages

---

## Test Results

### Cycle 1
- Login: ⬜ Pass / ⬜ Fail
- Header Update: ⬜ Pass / ⬜ Fail
- Logout: ⬜ Pass / ⬜ Fail
- Light Theme: ⬜ Pass / ⬜ Fail

### Cycle 2
- Login: ⬜ Pass / ⬜ Fail
- Header Update: ⬜ Pass / ⬜ Fail
- Logout: ⬜ Pass / ⬜ Fail
- Light Theme: ⬜ Pass / ⬜ Fail

### Cycle 3
- Login: ⬜ Pass / ⬜ Fail
- Header Update: ⬜ Pass / ⬜ Fail
- Logout: ⬜ Pass / ⬜ Fail
- Light Theme: ⬜ Pass / ⬜ Fail

---

## Notes

Document any issues encountered:

---

## Overall Result

⬜ **PASS** - All tests passed
⬜ **FAIL** - Issues found (document above)

**Tester Signature:** ________________
**Date/Time:** ________________
