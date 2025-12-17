# Google OAuth Testing Guide

Complete testing suite for Google OAuth authentication flow in SteppersLife Events platform.

## 📋 Overview

This guide provides comprehensive instructions for testing the Google OAuth login functionality using:

- ✅ **Playwright** - E2E browser automation
- ✅ **Puppeteer** - Advanced browser automation with screenshots & PDFs
- ✅ **Thunder Client** - API endpoint testing
- ✅ **Chrome DevTools** - Network & console monitoring (integrated)

## 🏗️ Architecture

### Google OAuth Flow

```
User clicks "Continue with Google"
    ↓
GET /api/auth/google
    ├─ Generate CSRF state token
    ├─ Store in HTTP-only cookie
    └─ Redirect to Google OAuth URL
    ↓
User authenticates with Google
    ↓
GET /api/auth/callback/google?code=...&state=...
    ├─ Validate CSRF state
    ├─ Exchange code for access token
    ├─ Get user info from Google API
    ├─ Call Convex: upsertUserFromGoogle()
    ├─ Create JWT session token
    ├─ Set secure session cookie
    └─ Redirect to /organizer/events
    ↓
User is authenticated
```

## 📁 Test Files

### Playwright Tests
- **File**: `tests/google-oauth-login.spec.ts`
- **Tests**: 10 comprehensive tests + 3 error handling tests
- **Coverage**:
  - Google button visibility
  - OAuth flow initiation
  - CSRF protection
  - Callback handling
  - Session management
  - Endpoint accessibility
  - Performance metrics
  - Error scenarios

### Puppeteer Tests
- **File**: `tests/google-oauth-puppeteer.ts`
- **Features**:
  - Full-page screenshots
  - PDF generation
  - Detailed network logging
  - Console log capture
  - Performance metrics
  - Cookie inspection
  - Error state capture

### Thunder Client API Tests
- **File**: `thunder-tests/google-oauth-api-tests.json`
- **Endpoints**:
  1. GET `/api/auth/google` - Initiate OAuth
  2. GET `/api/auth/callback/google` - OAuth callback
  3. GET `/api/auth/me` - Get current user
  4. GET `/api/auth/convex-token` - Get Convex JWT
  5. POST `/api/auth/logout` - Logout
  6. GET `/login` - Login page
  7. GET `/organizer/events` - Protected route (unauthenticated)
  8. GET `/organizer/events` - Protected route (authenticated)

## 🚀 Quick Start

### Prerequisites

```bash
cd src/events-stepperslife
npm install
```

### Run All Tests

```bash
chmod +x RUN-GOOGLE-OAUTH-TESTS.sh
./RUN-GOOGLE-OAUTH-TESTS.sh
```

### Run Specific Tests

```bash
# Playwright only
./RUN-GOOGLE-OAUTH-TESTS.sh --playwright-only

# Puppeteer only
./RUN-GOOGLE-OAUTH-TESTS.sh --puppeteer-only

# Individual test file
npx playwright test tests/google-oauth-login.spec.ts

# Run Puppeteer manually
npx ts-node tests/google-oauth-puppeteer.ts
```

## 🔧 Configuration

### Environment Variables

Required in `.env.local`:

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://events.stepperslife.com
NEXTAUTH_SECRET=your-secret-key

# Google OAuth Credentials
AUTH_GOOGLE_CLIENT_ID=325543338490-brk0cmodprdeto2sg19prjjlsc9dikrv.apps.googleusercontent.com
AUTH_GOOGLE_CLIENT_SECRET=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

# Optional: For automated OAuth testing
GOOGLE_TEST_EMAIL=test@example.com
GOOGLE_TEST_PASSWORD=YourTestPassword
```

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://events.stepperslife.com/api/auth/callback/google`
   - `http://localhost:3004/api/auth/callback/google` (for local testing)
6. Configure OAuth consent screen
7. Add test users (for testing mode)

## 📊 Test Reports

### Playwright Reports

After running tests:

```bash
# View HTML report
npx playwright show-report test-results/html-report
```

**Generated Files**:
- `test-results/html-report/index.html` - Interactive HTML report
- `test-results/screenshots/*.png` - Test screenshots
- `test-results/google-oauth-network-logs.json` - Network requests
- `test-results/google-oauth-console-logs.json` - Browser console logs
- `test-results/google-oauth-performance-metrics.json` - Performance data
- `test-results/google-oauth-endpoints.json` - Endpoint availability

### Puppeteer Reports

**Generated Files**:
- `test-results/puppeteer-screenshots/*.png` - Detailed screenshots
- `test-results/puppeteer-pdfs/*.pdf` - PDF captures
- `test-results/puppeteer-logs/network-logs.json` - Network activity
- `test-results/puppeteer-logs/console-logs.json` - Console output
- `test-results/puppeteer-logs/performance-metrics.json` - Performance data
- `test-results/puppeteer-logs/test-summary.json` - Test summary
- `test-results/puppeteer-logs/cookies.json` - Cookie inspection

### Thunder Client

1. Open VSCode
2. Install Thunder Client extension
3. Import `thunder-tests/google-oauth-api-tests.json`
4. Select environment (Production/Local)
5. Run individual requests or entire collection

## 🧪 Test Scenarios

### 1. Google Button Visibility
✅ Verifies "Continue with Google" button exists and is visible

### 2. OAuth Flow Initiation
✅ Validates redirect to `/api/auth/google`
✅ Checks state cookie creation
✅ Monitors network requests

### 3. CSRF Protection
✅ Validates state parameter generation
✅ Checks HTTP-only cookie security
✅ Verifies state validation in callback

### 4. OAuth Callback
✅ Tests callback route handling
✅ Validates code exchange process
✅ Checks user creation/update

### 5. Session Management
✅ Verifies session cookie creation
✅ Tests cookie security (HttpOnly, Secure, SameSite)
✅ Validates session persistence

### 6. Protected Routes
✅ Tests access without authentication (should redirect)
✅ Tests access with valid session (should allow)

### 7. Performance Metrics
✅ Measures page load times
✅ Tracks OAuth flow timing
✅ Monitors resource loading

### 8. Error Handling
✅ Invalid state parameter
✅ Missing authorization code
✅ User cancels OAuth

## 🔍 Debugging

### Enable Playwright UI Mode

```bash
npx playwright test tests/google-oauth-login.spec.ts --ui
```

### Enable Playwright Debug Mode

```bash
PWDEBUG=1 npx playwright test tests/google-oauth-login.spec.ts
```

### Enable Puppeteer Headful Mode

Edit `tests/google-oauth-puppeteer.ts`:

```typescript
headless: false  // Already set to false for debugging
```

### Check Logs

```bash
# View network logs
cat test-results/puppeteer-logs/network-logs.json | jq

# View console logs
cat test-results/puppeteer-logs/console-logs.json | jq

# View test summary
cat test-results/puppeteer-logs/test-summary.json | jq
```

## 🔐 Security Checklist

The tests verify:

- ✅ CSRF protection with state parameter
- ✅ HTTP-only cookies
- ✅ Secure cookie flag (production)
- ✅ SameSite cookie attribute
- ✅ Session token expiration (30 days)
- ✅ Proper domain configuration
- ✅ Protected route authorization

## 🐛 Common Issues

### Issue: Google OAuth consent screen doesn't appear

**Solution**: Tests mock the OAuth flow without actual Google interaction. For full integration testing, use real Google test accounts.

### Issue: ECONNREFUSED errors

**Solution**: Ensure the app is running:
```bash
npm run dev
```

### Issue: Missing screenshots

**Solution**: Check directory permissions:
```bash
mkdir -p test-results/screenshots
chmod 755 test-results
```

### Issue: Puppeteer fails to launch

**Solution**: Install dependencies:
```bash
# macOS
brew install chromium

# Ubuntu/Debian
apt-get install chromium-browser
```

## 📈 Interpreting Results

### Success Indicators
- ✅ All tests passing
- ✅ OAuth redirect to Google detected
- ✅ State cookie properly set
- ✅ No console errors
- ✅ Performance metrics < 3s for page loads

### Warning Signs
- ⚠️ Missing environment variables
- ⚠️ 4xx/5xx status codes
- ⚠️ Console errors
- ⚠️ Missing security cookies
- ⚠️ Slow performance (>5s)

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Google OAuth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run OAuth tests
        run: ./RUN-GOOGLE-OAUTH-TESTS.sh
        env:
          NEXTAUTH_URL: ${{ secrets.NEXTAUTH_URL }}
          AUTH_GOOGLE_CLIENT_ID: ${{ secrets.AUTH_GOOGLE_CLIENT_ID }}
          AUTH_GOOGLE_CLIENT_SECRET: ${{ secrets.AUTH_GOOGLE_CLIENT_SECRET }}
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## 📚 Related Documentation

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Playwright Documentation](https://playwright.dev)
- [Puppeteer Documentation](https://pptr.dev)
- [Thunder Client Documentation](https://www.thunderclient.com/docs)

## 🤝 Contributing

To add new tests:

1. Add test cases to `tests/google-oauth-login.spec.ts`
2. Update `tests/google-oauth-puppeteer.ts` for additional monitoring
3. Add API tests to `thunder-tests/google-oauth-api-tests.json`
4. Update this guide with new test scenarios

## 📞 Support

For issues or questions:
- Check test logs in `test-results/`
- Review screenshots for visual debugging
- Examine network logs for API issues
- Verify environment configuration

---

**Last Updated**: 2025-11-17
**Version**: 1.0.0
**Status**: ✅ Production Ready
