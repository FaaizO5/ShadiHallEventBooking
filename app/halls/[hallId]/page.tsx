import { notFound } from "next/navigation";
import Image from "next/image";
import { getHall } from "@/lib/hall";
import { getAvailability } from "@/lib/availability";
import { today, maxBookingDate, formatDateOnly } from "@/lib/dates";
import SlotPicker from "@/app/_components/SlotPicker";

export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black/5">
          {hall.images[0] && (
            <Image
              src={hall.images[0]}
              alt={hall.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{hall.name}</h1>
          <p className="mt-1 text-sm text-black/60">Capacity: {hall.capacity} guests</p>
          <p className="mt-3 text-sm leading-relaxed text-black/80">{hall.description}</p>
        </div>
      </div>

      <div className="mt-6">
        <SlotPicker
          hallId={hall.id}
          availability={availability}
          minDate={formatDateOnly(from)}
          maxDate={formatDateOnly(to)}
        />
      </div>
    </div>
  );
}
