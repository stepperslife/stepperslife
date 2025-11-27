# How to Open SteppersLife Events in Cursor

## Quick Start

### Option 1: Open from Terminal (Recommended)
```bash
cd /Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife
cursor .
```

### Option 2: Open from Cursor Menu
1. Open Cursor
2. Click **File → Open Folder**
3. Navigate to: `/Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife`
4. Click **Open**

---

## 🎯 WHERE TO OPEN THE PROJECT

**CORRECT PATH:**
```
/Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife
```

**WHY THIS PATH?**
- This is the Next.js application root
- Contains `package.json` and all source code
- Has proper TypeScript configuration
- Cursor will recognize it as a Next.js project

---

## 📁 PROJECT STRUCTURE

```
stepperslife-v2-docker/
├── docker-compose.yml          # Docker orchestration
├── .env                        # Root environment variables
├── src/
│   └── events-stepperslife/    👈 OPEN THIS IN CURSOR
│       ├── app/                # Next.js 16 app directory
│       ├── components/         # React components
│       ├── convex/            # Convex backend functions
│       ├── lib/               # Utility libraries
│       ├── public/            # Static assets
│       ├── tests/             # Playwright tests
│       ├── .env.local         # App environment variables
│       ├── package.json       # Dependencies
│       ├── tsconfig.json      # TypeScript config
│       └── next.config.ts     # Next.js config
```

---

## ⚙️ CURSOR SETUP AFTER OPENING

### 1. Install Extensions (Recommended)
Cursor will likely auto-suggest these, but if not:
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Prisma** - Database schema support (if using Prisma)

### 2. Configure Cursor Settings
Create or update `.vscode/settings.json` in the project:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/.git": true
  }
}
```

### 3. Trust the Workspace
When Cursor asks "Do you trust the authors of the files in this folder?", click **Yes, I trust the authors**.

---

## 🚀 WORKING WITH THE PROJECT IN CURSOR

### Start Development Server
1. Open integrated terminal: `` Ctrl+` `` (or `Cmd+` on Mac)
2. Run:
   ```bash
   npm run dev
   ```
3. App runs at: http://localhost:3004

### Key Folders to Know

**Frontend (Next.js App):**
```
app/
├── (customer)/          # Public-facing pages
│   ├── page.tsx        # Homepage
│   ├── events/         # Event listings
│   ├── tickets/        # User tickets
│   └── checkout/       # Checkout flow
├── (organizer)/        # Organizer dashboard
│   └── events/         # Event management
├── api/                # API routes
│   ├── auth/          # Authentication
│   ├── checkout/      # Payment processing
│   └── webhooks/      # Payment webhooks
└── layout.tsx         # Root layout
```

**Backend (Convex Functions):**
```
convex/
├── auth.config.ts      # Auth configuration
├── public/
│   └── queries.ts      # Public event queries
├── tickets/
│   ├── queries.ts      # Ticket queries
│   └── mutations.ts    # Ticket mutations
├── events/
│   ├── queries.ts      # Event queries
│   └── mutations.ts    # Event mutations
└── schema.ts           # Database schema
```

**Components:**
```
components/
├── checkout/           # Checkout components
│   ├── SquareCardPayment.tsx
│   ├── CashAppPayment.tsx
│   └── StripeCheckout.tsx
├── layout/            # Layout components
│   ├── PublicHeader.tsx
│   └── PublicFooter.tsx
└── seating/           # Seating chart
    └── InteractiveSeatingChart.tsx
```

---

## 🤖 USING CURSOR AI

### 1. Ask Questions About the Code
**Examples:**
- "How does the ticket purchase flow work?"
- "Show me where Square payment processing happens"
- "Explain the Convex schema for events"
- "How are QR codes generated for tickets?"

### 2. Edit Code with AI
Select code and press `Cmd+K` (or `Ctrl+K`) to:
- "Add error handling to this function"
- "Refactor this to use async/await"
- "Add TypeScript types to this component"
- "Optimize this database query"

### 3. Generate New Code
In the chat:
- "Create a new component for displaying event stats"
- "Write a Convex mutation to update event status"
- "Generate a test for the ticket purchase flow"

### 4. Find Issues
- "Find all TODO comments in the codebase"
- "Check for security vulnerabilities in authentication"
- "Find unused imports"
- "Identify performance bottlenecks"

---

## 🔍 NAVIGATING THE CODEBASE IN CURSOR

### Quick File Navigation
- `Cmd+P` (or `Ctrl+P`) - Quick file search
  - Type: `events/page` to find events page
  - Type: `SquareCard` to find Square payment component
  - Type: `schema` to find Convex schema

### Search Across Files
- `Cmd+Shift+F` (or `Ctrl+Shift+F`) - Search in all files
  - Search for: `SQUARE_ACCESS_TOKEN` to find payment config
  - Search for: `createOrder` to find order creation logic
  - Search for: `QR` to find QR code generation

### Go to Definition
- `Cmd+Click` (or `F12`) - Jump to function definition
- `Cmd+Shift+O` - Search symbols in current file

---

## 🐛 DEBUGGING IN CURSOR

### 1. Set Breakpoints
- Click in the gutter (left of line numbers) to set breakpoints
- Press `F5` to start debugging

### 2. Debug Configuration
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3004"
    }
  ]
}
```

### 3. View Logs
- Terminal shows Next.js build logs
- Browser console shows client-side logs
- Convex Dashboard shows backend logs

---

## 📝 COMMON TASKS IN CURSOR

### Edit Environment Variables
1. Open `.env.local` in Cursor
2. Add/update variables:
   ```bash
   SQUARE_ACCESS_TOKEN=sq0atp-xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   ```
3. Restart dev server

### Create New Component
1. Right-click `components/` folder
2. Select **New File**
3. Name it: `MyComponent.tsx`
4. Use Cursor AI: "Generate a React component for displaying event cards"

### Create New API Route
1. Navigate to `app/api/`
2. Create folder: `my-endpoint/`
3. Create file: `route.ts`
4. Use Cursor AI: "Create a POST endpoint that accepts event ID and returns ticket data"

### Update Database Schema
1. Open `convex/schema.ts`
2. Add new table or modify existing
3. Schema updates deploy automatically to Convex

### Run Tests
```bash
# In Cursor terminal:
npx playwright test
npx playwright test --ui  # Interactive mode
```

---

## 🎨 CURSOR TIPS FOR THIS PROJECT

### 1. Use Multi-Cursor Editing
- `Cmd+D` (or `Ctrl+D`) - Select next occurrence
- `Cmd+Shift+L` - Select all occurrences
- Useful for renaming variables across file

### 2. Use Cursor's Composer
- `Cmd+I` - Open Composer
- Make multi-file changes with AI
- Example: "Update all Square payment components to handle new error types"

### 3. Use Chat for Documentation
- Ask: "Document this function with JSDoc comments"
- Ask: "Explain what this Convex query does"
- Ask: "What are the dependencies for this component?"

### 4. Code Review
- Select code block
- Ask: "Review this code for security issues"
- Ask: "Suggest improvements for performance"
- Ask: "Check for TypeScript errors"

---

## 🔒 IMPORTANT FILES TO KNOW

### Configuration Files
- `.env.local` - Environment variables (DON'T COMMIT)
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `package.json` - Dependencies and scripts

### Key Application Files
- `app/page.tsx` - Homepage
- `app/events/[eventId]/checkout/page.tsx` - Checkout page
- `app/api/checkout/process-square-payment/route.ts` - Square payment
- `convex/schema.ts` - Database schema
- `convex/tickets/mutations.ts` - Ticket operations
- `components/checkout/SquareCardPayment.tsx` - Square UI

---

## 🚨 WHAT TO AVOID

1. **DON'T open the parent directory** (`stepperslife-v2-docker`)
   - Open `src/events-stepperslife` instead
   - Parent folder has Docker configs, not the app

2. **DON'T commit `.env.local`**
   - Already in `.gitignore`
   - Contains secrets

3. **DON'T modify `node_modules/`**
   - Auto-generated folder
   - Changes will be lost

4. **DON'T edit files in `.next/`**
   - Build output folder
   - Gets regenerated on build

---

## 📚 HELPFUL CURSOR COMMANDS

### Terminal Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test

# Format code
npm run format
```

### Cursor Shortcuts
- `Cmd+P` - Quick file open
- `Cmd+Shift+P` - Command palette
- `Cmd+B` - Toggle sidebar
- `Cmd+J` - Toggle terminal
- `Cmd+K` - AI edit selection
- `Cmd+L` - AI chat
- `Cmd+I` - AI composer

---

## 🎯 GETTING STARTED CHECKLIST

- [ ] Open Cursor
- [ ] Navigate to `/Users/irawatkins/stepperslife-v2-docker/src/events-stepperslife`
- [ ] Trust the workspace
- [ ] Open integrated terminal
- [ ] Run `npm install` (if first time)
- [ ] Check `.env.local` has correct values
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3004 in browser
- [ ] Start coding with Cursor AI! 🚀

---

## 💡 CURSOR AI PROMPT EXAMPLES

**Understanding the Code:**
```
"Explain how authentication works in this app"
"Show me the complete ticket purchase flow"
"What payment processors are integrated?"
"How is the Convex database structured?"
```

**Making Changes:**
```
"Add validation to the checkout form"
"Implement email notifications for ticket purchases"
"Add a new payment method (Apple Pay)"
"Create an admin dashboard for viewing orders"
```

**Debugging:**
```
"Why might Square payments be failing?"
"Find all console.log statements and remove them"
"Check for memory leaks in this component"
"Identify why this Convex query is slow"
```

**Testing:**
```
"Write a test for the ticket purchase flow"
"Create mock data for testing payments"
"Generate test cases for authentication"
```

---

## 🔗 USEFUL RESOURCES

**Documentation:**
- Next.js: https://nextjs.org/docs
- Convex: https://docs.convex.dev
- Tailwind CSS: https://tailwindcss.com/docs
- Square SDK: https://developer.squareup.com/docs
- Stripe: https://stripe.com/docs

**This Project:**
- Architecture Audit: `COMPREHENSIVE-TEST-REPORT.md`
- Test Results: `TEST-RESULTS-SUMMARY.md`
- This Guide: `HOW-TO-OPEN-IN-CURSOR.md`

---

## 🆘 TROUBLESHOOTING

**Cursor doesn't recognize TypeScript:**
- Close and reopen the folder
- Run: `Cmd+Shift+P` → "TypeScript: Reload Project"

**Dependencies not found:**
- Run: `npm install` in terminal
- Restart Cursor

**Port 3004 already in use:**
- Run: `lsof -ti:3004 | xargs kill -9`
- Or change port in `package.json`

**Convex not connecting:**
- Check `.env.local` has `CONVEX_URL`
- Verify Convex dashboard is accessible
- Run: `npx convex dev` to sync schema

---

**Ready to code?** Open Cursor and start building! 🚀
