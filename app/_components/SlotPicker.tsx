"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sun, Moon, Lock, CheckCircle2, CalendarDays } from "lucide-react";
import { createBookingAction } from "@/app/_actions/booking";
import type { DayAvailability } from "@/lib/availability";
import Button from "./Button";

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

  // Render helper (not a component) for a slot card, to keep state stable.
  const renderSlot = (
    value: Slot,
    label: string,
    hint: string,
    Icon: typeof Sun,
    slotStatus: string,
  ) => {
    const booked = slotStatus === "BOOKED";
    const selected = slot === value;
    return (
      <button
        type="button"
        disabled={booked}
        onClick={() => setSlot(value)}
        aria-pressed={selected}
        className={[
          "group relative flex-1 overflow-hidden rounded-xl border p-4 text-left transition-all duration-300",
          booked
            ? "cursor-not-allowed border-charcoal/10 bg-booked-bg"
            : selected
              ? "border-bordeaux bg-bordeaux text-ivory shadow-[var(--shadow-soft)]"
              : "border-charcoal/15 bg-white hover:-translate-y-0.5 hover:border-gold hover:shadow-[var(--shadow-soft)]",
        ].join(" ")}
      >
        <div className="flex items-center justify-between">
          <Icon
            className={[
              "h-5 w-5 transition-colors",
              booked ? "text-booked" : selected ? "text-gold-soft" : "text-gold-deep",
            ].join(" ")}
            aria-hidden
          />
          {booked ? (
            <Lock className="h-4 w-4 text-booked" aria-hidden />
          ) : selected ? (
            <CheckCircle2 className="h-4 w-4 text-gold-soft" aria-hidden />
          ) : null}
        </div>
        <p
          className={[
            "mt-3 font-serif text-lg",
            booked ? "text-booked" : selected ? "text-ivory" : "text-charcoal",
          ].join(" ")}
        >
          {label}
        </p>
        <p
          className={[
            "text-xs",
            booked ? "text-booked" : selected ? "text-ivory/70" : "text-charcoal-soft",
          ].join(" ")}
        >
          {booked ? "Already booked" : hint}
        </p>
      </button>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gold/20 bg-white shadow-[var(--shadow-soft)]">
      <div className="border-b border-gold/15 bg-cream/60 px-5 py-4">
        <h2 className="font-serif text-xl text-bordeaux">Request a Date</h2>
        <p className="mt-0.5 text-xs text-charcoal-soft">
          Pick a date and slot — we&apos;ll confirm availability.
        </p>
      </div>

      <div className="p-5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
          Date
          <div className="relative mt-2">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-deep" aria-hidden />
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
              className="block w-full rounded-xl border border-charcoal/15 bg-white py-3 pl-10 pr-3 text-base text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>
        </label>

        <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-charcoal-soft">
          Choose a slot
        </p>
        <div className="mt-2 flex gap-3">
          {renderSlot("DAY", "Day", "Morning – afternoon", Sun, dayStatus)}
          {renderSlot("NIGHT", "Night", "Evening – late", Moon, nightStatus)}
        </div>

        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={submit}
          disabled={!slot || pending}
        >
          {pending
            ? "Submitting…"
            : status === "authenticated"
              ? "Request Booking"
              : "Sign in to Request"}
        </Button>

        {message && (
          <p
            className={[
              "mt-4 rounded-xl px-4 py-3 text-sm",
              message.kind === "ok"
                ? "bg-available-bg text-available"
                : "bg-bordeaux/10 text-bordeaux",
            ].join(" ")}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
