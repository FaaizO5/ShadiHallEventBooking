"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingAction } from "@/app/_actions/booking";

export default function CancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await cancelBookingAction(bookingId);
          router.refresh();
        })
      }
      disabled={pending}
      className="rounded-md border border-black/20 px-3 py-1.5 text-xs font-medium hover:border-black disabled:opacity-40"
    >
      {pending ? "Cancelling…" : "Cancel"}
    </button>
  );
}
