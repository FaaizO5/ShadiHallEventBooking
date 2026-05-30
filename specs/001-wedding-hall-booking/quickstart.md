# Quickstart: Wedding Hall Booking Website

**Feature**: 001-wedding-hall-booking | **Date**: 2026-05-30

How to set up, run, and validate this feature locally and on Vercel. Phases mirror the
user's requested order: setup → database → core pages → auth + booking logic → admin
approval → polish + deploy.

## Prerequisites

- Node.js 20.x, npm
- A Neon Postgres project (free tier is fine) with a pooled and a direct connection string

## Environment

Create `.env` (git-ignored):

```bash
DATABASE_URL="postgres://...-pooler.neon.tech/db?sslmode=require"   # pooled (runtime)
DIRECT_URL="postgres://....neon.tech/db?sslmode=require"            # direct (migrations)
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="<choose-a-strong-password>"
```

## Phase: Setup

```bash
npm install
npm install next-auth@4 @prisma/client zod bcryptjs
npm install -D prisma vitest @playwright/test @types/bcryptjs
```

Confirm `tsconfig.json` has `"strict": true` (Constitution Tech Standards) and Tailwind is
configured (already scaffolded).

## Phase: Database

1. Define `prisma/schema.prisma` per [data-model.md](./data-model.md) (enums Role, Slot,
   BookingStatus; models User, Hall, BookingRequest; `datasource` uses `url = env("DATABASE_URL")`
   and `directUrl = env("DIRECT_URL")`).
2. Create the first migration:
   ```bash
   npx prisma migrate dev --name init
   ```
3. **Add the no-double-booking partial unique index** (Constitution Principle III). Edit the
   generated migration SQL and append:
   ```sql
   CREATE UNIQUE INDEX "booking_request_unique_approved"
   ON "BookingRequest" ("hallId", "date", "slot")
   WHERE "status" = 'APPROVED';
   ```
   Re-run `npx prisma migrate dev` to apply. (Verify with `\d "BookingRequest"` in psql.)
4. Seed an admin + sample halls (≥6 featured):
   ```bash
   npx prisma db seed
   ```

## Phase: Core Pages

Implement (mobile-first Tailwind): home (hero + 6 featured halls), halls listing, hall
detail with date+slot picker, about, contact. Read paths use server components calling
`lib/availability.ts`.

```bash
npm run dev   # http://localhost:3000
```

## Phase: Auth + Booking Logic

1. Configure NextAuth Credentials in `lib/auth.ts` (JWT strategy, role in session).
2. Implement `register` (always role USER), login, logout.
3. Implement booking creation server action: validate date window (today..+12mo) and slot,
   block if slot already APPROVED (409) or duplicate pending (409), else create PENDING.
4. User dashboard lists own bookings; user can cancel own PENDING.

## Phase: Admin Approval

1. Admin dashboard lists the pending queue across users.
2. Approve action (transactional): set APPROVED, auto-reject rival PENDINGs, rely on partial
   index to fail closed.
3. Reject action; admin cancel of an APPROVED booking releases the slot.
4. Admin hall CRUD (create/edit/delete; guard delete when approved bookings exist).

## Phase: Polish + Deploy

- Verify every page at phone width (no horizontal scroll) — SC-005.
- Run tests, then deploy to Vercel.

## Validation (maps to Success Criteria)

```bash
npm run test          # Vitest unit: availability, validation, approval rules
npm run test:e2e      # Playwright: booking + approval journeys
```

Manual acceptance checks:

1. **SC-002/SC-003**: Approve a request → slot shows Booked everywhere; a second approval
   attempt for the same hall/date/slot fails (no double-booking).
2. **SC-004**: A regular user calling an approve/reject action is rejected (403).
3. **FR-008**: Date picker disallows past dates and dates >12 months ahead.
4. **FR-018/SC-008**: Admin cancels an approved booking → slot becomes requestable again.
5. **SC-007**: Home page shows a hero + exactly 6 featured halls.

## Deploy to Vercel

1. Import the repo in Vercel; set the env vars above (`NEXTAUTH_URL` = production URL).
2. Build runs `prisma generate`; apply migrations with `npx prisma migrate deploy`
   (Vercel build step or a release command).
3. Seed the admin once against the production database.
