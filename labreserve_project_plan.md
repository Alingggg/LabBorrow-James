# LabReserve — Canonical Full-Stack School Resource Reservation Project Plan

## 1. Project Overview

**LabReserve** is a full-stack reservation system for one school or campus. It manages laboratories, rooms, and individually tracked equipment through role-aware administration, reservation approval, checkout, and return workflows.

The project is intended to demonstrate:

- full-stack development with Next.js;
- server-rendered and interactive React interfaces;
- PostgreSQL database design;
- email/password authentication and server-side authorization;
- transaction-safe reservation rules;
- Git and pull-request workflows; and
- deployment and production configuration.

This is a focused portfolio project rather than a large institutional platform. The goal is a complete and reliable reservation core with clear school workflows, not a broad collection of unrelated features.

The application represents exactly one school. Multi-school tenancy is outside the initial scope.

---

## 2. Main Learning Goals

### Next.js

- App Router;
- Server Components;
- Client Components;
- Route Handlers;
- Server Actions;
- layouts and nested layouts;
- route groups;
- loading and error states;
- middleware when appropriate;
- dynamic routes;
- server/client boundaries;
- caching and revalidation;
- environment variables; and
- deployment.

### Backend Development

- colocated server-side modules;
- database access patterns;
- request validation;
- authentication;
- role-based authorization;
- PostgreSQL transactions and constraints;
- reservation-rule enforcement;
- overlap detection;
- filtering and pagination;
- structured error handling; and
- logging.

### Development Workflow

- Docker for local PostgreSQL;
- feature branches;
- GitHub pull requests;
- linting and type checking;
- production builds; and
- deployment.

---

## 3. Approved Technology Stack

Only the following application technologies are prescribed by this plan.

### Application

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**

### Forms and Validation

- **React Hook Form**
- **Zod**

Use React Hook Form for interactive forms where client-side form state is useful. All untrusted mutation input must be validated again on the server with Zod.

### Data Fetching

Use native Next.js server-side data fetching wherever possible.

Use **TanStack Query** only for client-side flows where caching, invalidation, polling, or optimistic updates are genuinely useful. It is optional and should not be installed until an approved flow needs it.

### Database

- **PostgreSQL**
- **Drizzle ORM**
- **Drizzle Kit**

### Authentication

- **Better Auth**
- email/password login (no public registration; Administrators create accounts);
- database-backed sessions; and
- application-owned role and authorization checks.

OAuth and social login are not part of the initial scope.

### Development and Deployment

- **Docker** for local PostgreSQL;
- **Vercel** for the Next.js deployment; and
- **Neon** or **Supabase PostgreSQL** for the production database.

The plan intentionally does not prescribe a package manager, UI component library, icon library, or date utility library.

---

## 4. Product Roles

### Administrator

- manage school settings and operating hours;
- create and update laboratories, rooms, and equipment;
- create and view accounts;
- assign application roles;
- view system summaries; and
- retain at least one Administrator account at all times.

### Resource Staff

- review requests that require approval;
- approve or reject eligible requests;
- see operational resource schedules;
- check equipment out;
- receive returned equipment; and
- record checkout and return condition.

### Faculty

- sign in;
- browse resources allowed for Faculty and Resource Staff;
- create reservation requests;
- view upcoming and previous reservations; and
- cancel eligible reservations.

### Student

- register and sign in;
- browse resources available to all users;
- create reservation requests;
- view upcoming and previous reservations; and
- cancel eligible reservations.

Administrator is the first implementation milestone. The other roles remain documented but must not be exposed until their milestone is reviewed and accepted.

---

## 5. System Architecture

```text
Browser
   │
   ▼
Next.js Application
├── Server Components
├── Client Components
├── Server Actions
├── Route Handlers
└── Shared layouts and access guards
   │
   ├── Better Auth session checks
   ├── Zod input validation
   ├── Role and ownership checks
   ├── Reservation rules
   └── Drizzle database operations
          │
          ▼
      PostgreSQL
```

Rules:

- React UI components must not contain complex authorization, reservation, or database rules.
- Every mutation is treated as a public server entry point and must authenticate, authorize, validate, and re-read trusted database state.
- Page-specific components, actions, validation, queries, and supporting logic stay beneath the relevant authenticated application route.
- Only broadly shared authentication, database, schemas, and utility modules live outside the route hierarchy.
- Server-side authorization is authoritative; hidden links and disabled controls are presentation only.

Example reservation flow for a later milestone:

```text
User submits reservation request
        │
        ▼
Server Action
        │
        ├── validate input
        ├── authenticate user
        ├── enforce role and access scope
        ├── load resource and school settings
        ├── validate operating hours and duration
        ├── reject reservation overlap
        ├── choose pending or confirmed status
        └── write reservation and status history in a transaction
                │
                ▼
            PostgreSQL
```

---

## 6. Route Organization

Keep the route-group structure:

```text
src/app/
├── (auth)/
│   ├── login/
│   └── (no register route; accounts are created by Administrators)
├── (app)/
│   ├── layout.tsx
│   ├── _components/
│   ├── _lib/
│   ├── admin/
│   │   └── page.tsx
│   ├── staff/                    # enabled in the Resource Staff milestone
│   ├── resources/                # enabled in the Faculty milestone
│   └── reservations/             # enabled in the Faculty milestone
├── api/
├── layout.tsx
└── page.tsx
```

Parenthesized route groups organize the code and may provide shared layouts, but do not appear in public URLs. Because `(app)` already groups the authenticated application and supplies its shared shell, authenticated routes are not additionally nested beneath a `dashboard` segment. Administrator and Resource Staff folders remain real URL segments because they represent role-specific workspaces. Faculty and Student use shared `resources` and `reservations` routes, with server-side authorization and data filtering based on the authenticated role.

Page-specific files may use `_components`, `_lib`, and `actions.ts` within their route subtree. Do not introduce a separate mandatory `src/server` hierarchy.

Broadly shared modules may remain in:

```text
src/
├── db/
├── lib/
├── schemas/
└── components/
```

---

## 7. Milestone 1 — Administrator

The first deliverable contains only the Administrator experience.

### Authentication and Access

- provide email/password login and logout;
- disable public sign-up entirely (Better Auth `disableSignUp`); Administrators create accounts from `/admin/users`;
- create the first Administrator with the `create-admin` script;
- prevent demotion of the final Administrator with a PostgreSQL advisory lock;
- reject every non-Administrator attempt to access Administrator pages or actions;
- send unauthenticated visitors to `/login`; and
- send authenticated Administrators from `/` to `/admin`.

Existing non-Administrator accounts may remain stored, but they have no active application workflow during this milestone.

### Administrator Routes

```text
/admin
/admin/resources
/admin/resources/new
/admin/resources/[resourceId]/edit
/admin/users
/admin/settings
```

Do not expose reservation, approval, checkout, return, Faculty, Student, or Resource Staff pages during this milestone.

### Administrator Capabilities

- show totals for resources, unavailable resources, and account roles;
- create and update laboratories, rooms, and individual equipment records;
- manage resource name, description, type, and operational status;
- view registered accounts and assign roles;
- configure school name, timezone, contact information, address, and weekly operating hours; and
- provide responsive navigation, loading, empty, validation, authorization, and unexpected-error states.

All Administrator mutations use Server Actions with Zod validation, database-backed session checks, Administrator authorization, and transaction-safe writes.

---

## 8. Core Domain Contracts

### User Roles

```text
STUDENT
FACULTY
RESOURCE_STAFF
ADMIN
```

### Resource Types

```text
LAB
ROOM
EQUIPMENT
```

Equipment represents an individually tracked item with its own resource record and reservation schedule. Quantity-based inventory is not part of the initial scope.

### Approval Modes

```text
AUTO_APPROVE
APPROVAL_REQUIRED
```

An eligible request for an auto-approved resource becomes confirmed immediately. An eligible request for a restricted resource begins pending review.

Approval mode is added to resources in the Resource Staff milestone.

### Access Scopes

```text
ALL_USERS
FACULTY_STAFF
```

`ALL_USERS` permits Students, Faculty, Resource Staff, and Administrators. `FACULTY_STAFF` excludes Students.

Access scope is added to resources in the Faculty milestone.

### Resource Statuses

```text
AVAILABLE
UNAVAILABLE
RETIRED
```

An available resource may still be blocked by an overlapping reservation. Retired resources remain available for historical records but cannot accept new requests.

### Reservation Statuses

```text
PENDING_APPROVAL
CONFIRMED
REJECTED
CANCELLED
CHECKED_OUT
RETURNED
COMPLETED
```

Status changes must follow explicitly allowed transitions and produce a history record.

### Equipment Conditions

```text
GOOD
FAIR
DAMAGED
```

Condition is recorded at checkout and return for equipment reservations.

---

## 9. Suggested Database Model

Introduce the schema milestone by milestone rather than creating tables for unfinished workflows. Milestone 1 contains the Better Auth tables and role column, facility settings, operating hours, and resources. Reservations, status history, equipment checkout tables, and the reservation-policy columns on resources are added by the later milestone that first uses them.

### Better Auth Tables

```text
user
session
account
verification
```

The user record also stores the LabReserve role. Authentication records must remain separate from school resource data.

### facility_settings

```text
id
institution_name
timezone
email
phone
address
updated_at
```

The initial application uses one settings record because the installation represents one school.

### operating_hours

```text
id
day_of_week
open_time
close_time
is_closed
```

There is at most one row per weekday. Open days require an opening time earlier than the closing time. Closed days do not retain an active time range.

### resources

```text
id
name
description
type
status
created_at
updated_at
```

Resource names are unique.

Later milestones extend this table:

```text
approval_mode              # Resource Staff milestone
access_scope               # Faculty milestone
max_reservation_minutes    # Faculty milestone; must be positive
```

### reservations

```text
id
user_id
resource_id
start_at
end_at
purpose
notes
status
reviewed_by
reviewed_at
rejection_reason
created_at
updated_at
```

The end must be later than the start. Active reservation states participate in conflict prevention.

### reservation_status_history

```text
id
reservation_id
from_status
to_status
changed_by
changed_at
reason
```

Each created or changed reservation status produces an auditable history row in the same transaction.

### equipment_checkouts

```text
id
reservation_id
checked_out_by
checked_out_at
returned_to
returned_at
checkout_condition
return_condition
notes
```

Each eligible equipment reservation may have at most one checkout record.

---

## 10. Administrator Rules

### Resources

- resource names must remain unique;
- retired resources cannot accept new requests;
- status changes must not rewrite historical reservation records; and
- deleting referenced resources is avoided in favor of durable status changes.

### Role Management

- only an Administrator may assign roles;
- an Administrator cannot demote the final Administrator;
- role changes affect the next authorization check; and
- UI restrictions never replace server-side checks.

### School Settings

- there is one active school settings record;
- the timezone must be a valid IANA timezone identifier;
- operating hours are interpreted in the configured timezone; and
- each open weekday must have a valid opening and closing time.

---

## 11. Reservation Eligibility and Availability

Do not store every possible time slot.

Determine availability from:

```text
School operating hours
        ∩
Resource operational state
        -
Conflicting active reservations
        =
Available reservation ranges
```

A new request must:

- start in the future;
- end after it starts;
- remain within one local operating day;
- remain within school operating hours;
- stay within the resource maximum duration;
- target an available resource;
- satisfy the resource access scope;
- avoid an active reservation overlap for the same resource.

A resource accepts only one active reservation at a time in the initial version.

All times are entered and displayed in the configured school timezone and stored in PostgreSQL as UTC timestamps.

---

## 12. Concurrency and Conflict Prevention

Do not rely only on an application sequence such as:

```text
check availability
        ↓
resource appears available
        ↓
insert reservation
```

Two requests can pass an application-only check at nearly the same time.

Reservation creation must therefore combine:

- server-side eligibility checks;
- a PostgreSQL transaction;
- a database constraint that rejects overlapping active reservations for the same resource; and
- structured handling that returns a clear conflict result to the user.

The database is the final authority for concurrency safety.

---

## 13. Authentication and Authorization

### Authentication

- use Better Auth email/password registration and login;
- use database-backed sessions;
- protect authenticated route groups;
- keep secrets in environment variables; and
- do not commit credentials or authentication secrets.

### Authorization

```text
Student
    may use resources with ALL_USERS access
    may view and manage only eligible personal reservations

Faculty
    may use ALL_USERS and FACULTY_STAFF resources
    may view and manage only eligible personal reservations

Resource Staff
    may review restricted requests
    may operate checkout and return workflows
    may view operational resource schedules

Administrator
    may manage resources, roles, and school settings
```

Every Server Action and Route Handler must independently authenticate the session and authorize the requested operation.

---

## 14. Local Development With Docker

Use Docker primarily for local PostgreSQL infrastructure.

```text
Next.js development server
        │
        ▼
Local PostgreSQL container
```

The Compose configuration should provide:

- a PostgreSQL container;
- a persistent volume;
- a health check;
- environment-based credentials; and
- a local port mapping.

The Next.js development server initially runs directly on the host.

---

## 15. Git Workflow

Avoid developing every feature directly on `main`.

Example branches:

```text
feature/admin-auth
feature/admin-resources
feature/admin-users
feature/resource-staff
feature/faculty-reservations
feature/student-reservations
fix/reservation-conflict
```

Workflow:

```text
main
  │
  └── feature branch
         │
         ├── focused commits
         ├── push to GitHub
         ▼
      Pull Request
         │
         ├── review diff
         ├── run approved local checks
         ▼
       Merge
```

GitHub is used for source control and pull-request practice. Automated GitHub workflows are not part of this project.

---

## 16. Deployment

Recommended production shape:

```text
GitHub repository
        │
        ▼
Vercel
        │
        ▼
Next.js application
        │
        ▼
Neon or Supabase PostgreSQL
```

Production concerns:

- environment variables;
- production database URL;
- database migrations;
- Better Auth secret and public URL;
- error handling and logging; and
- Administrator-created accounts and the first-Administrator script.

---

## 17. Development Milestones

### Milestone 0 — Project Alignment

- align the existing repository with this plan;
- keep only approved dependencies and configuration;
- configure local PostgreSQL through Docker;
- verify the database connection and migrations; and
- ensure linting, type checking, and the production build pass.

### Milestone 1 — Administrator

- login, logout, protected routes, and Administrator authorization;
- Administrator account creation;
- Administrator overview summary;
- laboratory, room, and equipment management;
- user and role management;
- school settings and operating hours; and
- final-Administrator protection.

Do not expose other role workflows until this milestone is reviewed and accepted.

### Milestone 2 — Resource Staff

- resource approval mode;
- reservation and status-history tables with database-level overlap protection;
- pending-request review;
- approval and rejection with reasons;
- operational reservation views;
- equipment checkout and return; and
- checkout and return condition recording.

### Milestone 3 — Faculty

- resource access scope and maximum reservation duration;
- authenticated resource catalog;
- access to Faculty and Resource Staff resources;
- reservation creation;
- upcoming and previous reservations; and
- eligible cancellation.

### Milestone 4 — Student

- public registration;
- general resource catalog;
- reservation creation;
- upcoming and previous reservations; and
- eligible cancellation.

### Milestone 5 — Cross-Role Completion

- complete reservation status transitions;
- complete reservation status history;
- finalize overlap protection;
- integrate navigation across active roles;
- finalize loading, empty, validation, authorization, and unexpected-error states; and
- manually verify full reservation lifecycles.

### Milestone 6 — Production Deployment

- deploy Next.js to Vercel;
- provision Neon or Supabase PostgreSQL;
- configure production environment variables;
- apply migrations;
- create the production Administrator with the `create-admin` script; and
- verify critical production flows.

### Milestone 7 — Polish

- improve responsive design;
- improve accessibility and keyboard navigation;
- refine loading and error feedback;
- add metadata;
- update README documentation; and
- document important architectural decisions.

---

## 18. Explicitly Excluded From the Initial Project

Do not add these unless a later approved plan changes the scope:

- GitHub Actions or another CI pipeline;
- Vitest;
- React Testing Library;
- Playwright;
- an automated unit, component, integration, or end-to-end test suite;
- OAuth, social login, or SSO;
- payments or fines;
- notifications or reminders;
- QR or barcode scanning;
- recurring reservations;
- waitlists;
- quantity-based equipment inventory;
- multi-school tenancy;
- advanced analytics;
- chat or video calls;
- microservices;
- Kafka;
- Kubernetes;
- Redis; and
- a mobile application.

Validation during the planned milestones consists of targeted manual scenarios plus linting, TypeScript checking, and production builds.

---

## 19. Optional Extensions

Consider these only after the core application is complete and deployed:

### Notifications

- request received;
- request approved or rejected;
- cancellation; and
- upcoming reservation reminder.

### Schedule Exceptions

- holidays;
- emergency closures; and
- special operating hours.

### Additional Authentication

- school SSO; or
- an approved external identity provider.

### Audit Events

```text
RESOURCE_CREATED
RESOURCE_UPDATED
ROLE_CHANGED
RESERVATION_APPROVED
RESERVATION_REJECTED
EQUIPMENT_CHECKED_OUT
EQUIPMENT_RETURNED
SETTINGS_UPDATED
```

---

## 20. README Requirements

Once the matching application work is complete, the repository README should include:

```text
Project overview
Demo link
Screenshots
Architecture
Technology stack
Features by completed milestone
Local setup
Environment variables
Database setup
First Administrator via create-admin script
Deployment
Important engineering decisions
```

Explain:

- why Next.js handles the frontend and backend;
- how roles and resource access are enforced;
- how reservation conflicts are prevented;
- how school-local time is converted to and from UTC; and
- why route-specific server logic is colocated with its authenticated application area.

Do not claim unfinished role workflows, automation, or deployment are complete.

---

## 21. Portfolio Outcome

The completed project should demonstrate:

```text
Next.js App Router
Server-side React
Full-stack TypeScript
Authentication and role authorization
PostgreSQL schema design
Drizzle ORM and migrations
Transaction-safe conflict handling
School resource reservation workflows
Docker-based local infrastructure
Vercel deployment
```

Possible future resume entry:

```text
LabReserve | Next.js, TypeScript, PostgreSQL, Drizzle, Docker, Vercel

• Built a school laboratory, room, and equipment reservation system with
  role-based access, configurable approval policies,
  equipment custody tracking, and conflict-safe reservation workflows.

• Deployed the full-stack application with managed PostgreSQL, database-backed
  authentication, and production environment configuration.
```

Do not use these statements until the described capabilities actually exist.

---

## 22. Definition of Done

### Administrator Milestone

The first milestone is ready for review when:

```text
✓ only approved Administrator routes are active
✓ sign-up is disabled and only an Administrator can create accounts
✓ non-Administrators cannot access Administrator pages or actions
✓ resources can be created and updated
✓ account roles can be assigned safely
✓ the final Administrator cannot be demoted
✓ school settings and operating hours can be updated
✓ loading, empty, validation, authorization, and error states are present
✓ linting and TypeScript checks pass
✓ the production build succeeds
```

### Complete Application

LabReserve is complete when:

```text
✓ Students, Faculty, Resource Staff, and Administrators have approved workflows
✓ resource visibility follows access scope
✓ eligible users can create and cancel reservations
✓ restricted requests can be approved or rejected
✓ equipment checkout and return preserve condition records
✓ conflicting active reservations are prevented at the database level
✓ every reservation state change produces history
✓ authorization is enforced on the server
✓ school-local times are displayed correctly and stored in UTC
✓ linting and TypeScript checks pass
✓ the production build succeeds
✓ the production application is deployed
✓ the README matches the implemented application
```

Once these conditions are satisfied, stop adding major features and use the project for portfolio presentation, applications, and interview preparation.
