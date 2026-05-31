// Date helpers for the booking window (today .. today + 12 months), FR-008.
// Dates are treated as date-only (no time component) in a single business timezone.
// We normalize to UTC midnight so comparisons and DB `@db.Date` values are stable.

export const BOOKING_WINDOW_MONTHS = 12;

/** Normalize a Date (or ISO date string) to UTC midnight (date-only). */
export function toDateOnly(value: Date | string): Date {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Today at UTC midnight. */
export function today(): Date {
  return toDateOnly(new Date());
}

/** The latest selectable date: today + BOOKING_WINDOW_MONTHS, at UTC midnight. */
export function maxBookingDate(from: Date = today()): Date {
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + BOOKING_WINDOW_MONTHS);
  return toDateOnly(d);
}

/** True when `date` is within [today, today+12mo] inclusive. */
export function isWithinBookingWindow(date: Date | string): boolean {
  const d = toDateOnly(date);
  return d.getTime() >= today().getTime() && d.getTime() <= maxBookingDate().getTime();
}

/** Format a date-only value as YYYY-MM-DD (UTC). */
export function formatDateOnly(value: Date | string): string {
  return toDateOnly(value).toISOString().slice(0, 10);
}
