"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {kind === "pending" ? (
          <>
            <button
              onClick={() => run(approveAction)}
              disabled={pending}
              className="rounded-md bg-green-700 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              Approve
            </button>
            <button
              onClick={() => run(rejectAction)}
              disabled={pending}
              className="rounded-md border border-black/20 px-3 py-1.5 text-xs font-medium hover:border-black disabled:opacity-40"
            >
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={() => run(adminCancelAction)}
            disabled={pending}
            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:border-red-500 disabled:opacity-40"
          >
            Cancel booking
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
