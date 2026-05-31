// A minimal in-memory fake of the Prisma surface used by lib/booking.ts.
// Models the PARTIAL unique index: at most one APPROVED row per (hallId, date, slot).

import { DomainError } from "@/lib/errors";

export type Status = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type Slot = "DAY" | "NIGHT";

export interface Row {
  id: string;
  userId: string;
  hallId: string;
  date: Date;
  slot: Slot;
  status: Status;
  decidedById?: string | null;
  decidedAt?: Date | null;
}

function sameDay(a: Date, b: Date) {
  return a.getTime() === b.getTime();
}

function matches(row: Row, where: Record<string, unknown>): boolean {
  for (const [k, v] of Object.entries(where)) {
    if (k === "id" && typeof v === "object" && v !== null && "not" in v) {
      if (row.id === (v as { not: string }).not) return false;
      continue;
    }
    if (k === "date") {
      if (!sameDay(row.date, v as Date)) return false;
      continue;
    }
    if ((row as unknown as Record<string, unknown>)[k] !== v) return false;
  }
  return true;
}

export function createFakeClient(initial: Row[] = [], halls: string[] = ["hall-1"]) {
  const rows: Row[] = [...initial];
  let counter = rows.length;

  const enforceApprovedUnique = (row: Row) => {
    if (row.status !== "APPROVED") return;
    const dupes = rows.filter(
      (r) =>
        r.id !== row.id &&
        r.status === "APPROVED" &&
        r.hallId === row.hallId &&
        sameDay(r.date, row.date) &&
        r.slot === row.slot,
    );
    if (dupes.length > 0) {
      // Simulate the partial unique index violation (fail closed).
      throw new DomainError("CONFLICT", "unique constraint: approved slot");
    }
  };

  const bookingRequest = {
    findUnique: async ({ where }: { where: { id: string } }) =>
      rows.find((r) => r.id === where.id) ?? null,
    findFirst: async ({ where }: { where: Record<string, unknown> }) =>
      rows.find((r) => matches(r, where)) ?? null,
    findMany: async ({ where }: { where: Record<string, unknown> }) =>
      rows.filter((r) => matches(r, where)),
    create: async ({ data }: { data: Omit<Row, "id"> }) => {
      const row: Row = { id: `b${++counter}`, ...data };
      enforceApprovedUnique(row);
      rows.push(row);
      return row;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Row> }) => {
      const row = rows.find((r) => r.id === where.id);
      if (!row) throw new Error("not found");
      Object.assign(row, data);
      enforceApprovedUnique(row);
      return row;
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Partial<Row>;
    }) => {
      let count = 0;
      for (const r of rows) {
        if (matches(r, where)) {
          Object.assign(r, data);
          count++;
        }
      }
      return { count };
    },
  };

  const hall = {
    findUnique: async ({ where }: { where: { id: string } }) =>
      halls.includes(where.id) ? { id: where.id } : null,
  };

  const client = {
    bookingRequest,
    hall,
    // Sequential transaction over the same in-memory store.
    $transaction: async <T>(fn: (tx: unknown) => Promise<T>): Promise<T> => fn(client),
    _rows: rows,
  };
  return client;
}
