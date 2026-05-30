# Phase 0 Research: Wedding Hall Booking Website

**Feature**: 001-wedding-hall-booking | **Date**: 2026-05-30

This document records the technical decisions resolving the Technical Context. The stack
was specified by the user and ratified by the constitution; research focuses on *how* to
apply each technology to satisfy the non-negotiable principles (especially no
double-booking) and the deferred non-functional questions.

## 1. Enforcing "no double-booking" at the database level

- **Decision**: Use a single `BookingRequest` table and add a **partial unique index** in
  Postgres:
  `CREATE UNIQUE INDEX booking_request_unique_approved ON "BookingRequest" ("hallId", "date", "slot") WHERE "status" = 'APPROVED';`
  Approval runs inside a `prisma.$transaction` that re-validates availability and relies on
  the index to reject a second concurrent approval (fail closed).
- **Rationale**: Satisfies Constitution Principle III ("enforced at the database level …
  not by application logic alone") while keeping a single source of truth — the
  `BookingRequest` table itself. The partial index permits unlimited PENDING/REJECTED/
  CANCELLED rows for the same slot but at most one APPROVED row.
- **Alternatives considered**:
  - *Plain `@@unique([hallId, date, slot])`* — rejected: would block re-requesting a slot
    after rejection/cancellation and forbid multiple competing pending requests.
  - *Separate `Booking` lock table with a plain unique constraint* — viable, but
    introduces a second source of truth to keep in sync with `BookingRequest`; rejected in
    favor of the partial index for simplicity.
  - *Application-only check-then-insert* — rejected: race-prone, violates the constitution.

- **Prisma note**: Prisma schema cannot express a `WHERE` partial unique index directly.
  Generate the migration with `prisma migrate dev`, then hand-edit the migration SQL to add
  the partial index (and keep it in version control). Documented in quickstart.md.

## 2. Transactional approval & concurrency

- **Decision**: Approve in a transaction: (a) load the target request, (b) verify no
  APPROVED row exists for the slot, (c) set it APPROVED, (d) auto-reject other PENDING
  requests for the same hall/date/slot (FR-011). The partial unique index is the final
  guarantee; the transaction makes the auto-reject atomic. On unique-violation, the
  transaction rolls back and the API returns a "slot just got booked" conflict.
- **Rationale**: Covers FR-010/FR-011 and SC-003 even under concurrent admin actions.
- **Alternatives considered**: `SELECT … FOR UPDATE` advisory locking — unnecessary given
  the unique index already serializes approvals; kept transaction simple.

## 3. Availability derivation

- **Decision**: A `getAvailability(hallId, dateRange)` function returns, per date, the
  DAY/NIGHT status by querying only `BookingRequest` rows with `status = APPROVED`. A slot
  is `BOOKED` if such a row exists, else `AVAILABLE`. No cached/denormalized flag.
- **Rationale**: Constitution Principle I — one answer for UI and API.

## 4. Authentication & role separation (NextAuth Credentials)

- **Decision**: NextAuth v4 Credentials provider with JWT session strategy. Passwords
  hashed with bcryptjs. The user's `role` (USER/ADMIN) is added to the JWT and exposed on
  the session via `callbacks.jwt`/`callbacks.session`. Every mutating server action and the
  admin dashboard re-check `session.user.role` server-side before acting.
- **Rationale**: Constitution Principle II — server-side authorization is the security
  boundary; JWT strategy is serverless-friendly on Vercel (no session DB round-trip).
- **Alternatives considered**: Database session strategy — extra DB calls per request on
  serverless; rejected. OAuth providers — out of scope (spec mandates email+password).
- **Admin provisioning**: Admins are seeded (not self-registered); `register` always
  assigns `USER` (FR-013).

## 5. Date/slot model & booking window

- **Decision**: `slot` is an enum (`DAY`, `NIGHT`); `date` stored as a date-only value
  (Postgres `date`). Validation (zod) rejects dates before today or more than 12 months
  ahead (FR-008). The picker only renders selectable dates within the window.
- **Rationale**: DAY and NIGHT are independent slots; date-only avoids timezone slot
  ambiguity. Aligns with clarifications.
- **Timezone note**: Compare against "today" in a single fixed business timezone to avoid
  off-by-one at midnight; documented in quickstart.md.

## 6. Mobile-first UI approach

- **Decision**: Tailwind mobile-first; layouts authored at base width, enhanced with
  `sm:`/`md:`/`lg:`. SlotPicker uses large touch targets; dashboard tables collapse to
  stacked cards on small screens.
- **Rationale**: Constitution Principle IV; SC-005.

## 7. Image handling for halls

- **Decision**: Store hall images as an array of URLs (`images String[]`). Admin CRUD
  accepts URLs (no binary upload pipeline in v1). Use `next/image` for rendering.
- **Rationale**: Clarification chose admin CRUD including images; keeping images as URLs
  avoids a file-storage dependency while satisfying FR-019. Upload can be added later.

## 8. Testing strategy

- **Decision**: Vitest for `lib/` domain units (availability derivation, validation,
  approval rules). Playwright E2E for the two P1 journeys (request → pending; approve →
  booked) plus a concurrency/double-booking guard test and a role-denial test.
- **Rationale**: Constitution Dev Workflow requires tests for server-side authorization
  (Principle II) and the no-double-booking invariant (Principle III) before completion.

## 9. Deployment (Vercel + Neon)

- **Decision**: Deploy on Vercel. Use Neon pooled connection string for serverless
  (`DATABASE_URL` pooled; `DIRECT_URL` for migrations). `prisma generate` in build;
  migrations applied via `prisma migrate deploy`.
- **Rationale**: Serverless functions need pooled connections to avoid exhausting Postgres
  connections; Neon provides a pgBouncer pooled endpoint.

## Resolved unknowns

| Unknown | Resolution |
|---------|-----------|
| Performance/scale targets (deferred from spec) | Small-venue scale; standard web latency; SSR availability |
| Observability | Vercel logs + Next.js error boundaries; structured server-action error returns (no dedicated APM in v1) |
| How double-booking is enforced | Partial unique index + transactional approval |
| Session strategy | NextAuth JWT with role claim |
| Image storage | URL array, no upload pipeline in v1 |

All NEEDS CLARIFICATION items are resolved. Ready for Phase 1.
