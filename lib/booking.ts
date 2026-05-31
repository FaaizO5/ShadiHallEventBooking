import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "./prisma";
import { bookingInputSchema, type BookingInput } from "./validation";
import { toDateOnly } from "./dates";
import { DomainError } from "./errors";

// Minimal client surface the booking logic needs. Accepting this (rather than the
// concrete PrismaClient) keeps the domain logic unit-testable with a fake.
export type BookingClient = Pick<PrismaClient, "bookingRequest" | "hall" | "$transaction">;

/**
 * Create a booking request (US1). Enforces:
 *  - input validity incl. date window today..+12mo (FR-008)
 *  - hall exists (FR mapping)
 *  - slot not already APPROVED (FR-006)
 *  - no duplicate PENDING by the same user for the same hall/date/slot (FR-007)
 * Result is a PENDING request (FR-004).
 */
export async function createBooking(
  userId: string,
  input: BookingInput,
  client: BookingClient = defaultPrisma,
) {
  const parsed = bookingInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError("VALIDATION", parsed.error.issues[0]?.message ?? "Invalid booking");
  }
  const { hallId, slot } = parsed.data;
  const date = toDateOnly(parsed.data.date);

  const hall = await client.hall.findUnique({ where: { id: hallId }, select: { id: true } });
  if (!hall) {
    throw new DomainError("NOT_FOUND", "Hall not found");
  }

  // FR-006: slot already booked (an APPROVED booking exists).
  const approved = await client.bookingRequest.findFirst({
    where: { hallId, date, slot, status: "APPROVED" },
    select: { id: true },
  });
  if (approved) {
    throw new DomainError("SLOT_BOOKED", "This slot is already booked");
  }

  // FR-007: duplicate pending request by this user.
  const duplicate = await client.bookingRequest.findFirst({
    where: { hallId, date, slot, status: "PENDING", userId },
    select: { id: true },
  });
  if (duplicate) {
    throw new DomainError("DUPLICATE_PENDING", "You already have a pending request for this slot");
  }

  return client.bookingRequest.create({
    data: { userId, hallId, date, slot, status: "PENDING" },
  });
}

/** Cancel the caller's OWN pending request (FR-017). Admin-cancel of APPROVED is separate. */
export async function cancelOwnPending(
  userId: string,
  bookingId: string,
  client: BookingClient = defaultPrisma,
) {
  const booking = await client.bookingRequest.findUnique({
    where: { id: bookingId },
    select: { id: true, userId: true, status: true },
  });
  if (!booking) throw new DomainError("NOT_FOUND", "Booking not found");
  if (booking.userId !== userId) {
    throw new DomainError("FORBIDDEN", "You can only cancel your own requests");
  }
  if (booking.status !== "PENDING") {
    throw new DomainError("FORBIDDEN", "Only pending requests can be cancelled by a user");
  }
  return client.bookingRequest.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
}

/**
 * Approve a request (US2, admin). Transactional (FR-010/FR-011):
 *  - re-validate the slot is not already APPROVED
 *  - set this request APPROVED
 *  - auto-reject all other PENDING requests for the same hall/date/slot
 * The DB partial unique index is the final guarantee and makes a concurrent double
 * approval fail closed (Constitution Principle III, SC-003).
 */
export async function approveBooking(
  adminId: string,
  bookingId: string,
  client: BookingClient = defaultPrisma,
) {
  return client.$transaction(async (tx) => {
    const target = await tx.bookingRequest.findUnique({
      where: { id: bookingId },
      select: { id: true, hallId: true, date: true, slot: true, status: true },
    });
    if (!target) throw new DomainError("NOT_FOUND", "Booking not found");
    if (target.status !== "PENDING") {
      throw new DomainError("CONFLICT", "Only pending requests can be approved");
    }

    const alreadyApproved = await tx.bookingRequest.findFirst({
      where: {
        hallId: target.hallId,
        date: target.date,
        slot: target.slot,
        status: "APPROVED",
      },
      select: { id: true },
    });
    if (alreadyApproved) {
      throw new DomainError("CONFLICT", "This slot has just been booked");
    }

    const approved = await tx.bookingRequest.update({
      where: { id: bookingId },
      data: { status: "APPROVED", decidedById: adminId, decidedAt: new Date() },
    });

    // FR-011: auto-reject other pending requests for the same slot.
    await tx.bookingRequest.updateMany({
      where: {
        hallId: target.hallId,
        date: target.date,
        slot: target.slot,
        status: "PENDING",
        id: { not: bookingId },
      },
      data: { status: "REJECTED", decidedById: adminId, decidedAt: new Date() },
    });

    return approved;
  });
}

/** Reject a pending request (US2, admin) — slot remains available (FR-012). */
export async function rejectBooking(
  adminId: string,
  bookingId: string,
  client: BookingClient = defaultPrisma,
) {
  const booking = await client.bookingRequest.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true },
  });
  if (!booking) throw new DomainError("NOT_FOUND", "Booking not found");
  if (booking.status !== "PENDING") {
    throw new DomainError("CONFLICT", "Only pending requests can be rejected");
  }
  return client.bookingRequest.update({
    where: { id: bookingId },
    data: { status: "REJECTED", decidedById: adminId, decidedAt: new Date() },
  });
}

/** Admin cancels an APPROVED booking, releasing the slot (FR-018, SC-008). */
export async function adminCancelBooking(
  adminId: string,
  bookingId: string,
  client: BookingClient = defaultPrisma,
) {
  const booking = await client.bookingRequest.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true },
  });
  if (!booking) throw new DomainError("NOT_FOUND", "Booking not found");
  if (booking.status !== "APPROVED") {
    throw new DomainError("CONFLICT", "Only approved bookings can be cancelled here");
  }
  return client.bookingRequest.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", decidedById: adminId, decidedAt: new Date() },
  });
}
