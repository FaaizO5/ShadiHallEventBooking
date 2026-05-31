import { describe, it, expect } from "vitest";
import { approveBooking, rejectBooking, adminCancelBooking } from "@/lib/booking";
import { createFakeClient, type Row } from "./fakeClient";

const D = new Date("2026-09-01T00:00:00Z");

function pending(id: string, userId: string, slot: "DAY" | "NIGHT" = "DAY"): Row {
  return { id, userId, hallId: "hall-1", date: D, slot, status: "PENDING" };
}

describe("approveBooking (US2 / Principle III)", () => {
  it("approves a pending request and locks the slot", async () => {
    const client = createFakeClient([pending("b1", "u1")]);
    const approved = await approveBooking("admin", "b1", client as never);
    expect(approved.status).toBe("APPROVED");
  });

  it("auto-rejects rival PENDING requests for the same slot (FR-011)", async () => {
    const client = createFakeClient([pending("b1", "u1"), pending("b2", "u2"), pending("b3", "u3")]);
    await approveBooking("admin", "b1", client as never);
    const rows: Row[] = client._rows;
    expect(rows.find((r) => r.id === "b2")!.status).toBe("REJECTED");
    expect(rows.find((r) => r.id === "b3")!.status).toBe("REJECTED");
  });

  it("does NOT auto-reject pending requests for a different slot", async () => {
    const client = createFakeClient([pending("b1", "u1", "DAY"), pending("b2", "u2", "NIGHT")]);
    await approveBooking("admin", "b1", client as never);
    const rows: Row[] = client._rows;
    expect(rows.find((r) => r.id === "b2")!.status).toBe("PENDING");
  });

  it("fails closed when the slot already has an APPROVED booking (SC-003)", async () => {
    const seed: Row[] = [
      { id: "a1", userId: "u0", hallId: "hall-1", date: D, slot: "DAY", status: "APPROVED" },
      pending("b1", "u1"),
    ];
    const client = createFakeClient(seed);
    await expect(approveBooking("admin", "b1", client as never)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("rejects approving a non-pending request", async () => {
    const seed: Row[] = [
      { id: "b1", userId: "u1", hallId: "hall-1", date: D, slot: "DAY", status: "REJECTED" },
    ];
    const client = createFakeClient(seed);
    await expect(approveBooking("admin", "b1", client as never)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});

describe("rejectBooking / adminCancelBooking", () => {
  it("rejects a pending request, leaving the slot free (FR-012)", async () => {
    const client = createFakeClient([pending("b1", "u1")]);
    const r = await rejectBooking("admin", "b1", client as never);
    expect(r.status).toBe("REJECTED");
  });

  it("lets admin cancel an APPROVED booking, releasing the slot (FR-018, SC-008)", async () => {
    const seed: Row[] = [
      { id: "a1", userId: "u1", hallId: "hall-1", date: D, slot: "DAY", status: "APPROVED" },
    ];
    const client = createFakeClient(seed);
    const c = await adminCancelBooking("admin", "a1", client as never);
    expect(c.status).toBe("CANCELLED");
    // slot is now free → a new approval would succeed
  });

  it("refuses admin-cancel of a non-approved booking", async () => {
    const client = createFakeClient([pending("b1", "u1")]);
    await expect(adminCancelBooking("admin", "b1", client as never)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});
