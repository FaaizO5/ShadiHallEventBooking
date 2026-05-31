---
description: "Task list for Wedding Hall Booking Website implementation"
---

# Tasks: Wedding Hall Booking Website

**Input**: Design documents from `/specs/001-wedding-hall-booking/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Test tasks are INCLUDED because the project constitution (Development Workflow &
Quality Gates) requires server-side authorization (Principle II) and the no-double-booking
invariant (Principle III) to be covered by tests before booking features are complete.
Tests are scoped to those constitutional guarantees plus the two P1 journeys — not blanket
coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths are included in each description

## Path Conventions

Single Next.js 14 App Router project (per plan.md). Routes under `app/`, server actions
under `app/_actions/`, framework-agnostic domain logic under `lib/`, Prisma under
`prisma/`, tests under `tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [X] T001 Install runtime deps + dev deps via npm; verify versions in `package.json` (NOTE: installed stack is Next 16 / React 19 / Prisma 7 / NextAuth v4 / zod 4 / bcrypt + tsx, vitest, @playwright/test — not the plan's Next 14 / bcryptjs; building on installed per user decision)
- [X] T002 Verify `tsconfig.json` has `"strict": true` (confirmed) and Tailwind 4 wired via `@import "tailwindcss"` in `app/globals.css` + `@tailwindcss/postcss` in `postcss.config.mjs`
- [X] T003 [P] Add npm scripts to `package.json`: `test`, `test:e2e`, `db:seed`, `db:migrate`, `typecheck`, etc.; configure Prisma seed entry (`prisma.seed` → tsx)
- [X] T004 [P] Create `vitest.config.ts` (unit tests under `tests/unit/`) and `playwright.config.ts` (E2E under `tests/e2e/`, baseURL http://localhost:3000, +mobile project)
- [X] T005 [P] Create `.env.example` documenting `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Define `prisma/schema.prisma`: enums `Role`, `Slot`, `BookingStatus`; models `User`, `Hall`, `BookingRequest` per data-model.md (NOTE: Prisma 7 removed `url`/`directUrl` from schema → moved to `prisma.config.ts`; runtime uses `@prisma/adapter-neon`)
- [ ] T007 Run `npx prisma migrate dev --name init`, then hand-edit the generated migration to append the partial unique index `booking_request_unique_approved ON "BookingRequest" ("hallId","date","slot") WHERE "status" = 'APPROVED'`; re-run migrate to apply (Constitution Principle III) — **DEFERRED: needs .env with Neon credentials**
- [X] T008 [P] Add supporting indexes in schema: `@@index([hallId, date])` for availability and `@@index([status])` for the pending queue
- [X] T009 [P] Create Prisma client singleton in `lib/prisma.ts` (Neon adapter; avoids connection exhaustion on serverless)
- [X] T010 [P] Create zod schemas in `lib/validation.ts`: registration, booking input (slot enum + date within today..+12mo per FR-008), hall input (zod 4); date helpers in `lib/dates.ts`
- [X] T011 Configure NextAuth Credentials in `lib/auth.ts`: JWT session strategy, bcrypt verify, `role` claim via jwt/session callbacks; `auth()` helper + type augmentation in `types/next-auth.d.ts` (Principle II)
- [X] T012 Create NextAuth route handler in `app/api/auth/[...nextauth]/route.ts`
- [X] T013 [P] Implement availability derivation in `lib/availability.ts`: `getAvailability` + `isSlotBooked` computed ONLY from APPROVED bookings (Principle I); clamps range to today..+12mo
- [X] T014 [P] Create root layout + shared nav/footer in `app/layout.tsx`, `app/_components/Nav.tsx`, `app/_components/Providers.tsx` (mobile-first Tailwind, auth-aware links)
- [X] T015 Create `prisma/seed.ts`: seed 1 ADMIN user (from env) and 8 halls (6 featured) (data-model.md Seed Data)
- [X] T016 [P] Add server-side auth guards in `lib/guards.ts`: `requireUser()`/`requireAdmin()` (redirect) + `assertUser()`/`assertAdmin()` (throw for server actions) (FR-023, Principle II)

**Checkpoint**: Foundation code complete and type-checks clean. Migration (T007) deferred until Neon credentials are provided.

---

## Phase 3: User Story 1 - Request a hall for a date and slot (Priority: P1) 🎯 MVP

**Goal**: A signed-in user can open a hall, pick a date + slot (DAY/NIGHT), and submit a PENDING booking request; booked slots are not selectable.

**Independent Test**: Sign in as a seeded user, open a hall, pick an available date + DAY slot, submit, and confirm a PENDING request appears in the user's dashboard; a slot with an APPROVED booking shows "Booked" and is not selectable.

### Tests for User Story 1 ⚠️

- [X] T017 [P] [US1] Unit test in `tests/unit/booking-create.test.ts`: past dates, >12mo (FR-008), duplicate pending (FR-007), already-APPROVED slot (FR-006), independent DAY/NIGHT, creates PENDING (FR-004) — 9 tests passing
- [X] T018 [P] [US1] E2E test in `tests/e2e/booking-request.spec.ts` (ready; skips unless E2E_USER_* env set — runs in post-.env phase)

### Implementation for User Story 1

- [X] T019 [US1] Implement `createBooking` domain function in `lib/booking.ts`: zod validation, FR-006/FR-007/FR-008, create PENDING (injectable client for testing)
- [X] T020 [US1] Implement booking server action in `app/_actions/booking.ts` (`createBookingAction`): `assertUser()`, typed ActionResult, revalidatePath
- [X] T021 [P] [US1] Build hall detail page in `app/halls/[hallId]/page.tsx` (server component) fetching hall + availability (force-dynamic)
- [X] T022 [P] [US1] Build mobile-first `SlotPicker` in `app/_components/SlotPicker.tsx`: native date input bounded today..+12mo, DAY/NIGHT buttons, booked disabled, large touch targets (FR-022, SC-005)
- [X] T023 [US1] Wire SlotPicker submit to `createBookingAction`; shows booked/duplicate/error states; redirects unauthenticated users to /login (US1 scenario 4)
- [X] T024 [US1] Build user dashboard "My bookings" list in `app/dashboard/page.tsx` (user branch) with statuses (FR-015)
- [X] T025 [US1] Implement `cancelBookingAction` (FR-017) + `CancelButton` in dashboard

**Checkpoint**: User Story 1 fully functional — type-checks, lints, and builds clean; unit tests green.

---

## Phase 4: User Story 2 - Admin approves or rejects requests (Priority: P1) 🎯 MVP

**Goal**: An admin sees the pending queue and approves/rejects requests; approval locks the slot (Booked) and auto-rejects rivals; admin can cancel an approved booking to release the slot.

**Independent Test**: Sign in as admin, view pending queue, approve one request → slot shows Booked everywhere and rival pendings become Rejected; reject another → slot stays available; cancel an approved booking → slot becomes available again.

### Tests for User Story 2 ⚠️

- [X] T026 [P] [US2] Unit test in `tests/unit/booking-approve.test.ts`: approval sets APPROVED + auto-rejects rival PENDINGs (FR-011); fails closed when slot already approved (Principle III, SC-003); does NOT touch other slot — 8 tests passing
- [X] T027 [P] [US2] E2E test in `tests/e2e/admin-approval.spec.ts` (ready; skips unless E2E_ADMIN_* env set; includes FR-023 redirect check)
- [X] T028 [P] [US2] Unit test in `tests/unit/authz.test.ts`: USER denied admin actions, unauthenticated denied, ADMIN allowed (FR-009, SC-004, Principle II) — 5 tests passing

### Implementation for User Story 2

- [X] T029 [US2] Implement `approveBooking` in `lib/booking.ts` inside `$transaction`: re-validate, set APPROVED, auto-reject rivals; partial index is the fail-closed guarantee (FR-010/FR-011)
- [X] T030 [P] [US2] Implement `rejectBooking` in `lib/booking.ts` (FR-012)
- [X] T031 [P] [US2] Implement `adminCancelBooking` in `lib/booking.ts` releasing the slot (FR-018, SC-008)
- [X] T032 [US2] Add admin server actions in `app/_actions/booking.ts` (`approveAction`, `rejectAction`, `adminCancelAction`): each calls `assertAdmin()` first
- [X] T033 [US2] Build admin dashboard pending-queue view in `app/dashboard/page.tsx` (admin branch); mobile-first stacked cards (FR-016)
- [X] T034 [US2] Admin approved-bookings section with cancel; `AdminActions` surfaces the "slot has just been booked" conflict error

**Checkpoint**: Both P1 stories complete — full request → approval loop with no double-booking. Type-checks, lints, production-builds clean; 22 unit tests green. **DB migration + seed + E2E run deferred until Neon credentials provided.**

> Note: minimal `/login`, `/register`, and `/`+`/halls` discovery pages were also built (normally US3/US4) because the MVP loop cannot be exercised without authentication and navigation.

---

## Phase 5: User Story 3 - Register, sign in, role-based dashboard (Priority: P2)

**Goal**: Visitors register with email + password (role USER), sign in/out, and land on a role-aware dashboard.

**Independent Test**: Register a new account → can sign in; user dashboard shows only own bookings; admin account sees the pending queue; duplicate email is refused.

### Tests for User Story 3 ⚠️

- [ ] T035 [P] [US3] E2E test in `tests/e2e/auth.spec.ts`: register → login → dashboard; duplicate email refused (FR-013); dashboard restricted to signed-in users (FR-023)

### Implementation for User Story 3

- [ ] T036 [US3] Implement register server action in `app/_actions/auth.ts`: validate (zod), hash password (bcrypt), enforce unique email (409 on duplicate), always assign role USER (FR-013, depends on T010, T011)
- [ ] T037 [P] [US3] Build register page in `app/(auth)/register/page.tsx` (mobile-first form, error states)
- [ ] T038 [P] [US3] Build login page in `app/(auth)/login/page.tsx` using NextAuth Credentials sign-in (FR-014)
- [ ] T039 [US3] Add sign-out control to nav and enforce dashboard protection via `requireUser()` redirect in `app/dashboard/page.tsx` (FR-023)
- [ ] T040 [US3] Implement role-based branching in the dashboard so USER vs ADMIN see their respective views (ties US1/US2 dashboards together)

**Checkpoint**: Authentication and role-aware dashboard fully functional and independently testable.

---

## Phase 6: User Story 5 - Admin manages halls (Priority: P2)

**Goal**: Admin can create, edit, and delete halls (name, description, capacity, images, featured) from the dashboard.

**Independent Test**: As admin, create a hall → appears in listing; edit + mark featured → appears in featured/home; delete → removed; non-admin is denied.

> Sequenced after US3 because hall management lives behind the admin dashboard/auth. US4 (P3) follows.

### Tests for User Story 5 ⚠️

- [ ] T041 [P] [US5] Unit test in `tests/unit/hall-authz.test.ts`: non-admin create/edit/delete is denied; delete of a hall with APPROVED bookings is blocked/warned (FR-019, Edge Case)

### Implementation for User Story 5

- [ ] T042 [US5] Implement hall CRUD domain functions in `lib/hall.ts`: create/update/delete with guard against deleting halls that have APPROVED bookings (depends on T009)
- [ ] T043 [US5] Add admin hall server actions in `app/_actions/hall.ts` (`createHallAction`, `updateHallAction`, `deleteHallAction`), each `requireAdmin()` (FR-019, depends on T016, T042)
- [ ] T044 [P] [US5] Build admin hall management UI in `app/dashboard/halls/page.tsx` + form components (mobile-first; images as URL list per research.md)

**Checkpoint**: Admin can fully maintain the hall catalog.

---

## Phase 7: User Story 4 - Discover halls and informational pages (Priority: P3)

**Goal**: Public home (hero + exactly 6 featured halls), halls listing, about, and contact pages.

**Independent Test**: Home shows hero + 6 featured halls; listing shows all halls; about/contact render; hall detail reachable from listing.

### Implementation for User Story 4

- [ ] T045 [P] [US4] Build home page in `app/(marketing)/page.tsx`: hero section + exactly 6 featured halls via `getHalls({featured:true})` limited to 6 (FR-020, SC-007)
- [ ] T046 [P] [US4] Build halls listing in `app/halls/page.tsx` showing all halls with `HallCard` (FR-001)
- [ ] T047 [P] [US4] Create reusable `HallCard` in `app/_components/HallCard.tsx` (mobile-first, next/image)
- [ ] T048 [P] [US4] Build about page in `app/(marketing)/about/page.tsx`
- [ ] T049 [US4] Build contact page in `app/(marketing)/contact/page.tsx` with an inquiry form that records the message (per Assumptions; routing out of scope)

**Checkpoint**: All discovery/marketing pages live; site is publicly browsable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements spanning multiple stories

- [ ] T050 [P] Mobile-width verification pass on every page (no horizontal scroll, touch targets) — SC-005, Principle IV
- [ ] T051 [P] Add consistent loading/empty/error states across dashboard and hall pages
- [ ] T052 Run `npm run test` and `npm run test:e2e`; ensure authz + no-double-booking tests pass (Constitution Quality Gates)
- [ ] T053 [P] Run lint + `tsc --noEmit`; resolve any strict-mode type errors (no `any`, no suppressions)
- [ ] T054 Execute quickstart.md validation checklist (SC-002/003/004/007/008) manually end-to-end
- [ ] T055 [P] Configure Vercel deploy: env vars, `prisma generate` in build, `prisma migrate deploy`, seed admin once (quickstart.md Deploy section)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phases 3–7)**: All depend on Foundational completion
- **Polish (Phase 8)**: Depends on the targeted user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational. No dependency on other stories (can use seeded user).
- **US2 (P1)**: After Foundational. Shares `lib/booking.ts` + dashboard with US1; build US1 first for the cleanest MVP, but US2's approval logic is independently testable via seeded pending requests.
- **US3 (P2)**: After Foundational. Independent; replaces seeded-account usage with real registration/login.
- **US5 (P2)**: After Foundational; UI lives behind the admin dashboard (US3 auth helps but `requireAdmin` works with a seeded admin).
- **US4 (P3)**: After Foundational. Fully independent public pages.

### Within Each User Story

- Tests (where present) written to FAIL first, then implementation
- Domain logic in `lib/` before server actions before UI
- `lib/` units are framework-agnostic and parallelizable with UI scaffolding

### Parallel Opportunities

- Setup: T003, T004, T005 in parallel
- Foundational: T008, T009, T010, T013, T014, T016 in parallel after schema (T006/T007)
- US1: T017/T018 (tests) parallel; T021/T022 (page/picker) parallel
- US2: T026/T027/T028 (tests) parallel; T030/T031 parallel
- Cross-story: once Foundational is done, US1+US2, US3, US4, US5 can be staffed in parallel

---

## Parallel Example: User Story 1

```bash
# Tests for US1 together:
Task: "Unit test booking creation rules in tests/unit/booking-create.test.ts"
Task: "E2E booking request flow in tests/e2e/booking-request.spec.ts"

# UI scaffolding for US1 together:
Task: "Hall detail page in app/halls/[hallId]/page.tsx"
Task: "SlotPicker component in app/_components/SlotPicker.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3 (US1) + Phase 4 (US2) — the request → approval loop
4. **STOP and VALIDATE**: no double-booking, role separation, availability correctness
5. Deploy/demo — this is the functional MVP

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 + US2 → MVP (booking + approval, no double-booking)
3. US3 → real registration/login + role-aware dashboard
4. US5 → admin hall management
5. US4 → public marketing/discovery pages
6. Polish → mobile verification, tests green, deploy

---

## Notes

- [P] = different files, no dependencies
- [Story] label maps each task to its user story for traceability
- Tests are scoped to constitutional guarantees (Principles II & III) + the two P1 journeys
- Commit after each task or logical group
- The no-double-booking guarantee is the partial unique index (T007) + transactional approval (T029) — do not weaken either
- Verify each story at mobile width before marking its checkpoint complete
