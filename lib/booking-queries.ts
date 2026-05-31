import { prisma } from "./prisma";

/** A user's own bookings, newest first (FR-015). */
export async function getUserBookings(userId: string) {
  return prisma.bookingRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { hall: { select: { id: true, name: true } } },
  });
}

/** All pending requests across users for the admin queue (FR-016). */
export async function getPendingBookings() {
  return prisma.bookingRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      hall: { select: { id: true, name: true } },
      user: { select: { email: true, name: true } },
    },
  });
}

/** Approved bookings across users (so admin can cancel/release a slot). */
export async function getApprovedBookings() {
  return prisma.bookingRequest.findMany({
    where: { status: "APPROVED" },
    orderBy: { date: "asc" },
    include: {
      hall: { select: { id: true, name: true } },
      user: { select: { email: true, name: true } },
    },
  });
}
