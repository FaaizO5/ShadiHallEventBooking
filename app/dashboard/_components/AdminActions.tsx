"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approveAction, rejectAction, adminCancelAction } from "@/app/_actions/booking";

type Kind = "pending" | "approved";

export default function AdminActions({ bookingId, kind }: { bookingId: string; kind: Kind }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: (id: string) => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn(bookingId);
      if (!res.ok) setError(res.error ?? "Action failed");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <div className="flex gap-2">
        {kind === "pending" ? (
          <>
            <button
              onClick={() => run(approveAction)}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-bordeaux px-4 py-2 text-xs font-medium text-ivory transition-all hover:bg-bordeaux-deep hover:ring-1 hover:ring-gold/60 disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" aria-hidden />
              Approve
            </button>
            <button
              onClick={() => run(rejectAction)}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/20 px-4 py-2 text-xs font-medium text-charcoal-soft transition-colors hover:border-bordeaux hover:text-bordeaux disabled:opacity-40"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={() => run(adminCancelAction)}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-full border border-bordeaux/30 px-4 py-2 text-xs font-medium text-bordeaux transition-colors hover:border-bordeaux hover:bg-bordeaux/5 disabled:opacity-40"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Cancel booking
          </button>
        )}
      </div>
      {error && <span className="text-xs text-bordeaux">{error}</span>}
    </div>
  );
}
