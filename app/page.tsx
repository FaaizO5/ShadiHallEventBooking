import Link from "next/link";
import { getHalls } from "@/lib/hall";
import HallCard from "@/app/_components/HallCard";

// Hall data is request-time (DB-backed); render dynamically.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Home shows a hero + exactly 6 featured halls (FR-020, SC-007).
  const featured = await getHalls({ featured: true, take: 6 });

  return (
    <div>
      {/* Hero */}
      <section className="bg-black px-4 py-16 text-center text-white sm:py-24">
        <h1 className="mx-auto max-w-2xl text-3xl font-semibold sm:text-5xl">
          Find the perfect hall for your big day
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 sm:text-base">
          Browse our wedding halls, pick a date and a day or night slot, and request your
          booking. An admin confirms availability.
        </p>
        <Link
          href="/halls"
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-black"
        >
          Browse halls
        </Link>
      </section>

      {/* Featured halls */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold">Featured halls</h2>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      </section>
    </div>
  );
}
