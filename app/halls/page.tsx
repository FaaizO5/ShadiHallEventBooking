import { getHalls } from "@/lib/hall";
import HallCard from "@/app/_components/HallCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Halls · Shaadi Hall Booking" };

export default async function HallsPage() {
  const halls = await getHalls();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Wedding halls</h1>
      <p className="mt-1 text-sm text-black/60">Browse our venues and request a date.</p>

      {halls.length === 0 ? (
        <p className="mt-6 text-sm text-black/60">No halls are available yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {halls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      )}
    </div>
  );
}
