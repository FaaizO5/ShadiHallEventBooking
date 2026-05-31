import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Users, ArrowLeft, Check } from "lucide-react";
import { getHall } from "@/lib/hall";
import { getAvailability } from "@/lib/availability";
import { today, maxBookingDate, formatDateOnly } from "@/lib/dates";
import SlotPicker from "@/app/_components/SlotPicker";

export const dynamic = "force-dynamic";

const HIGHLIGHTS = [
  "Flexible day & night slots",
  "Admin-confirmed availability",
  "Free cancellation while pending",
];

export default async function HallDetailPage({
  params,
}: {
  params: Promise<{ hallId: string }>;
}) {
  const { hallId } = await params;
  const hall = await getHall(hallId);
  if (!hall) notFound();

  const from = today();
  const to = maxBookingDate();
  const availability = await getAvailability(hall.id, from, to);

  return (
    <div className="bg-ivory pb-20 pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link
          href="/halls"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-soft transition-colors hover:text-bordeaux"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to all halls
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* ---------- Left: gallery + details ---------- */}
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-gold/15 bg-cream shadow-[var(--shadow-soft)]">
              {hall.images[0] && (
                <Image
                  src={hall.images[0]}
                  alt={hall.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              )}
            </div>

            {hall.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {hall.images.slice(1, 5).map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-xl border border-gold/15 bg-cream"
                  >
                    <Image
                      src={src}
                      alt={`${hall.name} photo ${i + 2}`}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <p className="eyebrow">Wedding Venue</p>
              <h1 className="mt-2 font-serif text-3xl text-bordeaux sm:text-4xl">
                {hall.name}
              </h1>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-cream px-3 py-1.5 text-sm text-charcoal-soft">
                <Users className="h-4 w-4 text-gold-deep" aria-hidden />
                Up to {hall.capacity.toLocaleString()} guests
              </div>

              <div className="hairline mt-7 !w-24 !bg-[linear-gradient(to_right,var(--color-gold),transparent)]" />

              <p className="mt-6 text-base leading-relaxed text-charcoal-soft">
                {hall.description}
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {HIGHLIGHTS.map((h) => (
                  <li key={h} className="flex items-center gap-2.5 text-sm text-charcoal">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-available-bg text-available">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---------- Right: sticky booking card ---------- */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SlotPicker
              hallId={hall.id}
              availability={availability}
              minDate={formatDateOnly(from)}
              maxDate={formatDateOnly(to)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
