"use server";

import { revalidatePath } from "next/cache";
import { assertUser, assertAdmin, AuthorizationError } from "@/lib/guards";
import {
  createBooking,
  cancelOwnPending,
  approveBooking,
  rejectBooking,
  adminCancelBooking,
} from "@/lib/booking";
import { DomainError, type ActionResult } from "@/lib/errors";
import type { Slot } from "@/lib/validation";

function toResult(e: unknown): ActionResult {
  if (e instanceof DomainError) return { ok: false, error: e.message, code: e.code };
  if (e instanceof AuthorizationError) return { ok: false, error: e.message, code: "FORBIDDEN" };
  console.error(e);
  return { ok: false, error: "Something went wrong. Please try again." };
}

// US1 — create a booking request (signed-in users only).
export async function createBookingAction(input: {
  hallId: string;
  date: string;
  slot: Slot;
}): Promise<ActionResult> {
  try {
    const user = await assertUser();
    await createBooking(user.id, input);
    revalidatePath(`/halls/${input.hallId}`);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return toResult(e);
  }
}

// US1 — cancel the caller's own pending request.
export async function cancelBookingAction(bookingId: string): Promise<ActionResult> {
  try {
    const user = await assertUser();
    await cancelOwnPending(user.id, bookingId);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return toResult(e);
  }
}

// US2 — admin approve (admin only; Principle II enforced server-side).
export async function approveAction(bookingId: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const approved = await approveBooking(admin.id, bookingId);
    revalidatePath("/dashboard");
    revalidatePath(`/halls/${approved.hallId}`);
    return { ok: true };
  } catch (e) {
    return toResult(e);
  }
}

// US2 — admin reject.
export async function rejectAction(bookingId: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    await rejectBooking(admin.id, bookingId);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return toResult(e);
  }
}

// US2 — admin cancel an approved booking (releases the slot).
export async function adminCancelAction(bookingId: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const cancelled = await adminCancelBooking(admin.id, bookingId);
    revalidatePath("/dashboard");
    revalidatePath(`/halls/${cancelled.hallId}`);
    return { ok: true };
  } catch (e) {
    return toResult(e);
  }
}
