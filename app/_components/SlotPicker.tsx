"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createBookingAction } from "@/app/_actions/booking";
import type { DayAvailability } from "@/lib/availability";

type Slot = "DAY" | "NIGHT";

interface Props {
  hallId: string;
  availability: DayAvailability[];
  minDate: string; // YYYY-MM-DD
  maxDate: string; // YYYY-MM-DD
}

// Mobile-first date + slot picker (Constitution Principle IV, SC-005).
export default function SlotPicker({ hallId, availability, minDate, maxDate }: Props) {
  const router = useRouter();
  const { status } = useSession();
  const [date, setDate] = useState(minDate);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const byDate = useMemo(() => {
    const m = new Map<string, DayAvailability>();
    for (const a of availability) m.set(a.date, a);
    return m;
  }, [availability]);

  const dayStatus = byDate.get(date)?.day ?? "AVAILABLE";
  const nightStatus = byDate.get(date)?.night ?? "AVAILABLE";

  function submit() {
    if (!slot) return;
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/halls/${hallId}`);
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const res = await createBookingAction({ hallId, date, slot });
      if (res.ok) {
        setMessage({ kind: "ok", text: "Request submitted! Track it in your dashboard." });
        setSlot(null);
        router.refresh();
      } else {
        setMessage({ kind: "err", text: res.error });
      }
    });
  }

  // Render helper (not a component) for a slot button, to keep state stable.
  const renderSlot = (value: Slot, label: string, slotStatus: string) => {
    const booked = slotStatus === "BOOKED";
    const selected = slot === value;
    return (
      <button
        type="button"
        disabled={booked}
        onClick={() => setSlot(value)}
        className={[
          "flex-1 rounded-lg border px-4 py-4 text-center text-base font-medium transition",
          booked
            ? "cursor-not-allowed border-black/10 bg-black/5 text-black/30"
            : selected
              ? "border-black bg-black text-white"
              : "border-black/20 bg-white hover:border-black",
        ].join(" ")}
      >
        {label}
        <span className="mt-1 block text-xs font-normal">
          {booked ? "Booked" : "Available"}
        </span>
      </button>
    );
  };

  return (
    <div className="rounded-xl border border-black/10 p-4">
      <h2 className="text-lg font-semibold">Request a date</h2>

      <label className="mt-4 block text-sm font-medium">
        Date
        <input
          type="date"
          value={date}
          min={minDate}
          max={maxDate}
          onChange={(e) => {
            setDate(e.target.value);
            setSlot(null);
            setMessage(null);
          }}
          className="mt-1 block w-full rounded-lg border border-black/20 px-3 py-3 text-base"
        />
      </label>

      <div className="mt-4 flex gap-3">
        {renderSlot("DAY", "Day", dayStatus)}
        {renderSlot("NIGHT", "Night", nightStatus)}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!slot || pending}
        className="mt-4 w-full rounded-lg bg-black px-4 py-3 text-base font-medium text-white disabled:opacity-40"
      >
        {pending ? "Submitting…" : status === "authenticated" ? "Request booking" : "Sign in to request"}
      </button>

      {message && (
        <p
          className={[
            "mt-3 rounded-lg px-3 py-2 text-sm",
            message.kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800",
          ].join(" ")}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
