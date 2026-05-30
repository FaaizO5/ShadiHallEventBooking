# Phase 1 Data Model: Wedding Hall Booking Website

**Feature**: 001-wedding-hall-booking | **Date**: 2026-05-30

Derived from the spec's Key Entities and Functional Requirements. This maps to the Prisma
schema under `prisma/schema.prisma`.

## Enums

- **Role**: `USER`, `ADMIN`
- **Slot**: `DAY`, `NIGHT`
- **BookingStatus**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`

## Entities

### User

| Field | Type | Constraints / Notes |
|-------|------|---------------------|
| id | String (cuid) | PK |
| email | String | **Unique**, lowercased; account identifier (FR-013) |
| passwordHash | String | bcrypt hash; never returned to client |
| name | String? | Optional display name |
| role | Role | Default `USER`; admins seeded (FR-013) |
| createdAt | DateTime | Default now() |
| updatedAt | DateTime | @updatedAt |
| bookings | BookingRequest[] | Reverse relation (requests created by this user) |

**Rules**: Registration always creates `role = USER`. Email uniqueness enforced by DB
unique constraint. Password validated (min length) via zod before hashing.

### Hall

| Field | Type | Constraints / Notes |
|-------|------|---------------------|
| id | String (cuid) | PK |
| name | String | Required |
| description | String | Required (long text) |
| capacity | Int | Required, > 0 |
| images | String[] | Array of image URLs (may be empty) |
| featured | Boolean | Default false; featured halls appear on home (FR-020) |
| createdAt | DateTime | Default now() |
| updatedAt | DateTime | @updatedAt |
| bookingRequests | BookingRequest[] | Reverse relation |

**Rules**: Admin-only create/edit/delete (FR-019). Home page shows exactly 6 featured
halls (FR-020, SC-007) — selection = `where featured = true` limited/ordered to 6.
Deleting a hall with APPROVED bookings is warned/blocked (Edge Cases).

### BookingRequest

| Field | Type | Constraints / Notes |
|-------|------|---------------------|
| id | String (cuid) | PK |
| userId | String | FK → User.id (owner) |
| hallId | String | FK → Hall.id |
| date | DateTime @db.Date | Date-only; today ≤ date ≤ today+12mo (FR-008) |
| slot | Slot | DAY or NIGHT |
| status | BookingStatus | Default `PENDING` (FR-004) |
| decidedById | String? | FK → User.id (admin who approved/rejected/cancelled) |
| decidedAt | DateTime? | Set on status change away from PENDING |
| createdAt | DateTime | Default now() |
| updatedAt | DateTime | @updatedAt |

**Indexes / Constraints**:

- **Partial unique index (the no-double-booking guarantee, Principle III):**
  ```sql
  CREATE UNIQUE INDEX booking_request_unique_approved
  ON "BookingRequest" ("hallId", "date", "slot")
  WHERE "status" = 'APPROVED';
  ```
  At most one APPROVED row per (hall, date, slot). Added via hand-edited Prisma migration.
- Index on `(hallId, date)` for availability queries.
- Index on `(status)` for the admin pending queue.
- Application-level guard: prevent a duplicate PENDING for the same (userId, hallId, date,
  slot) (FR-007) — checked in the create server action (no DB partial index needed, but may
  be added as a second partial unique index on PENDING if desired).

## Relationships

- `User 1—* BookingRequest` (owner) via `userId`.
- `User 1—* BookingRequest` (decider) via `decidedById` (admin actions).
- `Hall 1—* BookingRequest` via `hallId`.

## State Transitions (BookingRequest.status)

```text
            create (user)
                │
                ▼
            PENDING ──── reject (admin) ─────▶ REJECTED
              │  │
              │  └────── cancel (owner) ─────▶ CANCELLED   (FR-017)
              │  └────── auto-reject on rival approval ──▶ REJECTED (FR-011)
              │
       approve (admin)                       (slot becomes BOOKED, FR-010)
              │
              ▼
           APPROVED ──── cancel (admin) ────▶ CANCELLED   (FR-018; slot released, SC-008)
```

- PENDING → APPROVED: admin only; inside transaction; auto-rejects rival PENDINGs.
- PENDING → REJECTED: admin reject, or auto-reject when a rival is approved.
- PENDING → CANCELLED: owner cancels own pending (FR-017).
- APPROVED → CANCELLED: **admin only** (FR-018); releases the slot back to AVAILABLE.
- Terminal states: REJECTED, CANCELLED (no further transitions).

## Availability Derivation (not stored)

`availability(hall, date, slot)` = `BOOKED` iff an APPROVED BookingRequest exists for that
exact tuple, else `AVAILABLE`. Computed on read only; never persisted (Principle I).

## Seed Data

- 1 admin user (email + password from env), `role = ADMIN`.
- ≥ 6 halls with `featured = true` to populate the home page, plus a few non-featured.
