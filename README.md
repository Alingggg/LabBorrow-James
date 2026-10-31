# LabReserve

My Next.js practice project.

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Better Auth, PostgreSQL, Drizzle ORM, Docker Compose.

## Setup

Copy `.env.example` to `.env`, then:

```bash
docker compose up -d
```

```bash
docker compose exec app npm run db:migrate
```

```bash
docker compose exec app npm run create-admin
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the admin from `.env`.

Optional sample data:

```bash
docker compose exec app npm run seed:resources
```

```bash
docker compose exec app npm run seed:reservations
```
