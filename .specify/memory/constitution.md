<!--
SYNC IMPACT REPORT
==================
Version change: (template, unversioned) → 1.0.0
Bump rationale: Initial ratification — first concrete constitution replacing the
unfilled template. MAJOR baseline established at 1.0.0.

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Single Source of Truth for Availability
  - [PRINCIPLE_2_NAME] → II. Role Separation
  - [PRINCIPLE_3_NAME] → III. No Double-Booking (NON-NEGOTIABLE)
  - [PRINCIPLE_4_NAME] → IV. Mobile-First Design
  - [PRINCIPLE_5_NAME] → (removed; project defines exactly four core principles)

Added sections:
  - Technology Standards (Section 2)
  - Development Workflow & Quality Gates (Section 3)

Removed sections:
  - Fifth placeholder principle slot (not used)

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no change needed (Constitution Check
    gate references the constitution dynamically)
  - .specify/templates/spec-template.md ✅ no change needed (generic placeholders)
  - .specify/templates/tasks-template.md ✅ no change needed (generic placeholders)
  - .specify/templates/checklist-template.md ✅ no change needed

Follow-up TODOs: none
-->

# Shaadi Hall Booking Constitution

## Core Principles

### I. Single Source of Truth for Availability

Availability is derived from exactly one fact: an **APPROVED** booking. A slot is
considered free unless an approved booking occupies it.

- Only a booking in `APPROVED` status MUST lock a slot. Bookings in `PENDING`,
  `REJECTED`, or `CANCELLED` status MUST NOT affect displayed or computed availability.
- Every availability query MUST compute its result from approved bookings only; no
  cached, denormalized, or manually-set availability flag may serve as a competing
  source of truth.
- The UI and the API MUST report the same availability for the same slot at the same
  time — there is one answer, not two.

**Rationale**: Conflicting availability views are the root cause of disputes and
double-bookings. Anchoring availability to a single status removes ambiguity and makes
the system's behavior provable.

### II. Role Separation

The system has exactly two roles — `admin` and `user` — with non-overlapping authority
over booking state transitions.

- Only an `admin` MAY approve or reject a booking request. A `user` MUST NOT be able to
  transition a booking into `APPROVED` or `REJECTED` under any code path.
- A `user` MAY create booking requests and view/cancel their own requests; a `user` MUST
  NOT view or act on other users' bookings beyond public availability.
- Authorization MUST be enforced server-side on every mutating action. Client-side role
  checks are presentation only and MUST NOT be trusted as the security boundary.

**Rationale**: Approval authority is the integrity gate of the whole system. Enforcing it
server-side and restricting it to admins prevents privilege escalation and unauthorized
slot locking.

### III. No Double-Booking (NON-NEGOTIABLE)

A given slot (hall + date/time range) MUST have at most one `APPROVED` booking.

- This invariant MUST be enforced at the database level via a constraint (e.g., a unique
  constraint or exclusion constraint on the slot key for approved bookings), not by
  application logic alone.
- Approval MUST occur inside a transaction that re-validates slot availability at commit
  time, so concurrent approvals cannot both succeed.
- If the invariant cannot be guaranteed for an operation, that operation MUST fail closed
  (reject) rather than risk a conflicting approval.

**Rationale**: Double-booking is the single worst failure mode for a venue. Defense in
depth — database constraint plus transactional approval — makes it structurally
impossible rather than merely unlikely.

### IV. Mobile-First Design

The product is designed and built for mobile screens first, then progressively enhanced
for larger viewports.

- All UI MUST be authored mobile-first with Tailwind: base styles target small screens,
  larger layouts are added via responsive variants (`sm:`, `md:`, `lg:`).
- Interactive targets MUST be touch-friendly and usable without a mouse or hover.
- A feature is not "done" until it has been verified on a mobile-width viewport; desktop
  is the enhancement, not the baseline.

**Rationale**: The majority of booking traffic is mobile. Designing for the smallest
screen first guarantees the core flow works everywhere instead of being retrofitted.

## Technology Standards

The following stack is mandatory for all features unless an amendment changes it:

- **Framework**: Next.js 14 with the App Router. New routing/data patterns MUST follow
  App Router conventions (server components by default, route handlers, server actions
  where appropriate). Pages Router MUST NOT be introduced.
- **Language**: TypeScript in **strict** mode. `any` MUST be avoided; type errors MUST NOT
  be suppressed to ship. Strict compiler settings MUST remain enabled.
- **Styling**: Tailwind CSS. Component styling MUST use Tailwind utilities; ad-hoc global
  CSS is reserved for genuinely global concerns.
- **Authentication**: NextAuth with the Credentials provider. Sessions and role claims
  MUST be the basis for server-side authorization (see Principle II).
- **Database**: Neon Postgres accessed via Prisma. All schema changes MUST go through
  Prisma migrations; the double-booking constraint (Principle III) MUST live in the schema.

## Development Workflow & Quality Gates

- Every feature MUST pass the Constitution Check gate during planning before
  implementation begins; violations require an explicit, documented justification or a
  redesign.
- Server-side authorization (Principle II) and the no-double-booking invariant
  (Principle III) MUST be covered by tests before a booking-related feature is considered
  complete.
- TypeScript strict checks and lint MUST pass before merge.
- Any change to availability logic, approval flow, or role permissions MUST be reviewed
  against Principles I–III explicitly in the pull request.

## Governance

This constitution supersedes other development practices for the Shaadi Hall Booking
project. When guidance conflicts, the constitution wins.

- **Amendments**: Proposed changes MUST be documented in this file via pull request,
  include rationale, and update the version and dates below. Dependent templates under
  `.specify/templates/` MUST be re-checked for consistency as part of the amendment.
- **Versioning policy**: Semantic versioning applies to this document.
  - MAJOR: backward-incompatible governance changes or principle removals/redefinitions.
  - MINOR: a new principle or section is added, or guidance is materially expanded.
  - PATCH: clarifications, wording, or non-semantic refinements.
- **Compliance review**: All pull requests and reviews MUST verify compliance with the
  Core Principles. Complexity or deviations MUST be justified in writing; unjustified
  violations block merge. Runtime development guidance lives in `AGENTS.md` / `CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2026-05-30 | **Last Amended**: 2026-05-30
