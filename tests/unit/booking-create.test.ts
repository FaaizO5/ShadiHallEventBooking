import { describe, it, expect } from "vitest";
import { createBooking, cancelOwnPending } from "@/lib/booking";
import { createFakeClient, type Row } from "./fakeClient";
import { formatDateOnly, today, maxBookingDate } from "@/lib/dates";

const futureDate = formatDateOnly(
  new Date(today().getTime() + 30 * 24 * 60 * 60 * 1000),
);

describe("createBooking (US1)", () => {
  it("creates a PENDING request for a valid future date/slot (FR-004)", async () => {
    const client = createFakeClient();
    const b = await createBooking("user-1", { hallId: "hall-1", date: futureDate, slot: "DAY" }, client as never);
    expect(b.status).toBe("PENDING");
    expect(b.slot).toBe("DAY");
  });

  it("rejects past dates (FR-008)", async () => {
    const client = createFakeClient();
    const past = formatDateOnly(new Date(today().getTime() - 24 * 60 * 60 * 1000));
    await expect(
      createBooking("user-1", { hallId: "hall-1", date: past, slot: "DAY" }, client as never),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("rejects dates more than 12 months ahead (FR-008)", async () => {
    const client = createFakeClient();
    const tooFar = formatDateOnly(
      new Date(maxBookingDate().getTime() + 7 * 24 * 60 * 60 * 1000),
    );
    await expect(
      createBooking("user-1", { hallId: "hall-1", date: tooFar, slot: "NIGHT" }, client as never),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("rejects when the slot is already APPROVED (FR-006)", async () => {
    const seed: Row[] = [
      { id: "b1", userId: "other", hallId: "hall-1", date: new Date(`${futureDate}T00:00:00Z`), slot: "DAY", status: "APPROVED" },
    ];
    const client = createFakeClient(seed);
    await expect(
      createBooking("user-1", { hallId: "hall-1", date: futureDate, slot: "DAY" }, client as never),
    ).rejects.toMatchObject({ code: "SLOT_BOOKED" });
  });

  it("allows DAY when only NIGHT is booked (independent slots)", async () => {
    const seed: Row[] = [
      { id: "b1", userId: "other", hallId: "hall-1", date: new Date(`${futureDate}T00:00:00Z`), slot: "NIGHT", status: "APPROVED" },
    ];
    const client = createFakeClient(seed);
    const b = await createBooking("user-1", { hallId: "hall-1", date: futureDate, slot: "DAY" }, client as never);
    expect(b.status).toBe("PENDING");
  });

  it("rejects a duplicate PENDING by the same user (FR-007)", async () => {
    const client = createFakeClient();
    await createBooking("user-1", { hallId: "hall-1", date: futureDate, slot: "DAY" }, client as never);
    await expect(
      createBooking("user-1", { hallId: "hall-1", date: futureDate, slot: "DAY" }, client as never),
    ).rejects.toMatchObject({ code: "DUPLICATE_PENDING" });
  });

  it("rejects booking for a non-existent hall", async () => {
    const client = createFakeClient();
    await expect(
      createBooking("user-1", { hallId: "missing", date: futureDate, slot: "DAY" }, client as never),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("cancelOwnPending (FR-017)", () => {
  it("lets the owner cancel their own pending request", async () => {
    const client = createFakeClient();
    const b = await createBooking("user-1", { hallId: "hall-1", date: futureDate, slot: "DAY" }, client as never);
    const cancelled = await cancelOwnPending("user-1", b.id, client as never);
    expect(cancelled.status).toBe("CANCELLED");
  });

  it("forbids cancelling another user's request", async () => {
    const client = createFakeClient();
    const b = await createBooking("user-1", { hallId: "hall-1", date: futureDate, slot: "DAY" }, client as never);
    await expect(cancelOwnPending("user-2", b.id, client as never)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});
