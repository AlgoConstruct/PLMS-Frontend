# Pathway IQ Access console

Next.js 16 + shadcn/ui dashboard for the Pathway IQ IAM backend.

## Run

```bash
cp .env.example .env.local   # IAM_API_URL=http://localhost:8080
npm install
npm run dev                  # http://localhost:3000
```

The backend must run with the `dev` profile for the demo accounts; the login page lists them in development.

## What you can do

| Area | Route | Capabilities |
|---|---|---|
| Dashboard | `/` | Your assignments, effective permissions, counts |
| Hierarchy | `/hierarchy` | Switch organization, create organizations, add root and child nodes, rename / change code / deactivate, move subtrees, delete leaves, live ALLOW/DENY matrix per node |
| Node types | `/hierarchy/types` | Define the levels of an organization (root type, parent type), activate / deactivate, delete unused types |
| Users | `/users`, `/users/[id]` | Scoped directory with search and paging, create users, edit profile / reset password, enable / disable, assign and revoke roles |
| Roles | `/roles`, `/roles/[id]` | Create custom roles, edit / deactivate / delete, choose permissions and per-permission scope mode, see and manage members |
| Permissions | `/permissions` | Backend permission catalog |
| Access check | `/access` | Ask the engine whether you may do X at node Y and why |

Buttons are hidden or disabled when your permissions clearly do not allow an action, but that is only a
convenience: every action goes to the API, and a 403 is shown inline exactly as returned. Try assigning
`SUPER_ADMIN` as `collegeadmin` to see the privilege-escalation guard.

## How it talks to the API

- **Backend for frontend.** The browser never holds a token. Sign-in is a Server Action that stores the
  access and refresh tokens in `httpOnly`, `SameSite=Lax` cookies (`Secure` in production). All API calls
  happen server-side in Server Components and Server Actions (`src/lib/api.ts`, `src/app/(console)/_actions`).
- **Session refresh.** `src/proxy.ts` (Next.js 16 proxy, formerly middleware) redirects to `/login` without
  a session and silently refreshes an expiring access token.
- **UI kit.** shadcn/ui (radix, nova preset): sidebar layout, dialogs for every mutation, confirmation
  dialogs for destructive actions, toasts for results.

## End-to-end test

With backend and frontend running:

```bash
npx playwright install chromium   # first time only
npm run e2e
```

It signs in as `superadmin`, creates an organization with node types and nodes, creates a role, picks its
permissions, assigns it to `teacher`, then checks as `teacher` and `collegeadmin` that scope and the
escalation guard hold. Screenshots land in `e2e/screenshots/`. The run leaves its test organization and role
in the dev database (names are suffixed with a timestamp).
