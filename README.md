# Shaadi Hall Booking

An elegant, full-stack **wedding hall booking platform**. Visitors browse curated
venues, pick a date and a **Day** or **Night** slot, and submit a booking request.
Admins review the queue and approve or reject requests — and once a request is
approved, that hall / date / slot is locked for everyone else and shown as **Booked**.

Built with the Next.js App Router, Prisma on Neon Postgres, and NextAuth, wrapped in a
custom "wedding-luxury" design system (deep bordeaux, champagne gold, warm ivory).

---

## Features

- **Browse venues** — home page with a hero and 6 featured halls, plus a full listing.
- **Hall detail + booking** — date picker (today through 12 months ahead) with elegant
  Day / Night slot cards; booked slots are dimmed and locked.
- **Authentication** — email + password (NextAuth Credentials, JWT sessions); register,
  login, logout.
- **Booking workflow** — requests start as `PENDING`; users track their own bookings and
  can cancel pending ones.
- **Admin approval** — admins see the pending queue across all users, approve/reject
  requests, and cancel approved bookings (releasing the slot).
- **No double-booking guarantee** — enforced at the database level with a partial unique
  index on approved bookings, plus transactional approval logic.
- **Responsive & accessible** — mobile-first, semantic HTML, visible focus states.

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first `@theme`), Lucide icons |
| Fonts | Playfair Display (serif) + Inter (sans) via `next/font` |
| Database | PostgreSQL on [Neon](https://neon.tech) |
| ORM | [Prisma](https://www.prisma.io) with the Neon serverless adapter |
| Auth | [NextAuth v4](https://next-auth.js.org) (Credentials provider) |
| Testing | Vitest (unit) + Playwright (e2e) |

## Design System

The visual language lives in `app/globals.css` as a Tailwind v4 `@theme`, exposing
reusable utilities:

- **Colors** — `bg-bordeaux` `#6E1423` (primary), `text-gold` `#C9A227` (accent, used
  sparingly), `bg-ivory` / `bg-cream` grounds, `text-charcoal` ink.
- **Type** — `font-serif` (Playfair Display) for editorial headings, `font-sans` (Inter)
  for body.
- **Reusable components** in `app/_components/`: `Button`, `Badge`, `HallCard`, `Nav`,
  `Footer`, `PageHeader`, `SlotPicker`.

---

## Getting Started

### Prerequisites

- **Node.js 20.x** and npm
- A **Neon Postgres** project (free tier works) with both a pooled and a direct
  connection string

### 1. Install

```bash
npm install
```

### 2. Environment

Create a `.env` file in the project root (git-ignored):

```bash
DATABASE_URL="postgres://...-pooler.neon.tech/db?sslmode=require"   # pooled (runtime)
DIRECT_URL="postgres://....neon.tech/db?sslmode=require"            # direct (migrations)
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="admin@example.com"
SEED_ADMIN_PASSWORD="<choose-a-strong-password>"
```

> `NEXTAUTH_URL` must be set (an empty value breaks NextAuth). Use the production URL
> when deploying.

### 3. Database

```bash
npm run db:migrate     # apply Prisma migrations (incl. the no-double-booking index)
npm run db:seed        # create the admin user + sample featured halls
```

### 4. Run

```bash
npm run dev            # http://localhost:3000
```

Sign in with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` credentials to access the
admin dashboard.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` (production) |
| `npm run db:seed` | Seed admin + sample halls |
| `npm run db:generate` | Regenerate the Prisma client |

---

## Project Structure

```
app/
  _components/        Shared UI (Button, Badge, HallCard, Nav, Footer, SlotPicker, …)
  _actions/           Server actions (auth, booking)
  (auth)/             login & register routes
  halls/              Halls listing + [hallId] detail
  dashboard/          User & admin dashboards
  about/  contact/    Marketing pages
  api/auth/           NextAuth route handler
  globals.css         Tailwind v4 theme (@theme palette + fonts)
  layout.tsx          Root layout (fonts, Nav, Footer)
lib/                  Domain logic: prisma, auth, guards, availability,
                      booking, booking-queries, hall, dates, validation
prisma/
  schema.prisma       User, Hall, BookingRequest models (+ Role, Slot, BookingStatus enums)
  seed.ts             Admin + featured halls seed
  migrations/         Includes the partial unique index for no-double-booking
public/halls/         Local hall images
specs/                Feature spec, plan, data model, and tasks
```

## How No-Double-Booking Works

A partial unique index guarantees at most one **approved** booking per
`(hallId, date, slot)`:

```sql
CREATE UNIQUE INDEX "booking_request_unique_approved"
ON "BookingRequest" ("hallId", "date", "slot")
WHERE "status" = 'APPROVED';
```

Approval runs in a transaction: the chosen request is set to `APPROVED`, rival pending
requests for the same slot are auto-rejected, and the index fails the transaction closed
if a conflict slips through. Cancelling an approved booking releases the slot.

---

## Testing

```bash
npm run test       # unit: availability, validation, approval rules
npm run test:e2e   # e2e: booking + approval journeys
```

## Deployment (Vercel)

1. Import the repo and set the environment variables above
   (`NEXTAUTH_URL` = your production URL).
2. The build runs `prisma generate`; apply migrations with `npm run db:deploy`.
3. Seed the admin once against the production database.
