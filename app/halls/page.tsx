import { getHalls } from "@/lib/hall";
import HallCard from "@/app/_components/HallCard";
import PageHeader from "@/app/_components/PageHeader";

export const dynamic = "force-dynamic";
export const metadata = { title: "Halls · Shaadi Halls" };

export default async function HallsPage() {
  const halls = await getHalls();

  return (
    <div>
      <PageHeader
        eyebrow="Our Venues"
        title="Wedding Halls"
        subtitle="Browse our collection of curated venues and request the date that's meant for you."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {halls.length === 0 ? (
          <div className="rounded-2xl border border-gold/20 bg-white p-12 text-center">
            <p className="font-serif text-xl text-charcoal">No halls available yet</p>
            <p className="mt-2 text-sm text-charcoal-soft">
              Please check back soon — new venues are added regularly.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-8 text-sm text-charcoal-soft">
              Showing <span className="font-semibold text-bordeaux">{halls.length}</span>{" "}
              {halls.length === 1 ? "venue" : "venues"}
            </p>
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {halls.map((hall) => (
                <HallCard key={hall.id} hall={hall} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
