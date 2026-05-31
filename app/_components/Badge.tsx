import type { ReactNode } from "react";

// One badge vocabulary for the whole app: slot availability
// (AVAILABLE / PENDING / BOOKED) and booking lifecycle
// (APPROVED / REJECTED / CANCELLED) share a tasteful, on-palette look.
type Tone = {
  dot: string;
  className: string;
  label: string;
};

const TONES: Record<string, Tone> = {
  AVAILABLE: {
    dot: "bg-available",
    className: "bg-available-bg text-available",
    label: "Available",
  },
  APPROVED: {
    dot: "bg-available",
    className: "bg-available-bg text-available",
    label: "Approved",
  },
  PENDING: {
    dot: "bg-gold-deep",
    className: "bg-gold/15 text-gold-deep",
    label: "Pending",
  },
  BOOKED: {
    dot: "bg-booked",
    className: "bg-booked-bg text-booked",
    label: "Booked",
  },
  CANCELLED: {
    dot: "bg-booked",
    className: "bg-booked-bg text-booked",
    label: "Cancelled",
  },
  REJECTED: {
    dot: "bg-bordeaux",
    className: "bg-bordeaux/10 text-bordeaux",
    label: "Rejected",
  },
};

export default function Badge({
  status,
  children,
  className = "",
}: {
  status: keyof typeof TONES | string;
  children?: ReactNode;
  className?: string;
}) {
  const tone = TONES[status] ?? TONES.BOOKED;
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] " +
        `font-semibold uppercase tracking-[0.12em] ${tone.className} ${className}`
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden />
      {children ?? tone.label}
    </span>
  );
}
