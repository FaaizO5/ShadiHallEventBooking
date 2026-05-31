import Link from "next/link";
import { CalendarDays, Inbox } from "lucide-react";
import { requireUser } from "@/lib/guards";
import {
  getUserBookings,
  getPendingBookings,
  getApprovedBookings,
} from "@/lib/booking-queries";
import { formatDateOnly } from "@/lib/dates";
import StatusBadge from "./_components/StatusBadge";
import CancelButton from "./_components/CancelButton";
import AdminActions from "./_components/AdminActions";

export default async function DashboardPage() {
  const user = await requireUser(); // FR-023: redirects unauthenticated visitors

  return user.role === "ADMIN" ? <AdminDashboard /> : <UserDashboard userId={user.id} />;
}

function DashboardShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-3xl text-bordeaux sm:text-4xl">{title}</h1>
        <div className="hairline mt-6 max-w-[90px] !bg-[linear-gradient(to_right,var(--color-gold),transparent)]" />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-gold/30 bg-cream/50 p-10 text-center">
      <Inbox className="mx-auto h-8 w-8 text-gold-deep" aria-hidden />
      <p className="mt-3 text-sm text-charcoal-soft">{children}</p>
    </div>
  );
}

async function UserDashboard({ userId }: { userId: string }) {
  const bookings = await getUserBookings(userId);

  return (
    <DashboardShell eyebrow="Your Account" title="My Bookings">
      {bookings.length === 0 ? (
        <EmptyState>
          You have no bookings yet.{" "}
          <Link href="/halls" className="font-medium text-bordeaux underline decoration-gold/50 underline-offset-2 hover:decoration-gold">
            Browse halls
          </Link>{" "}
          to request one.
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gold/15 bg-white p-5 shadow-[var(--shadow-soft)] transition-colors hover:border-gold/35"
            >
              <div>
                <Link
                  href={`/halls/${b.hall.id}`}
                  className="font-serif text-lg text-charcoal transition-colors hover:text-bordeaux"
                >
                  {b.hall.name}
                </Link>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-soft">
                  <CalendarDays className="h-3.5 w-3.5 text-gold-deep" aria-hidden />
                  {formatDateOnly(b.date)} · {b.slot}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={b.status} />
                {b.status === "PENDING" && <CancelButton bookingId={b.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}

async function AdminDashboard() {
  const [pending, approved] = await Promise.all([
    getPendingBookings(),
    getApprovedBookings(),
  ]);

  return (
    <DashboardShell eyebrow="Administration" title="Admin Dashboard">
      <section>
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl text-charcoal">Pending Requests</h2>
          <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-deep">
            {pending.length}
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="mt-4">
            <EmptyState>No pending requests right now.</EmptyState>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {pending.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-4 rounded-2xl border border-gold/15 bg-white p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-serif text-lg text-charcoal">{b.hall.name}</p>
                  <p className="mt-1 text-sm text-charcoal-soft">
                    {formatDateOnly(b.date)} · {b.slot} ·{" "}
                    <span className="text-bordeaux">{b.user.email}</span>
                  </p>
                </div>
                <AdminActions bookingId={b.id} kind="pending" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl text-charcoal">Approved Bookings</h2>
          <span className="rounded-full bg-available-bg px-2.5 py-0.5 text-xs font-semibold text-available">
            {approved.length}
          </span>
        </div>

        {approved.length === 0 ? (
          <div className="mt-4">
            <EmptyState>No approved bookings yet.</EmptyState>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {approved.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-4 rounded-2xl border border-gold/15 bg-white p-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-serif text-lg text-charcoal">{b.hall.name}</p>
                  <p className="mt-1 text-sm text-charcoal-soft">
                    {formatDateOnly(b.date)} · {b.slot} ·{" "}
                    <span className="text-bordeaux">{b.user.email}</span>
                  </p>
                </div>
                <AdminActions bookingId={b.id} kind="approved" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
