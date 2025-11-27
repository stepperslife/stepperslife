# Manual Test User Setup Guide

Since automated user creation requires authentication, please create test users manually:

## Option 1: Quick Setup (Use Existing Users)

If you already have users in the system, you can test with them. Just update the credentials in `tests/setup-test-users.ts`.

## Option 2: Create Test Users Manually

### 1. Admin User
```
Email: admin-test@stepperslife.com
Password: AdminTest123!

1. Go to http://localhost:3004/api/auth/register
2. POST:
{
  "name": "Admin Test User",
  "email": "admin-test@stepperslife.com",
  "password": "AdminTest123!"
}
3. Then update role to "admin" via Convex dashboard
```

### 2. Organizer User
```
Email: organizer-test@stepperslife.com
Password: OrganizerTest123!

1. Go to http://localhost:3004/api/auth/register
2. POST:
{
  "name": "Organizer Test User",
  "email": "organizer-test@stepperslife.com",
  "password": "OrganizerTest123!"
}
(Default role is organizer - no update needed)
```

### 3. Regular User
```
Email: user-test@stepperslife.com
Password: UserTest123!

1. Go to http://localhost:3004/api/auth/register
2. POST:
{
  "name": "User Test Account",
  "email": "user-test@stepperslife.com",
  "password": "UserTest123!"
}
3. Update role to "user" via Convex dashboard
```

### 4 & 5. Staff and Team Member

These require an event to be created first:

1. Login as organizer-test@stepperslife.com
2. Create a test event
3. Add staff members via organizer dashboard
4. Use emails: staff-test@stepperslife.com, team-test@stepperslife.com

## Option 3: Skip User Creation, Test With Browser

Run the tests with headful mode to manually login:

```bash
npx playwright test --headed --debug
```

This will open the browser and pause at each test. You can manually:
1. Login with any credentials
2. Navigate to the dashboard
3. Let the test take screenshots
