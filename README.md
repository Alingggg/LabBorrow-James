# LabReserve

LabReserve is a full-stack school laboratory, room, and equipment reservation system. The current deliverable is the Administrator milestone: authentication, catalog administration, account roles, and school settings.

Student, Faculty, Resource Staff, reservation, approval, checkout, and return workflows are intentionally deferred to later milestones.

## Completed capabilities

- Better Auth email/password login with database-backed sessions
- No public sign-up: the first Administrator is created with a script, and Administrators create every other account
- Server-enforced Administrator authorization on pages, data access, and mutations
- Administrator overview with resource, account, and role totals
- Resource category creation and editing
- Laboratory, room, and individually tracked equipment creation and editing
- Account role assignment with final-Administrator protection
- School profile and weekly operating-hours configuration (all times use Asia/Manila)
- Responsive navigation plus loading, empty, validation, and error states

## Stack

- Node.js 22
- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 4
- shadcn/ui on Base UI and Lucide icons
- React Hook Form and Zod 4
- Better Auth
- PostgreSQL with Drizzle ORM and Drizzle Kit

## Local setup

1. Copy `.env.example` to `.env` and replace the authentication secret.
2. Install dependencies and start PostgreSQL:

   ```bash
   npm install
   docker compose up -d
   ```

3. Apply the migrations:

   ```bash
   npm run db:migrate
   ```

4. Start the application:

   ```bash
   npm run dev
   ```

5. Create the first Administrator (choose your own credentials; the password needs at least 8 characters):

   ```bash
   ADMIN_NAME="Your Name" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=change-me-please npm run create-admin
   ```

6. Sign in at [http://localhost:3000/login](http://localhost:3000/login). Further accounts are created from `/admin/users`.

There is no public sign-up. Better Auth sign-up is disabled, so accounts exist only when the `create-admin` script or an Administrator (via `/admin/users`) creates them. Public registration may return in the Student milestone.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by the application and migrations |
| `BETTER_AUTH_SECRET` | Random authentication secret of at least 32 characters |
| `BETTER_AUTH_URL` | Canonical application URL, normally `http://localhost:3000` locally |

Do not commit `.env` or production credentials.

## Commands

```bash
npm run dev                  # start the development server
npm run lint                 # run ESLint
npm run typecheck            # generate Next.js route types and check TypeScript
npm run build                # create a production build
npm run db:generate          # generate a Drizzle migration
npm run db:migrate           # apply pending migrations
```

The approved validation workflow is targeted manual verification plus linting, TypeScript checking, and a production build. Automated test suites and CI are outside the initial project scope.

## Administrator routes

- `/admin/overview` — system overview
- `/admin/resources` — resource catalog management
- `/admin/resources/new` — resource creation
- `/admin/resources/[resourceId]/edit` — resource editing
- `/admin/categories` — category creation and editing
- `/admin/users` — account creation and role assignment
- `/admin/settings` — school profile and weekly operating hours

The `(app)` route group supplies the authenticated application shell but does not appear in public URLs. `/dashboard`, `/staff`, `/resources`, and `/reservations` are not active in this milestone.

## Architecture and security

Pages are Server Components by default. Feature-specific actions, validation, and data access are colocated beneath their Administrator route. Broad authentication and database modules remain under `src/lib` and `src/db`.

Every Server Action is treated as a public mutation endpoint. It authenticates the database-backed session, verifies the Administrator role, validates untrusted input with Zod, rereads trusted database state, and reports structured failures. Navigation visibility is presentation only and never replaces server-side authorization.

Role changes use a separate PostgreSQL transaction-level advisory lock so concurrent demotions cannot remove the final Administrator.

## Database milestones

The first migration contains Better Auth tables. A later migration removes the temporary first-account trigger. The Administrator migration adds the application role, facility settings, operating hours, resource categories, and resources. A later migration drops the unused maintenance table. Reservation, status-history, and equipment-checkout tables will be introduced only when their workflows are implemented.

The full product roadmap and constraints are documented in [`labreserve_project_plan.md`](./labreserve_project_plan.md).
