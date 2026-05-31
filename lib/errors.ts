// Domain error types shared across booking/hall logic and surfaced by server actions.

export type DomainErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "SLOT_BOOKED"
  | "DUPLICATE_PENDING"
  | "CONFLICT"
  | "FORBIDDEN";

export class DomainError extends Error {
  code: DomainErrorCode;
  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

// Discriminated result returned by server actions to client components.
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; code?: DomainErrorCode };
