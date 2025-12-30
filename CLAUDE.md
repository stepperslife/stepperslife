# SteppersLife Project - Claude Code Instructions

## MCP Usage Rules

### Browser Automation (Puppeteer MCP)
Use the Puppeteer MCP for:
- Testing live site functionality at https://stepperslife.com
- Taking screenshots of pages for visual verification
- Automating form submissions during testing
- Verifying responsive layouts across viewports
- Debugging frontend issues in real browser context

### Chrome DevTools MCP
Use Chrome DevTools MCP for:
- Inspecting network requests and API responses
- Debugging JavaScript errors in console
- Analyzing performance metrics
- Checking element styles and layout issues
- Monitoring WebSocket connections (Convex real-time)

### Playwright MCP
Use Playwright MCP for:
- Running end-to-end tests
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile viewport testing
- Automated regression testing
- Screenshot comparisons

### Convex MCP
Use Convex MCP for:
- Querying tables and data in the self-hosted Convex instance
- Running read-only queries against the database
- Checking function specs and logs
- Managing environment variables
- Viewing deployment status

### Context7 MCP
Use Context7 MCP for:
- Looking up Convex documentation
- Next.js API reference
- Tailwind CSS utilities
- shadcn/ui component docs
- Any library documentation lookup

### Sequential Thinking MCP
Use Sequential Thinking MCP for:
- Complex multi-step problem solving
- Architectural decisions
- Debugging complex issues
- Planning large features

### Memory MCP
Use Memory MCP for:
- Storing project-specific context
- Remembering user preferences
- Tracking recurring issues/solutions
- Persisting knowledge across sessions

### IDE MCP (VS Code)
Use IDE MCP for:
- Getting TypeScript/ESLint diagnostics before deployment
- Executing code in Jupyter notebooks
- Checking for errors across the codebase

## Project-Specific Rules

### Deployment
- Always deploy to production (no local development)
- Use Convex deploy key: `CONVEX_DEPLOY_KEY='prod:expert-vulture-775|...'`
- Push to main branch for Vercel auto-deploy
- Verify builds pass before pushing

### Testing
- Run Playwright tests with: `npx playwright test`
- Use Puppeteer MCP for live site verification
- Test on https://stepperslife.com after deployment

### Database Operations
- Use Convex CLI for database queries: `npx convex run --no-push`
- Never delete production data without explicit confirmation
- Always check logs after mutations: `npx convex logs`

### Code Quality
- Run `npm run build` before committing
- Check TypeScript errors with `npx tsc --noEmit`
- Use ESLint auto-fix: `npm run lint -- --fix`

## Key URLs
- Production: https://stepperslife.com
- Convex Backend (Self-Hosted): https://convex.toolboxhosting.com
- Convex Dashboard (Self-Hosted): https://convex-dashboard.toolboxhosting.com
- GitHub: https://github.com/stepperslife/stepperslife

## Self-Hosted Convex Configuration
- **Backend URL**: https://convex.toolboxhosting.com
- **Dashboard URL**: https://convex-dashboard.toolboxhosting.com
- **Admin Key**: convex-self-hosted|018c7b48e18cbc911401e58fa631d48dc57329a6bb7bdab63ddc04afc7e0a2bdf6e1a6345e
- **Coolify Service UUID**: ygcsk808ss80844kwgk8444k
- **Backend Container**: backend-ygcsk808ss80844kwgk8444k
- **Dashboard Container**: dashboard-ygcsk808ss80844kwgk8444k

## Tech Stack Quick Reference
- **Framework**: Next.js 15 (App Router)
- **Database**: Convex (self-hosted on 72.60.28.175)
- **Auth**: Custom JWT with RSA keys
- **Styling**: Tailwind CSS + shadcn/ui
- **Payments**: Stripe
- **Email**: Postal (self-hosted on postal.toolboxhosting.com) + Mailcow (mailboxes)
- **Hosting**: Coolify (self-hosted on 72.60.28.175)

# Infrastructure Migration - CRITICAL

## Deployment Platform: COOLIFY ONLY
- **ALL websites are migrating from Docker to Coolify**
- **NOT using Vercel** - Coolify handles everything
- **NEVER create Docker containers directly** - always go through Coolify
- Coolify is the central deployment and management system

## Coolify Best Practices
1. All applications managed via Coolify dashboard (http://72.60.28.175:8000)
2. Use Coolify's built-in features: SSL, domains, environment variables, health checks
3. Deploy via Coolify UI or API - never  or 
4. Let Coolify handle container lifecycle, networking, and reverse proxy (Traefik)
5. Store sources in /opt/ directories for local deployments
6. Use Coolify's environment variable management for secrets

## Server Details
- **VPS**: 72.60.28.175
- **Coolify Dashboard**: http://72.60.28.175:8000
- **Coolify manages**: All web applications, databases, services
