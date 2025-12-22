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
- Convex Dashboard: https://dashboard.convex.dev/d/prod:expert-vulture-775
- GitHub: https://github.com/stepperslife/stepperslife

## Tech Stack Quick Reference
- **Framework**: Next.js 15 (App Router)
- **Database**: Convex (real-time backend)
- **Auth**: Custom JWT with RSA keys
- **Styling**: Tailwind CSS + shadcn/ui
- **Payments**: Stripe
- **Email**: Resend
- **Hosting**: Vercel
