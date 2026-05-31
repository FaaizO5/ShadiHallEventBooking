import Link from "next/link";
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

async function UserDashboard({ userId }: { userId: string }) {
  const bookings = await getUserBookings(userId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-semibold">My bookings</h1>
      {bookings.length === 0 ? (
        <p className="mt-4 text-sm text-black/60">
          You have no bookings yet.{" "}
          <Link href="/halls" className="underline">
            Browse halls
          </Link>{" "}
          to request one.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/10 p-4"
            >
              <div>
                <Link href={`/halls/${b.hall.id}`} className="font-medium hover:underline">
                  {b.hall.name}
                </Link>
                <p className="text-sm text-black/60">
                  {formatDateOnly(b.date)} · {b.slot}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.status} />
                {b.status === "PENDING" && <CancelButton bookingId={b.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function AdminDashboard() {
  const [pending, approved] = await Promise.all([
    getPendingBookings(),
    getApprovedBookings(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">
          Pending requests <span className="text-black/40">({pending.length})</span>
        </h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-black/60">No pending requests.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {pending.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{b.hall.name}</p>
                  <p className="text-sm text-black/60">
                    {formatDateOnly(b.date)} · {b.slot} · {b.user.email}
                  </p>
                </div>
                <AdminActions bookingId={b.id} kind="pending" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Approved bookings <span className="text-black/40">({approved.length})</span>
        </h2>
        {approved.length === 0 ? (
          <p className="mt-2 text-sm text-black/60">No approved bookings.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {approved.map((b) => (
              <li
                key={b.id}
                className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{b.hall.name}</p>
                  <p className="text-sm text-black/60">
                    {formatDateOnly(b.date)} · {b.slot} · {b.user.email}
                  </p>
                </div>
                <AdminActions bookingId={b.id} kind="approved" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
