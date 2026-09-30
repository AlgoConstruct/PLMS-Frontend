# Pathway IQ frontend

One Next.js shell per product (`apps/pathwayiq`) built from shared packages:

| Package | Holds |
| --- | --- |
| `@pathwayiq/ui` | shadcn components and layout blocks |
| `@pathwayiq/auth` | session cookies, login/logout, the `/app` proxy |
| `@pathwayiq/api` | server-side clients and generated types for IAM and each service |
| `@pathwayiq/access` | merged navigation, registry, `<Can>`, `CardGrid` |
| `@pathwayiq/feature-iam-admin` | the IAM admin console pages and card |
| `@pathwayiq/feature-learning` | courses, classrooms, workspaces pages and cards |
| `@pathwayiq/feature-projects` | projects: list, board, list and my-tasks views, task dialog, settings, classroom projects, card |

Menus and home cards come from every backend's `GET /api/v1/navigation` (listed in `apps/pathwayiq/src/backends.ts`);
a feature's `manifest.ts` says which menu and card keys it has pages for. New role, no new dashboard: grant the
permission codes in IAM and the menus and cards appear.

```bash
pnpm install
pnpm dev                 # app on :3000 (IAM on :8080 and the platform on :8082 must be running)
pnpm turbo test typecheck build && pnpm lint
pnpm api:generate        # after a backend API change (backends running), then commit src/generated
pnpm e2e:shell && pnpm e2e:platform && pnpm e2e:projects && pnpm e2e
```

A new product (for example travel) adds `apps/travel` with its own `backends.ts`, `registry.ts` and feature packages,
reusing `ui`, `auth`, `access`, `api` and `feature-iam-admin`.
