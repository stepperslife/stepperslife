# Claude Code Memory - SteppersLife Project

## Convex Deployment IDs

| Environment | Deployment ID | URL |
|------------|---------------|-----|
| **Production** | `expert-vulture-775` | https://expert-vulture-775.convex.cloud |
| **Development** | `fearless-dragon-613` | https://fearless-dragon-613.convex.cloud |

## Deploy Commands

### Production Deploy
```bash
CONVEX_DEPLOYMENT=prod:expert-vulture-775 npx convex deploy -y
```

### Development Deploy
```bash
CONVEX_DEPLOYMENT=dev:fearless-dragon-613 npx convex deploy -y
```

## Important Notes

- The `.env.local` file may contain `neighborly-swordfish-681` but this is **NOT** the correct production deployment
- Always use `expert-vulture-775` for production deployments
- Vercel auto-deploys frontend from the `main` branch
- Production URL: https://stepperslife.com

## Project Structure

- Main repo: `/Users/stepperslife/src/stepperslife`
- Worktree: `/Users/bobbygwatkins/.claude-worktrees/stepperslife/upbeat-snyder`
