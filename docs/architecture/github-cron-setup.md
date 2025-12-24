# Toolbox Prompt: github-cron-setup

## Purpose
Use GitHub Actions for cron jobs instead of Vercel. Avoids Vercel Hobby plan limitations (2 crons max, daily frequency restrictions). GitHub Actions provides unlimited free cron jobs.

---

## The Prompt

```
TASK: Set Up GitHub Actions for Cron Jobs

CONTEXT:
I want to use GitHub Actions for scheduled cron jobs instead of Vercel. GitHub Actions provides unlimited free cron jobs with no frequency restrictions.

REQUIREMENTS:
1. If vercel.json has cron jobs, analyze and remove them (keep other settings)
2. Create a GitHub Actions workflow file at .github/workflows/cron-jobs.yml
3. Ensure any services that depend on environment variables at build time use lazy initialization
4. Push using the GitHub account that owns the repository (requires 'workflow' scope)

WORKFLOW FORMAT:
name: Scheduled Jobs

on:
  schedule:
    # Use cron syntax: minute hour day month weekday
    - cron: '*/15 * * * *'  # Every 15 minutes
    - cron: '0 3 * * *'      # Daily at 3am UTC
  workflow_dispatch: # Allow manual trigger for testing

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - name: Description
        run: |
          curl -s -X GET "https://YOUR_DOMAIN/api/cron/endpoint" || true

CRON SYNTAX REFERENCE:
- */15 * * * *  = Every 15 minutes
- 0 * * * *    = Every hour
- 0 */6 * * *  = Every 6 hours
- 0 0 * * *    = Daily at midnight UTC
- 0 3 * * *    = Daily at 3am UTC
- 0 0 * * 0    = Weekly on Sunday
- 0 0 1 * *    = Monthly on 1st

IMPORTANT NOTES:
- GitHub Actions requires 'workflow' scope on OAuth token to push workflow files
- Use 'gh auth login -h github.com -s repo,workflow -w' to add scope
- If push fails with "refusing to allow... without workflow scope", re-authenticate
- Always use '|| true' at end of curl to prevent job failure on API errors
- Use 'workflow_dispatch' to allow manual testing from GitHub Actions UI

LAZY INITIALIZATION PATTERN:
If services like Resend, SendGrid, etc. fail at build time because env vars aren't set:

// BAD - fails at build time
const client = new ServiceClient(process.env.API_KEY);

// GOOD - lazy initialization
const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not configured');
  }
  return new ServiceClient(process.env.API_KEY);
};

// Usage: getClient().method() instead of client.method()

VERIFICATION:
After setup, verify at: https://github.com/OWNER/REPO/actions

OUTPUT:
1. Created .github/workflows/cron-jobs.yml
2. If applicable, updated vercel.json (crons removed)
3. Fixed any lazy initialization issues
4. Pushed to GitHub using repo owner account and verified workflow appears in Actions tab
```

---

## Quick Reference

| Vercel Cron | GitHub Actions Equivalent |
|-------------|---------------------------|
| `0 * * * *` (hourly) | `cron: '0 * * * *'` |
| `0 0 * * *` (daily) | `cron: '0 0 * * *'` |
| Every 15 min (Pro only) | `cron: '*/15 * * * *'` (free!) |

---

## Benefits
- Unlimited cron jobs (free)
- No deployment blocking
- Manual trigger option
- Better logging in Actions UI
- Works with Vercel Hobby plan

---

## Example Workflow File

```yaml
name: Scheduled Jobs

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
    - cron: '0 3 * * *'      # Daily at 3am UTC
  workflow_dispatch:

jobs:
  appointment-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send appointment reminders
        run: |
          curl -s -X GET "https://example.com/api/cron/appointment-reminders" || true

  send-scheduled-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Process scheduled emails
        run: |
          curl -s -X GET "https://example.com/api/cron/send-scheduled-emails" || true

  cleanup-data:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 3 * * *'
    steps:
      - name: Cleanup expired data
        run: |
          curl -s -X GET "https://example.com/api/cron/cleanup" || true
```

---

## Troubleshooting

### Push fails with "workflow scope" error
```bash
gh auth login -h github.com -s repo,workflow -w
```

### Build fails due to missing env vars
Use lazy initialization pattern (see above)

### Cron not running
- Check Actions tab for errors
- Verify cron syntax at https://crontab.guru
- Note: GitHub may delay cron runs during high load periods
