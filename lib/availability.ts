import { prisma } from "./prisma";
import { today, maxBookingDate, toDateOnly, formatDateOnly } from "./dates";

export type SlotStatus = "AVAILABLE" | "BOOKED";

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  day: SlotStatus;
  night: SlotStatus;
}

/**
 * Availability is derived ONLY from APPROVED bookings (Constitution Principle I).
 * Pending / Rejected / Cancelled requests never affect availability.
 *
 * Returns, for each date in the (clamped) range, the DAY and NIGHT status.
 */
export async function getAvailability(
  hallId: string,
  from: Date = today(),
  to: Date = maxBookingDate(),
): Promise<DayAvailability[]> {
  const start = toDateOnly(from);
  const end = toDateOnly(to);

  const approved = await prisma.bookingRequest.findMany({
    where: {
      hallId,
      status: "APPROVED",
      date: { gte: start, lte: end },
    },
    select: { date: true, slot: true },
  });

  // Key = YYYY-MM-DD; value = set of booked slots.
  const booked = new Map<string, Set<"DAY" | "NIGHT">>();
  for (const b of approved) {
    const key = formatDateOnly(b.date);
    if (!booked.has(key)) booked.set(key, new Set());
    booked.get(key)!.add(b.slot as "DAY" | "NIGHT");
  }

  const result: DayAvailability[] = [];
  for (let d = new Date(start); d.getTime() <= end.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
    const key = formatDateOnly(d);
    const slots = booked.get(key);
    result.push({
      date: key,
      day: slots?.has("DAY") ? "BOOKED" : "AVAILABLE",
      night: slots?.has("NIGHT") ? "BOOKED" : "AVAILABLE",
    });
  }
  return result;
}

/** Whether a single hall/date/slot is currently booked (has an APPROVED booking). */
export async function isSlotBooked(
  hallId: string,
  date: Date | string,
  slot: "DAY" | "NIGHT",
): Promise<boolean> {
  const existing = await prisma.bookingRequest.findFirst({
    where: { hallId, date: toDateOnly(date), slot, status: "APPROVED" },
    select: { id: true },
  });
  return existing !== null;
}
