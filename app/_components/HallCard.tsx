import Link from "next/link";
import Image from "next/image";
import { Users, MapPin, ArrowRight } from "lucide-react";
import Badge from "./Badge";

interface Props {
  hall: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    images: string[];
    // Optional — not in the current Hall schema. Rendered only when present
    // so the card upgrades cleanly if these fields are added later.
    location?: string;
    price?: number;
  };
  availability?: "AVAILABLE" | "PENDING" | "BOOKED";
}

const priceFmt = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export default function HallCard({ hall, availability = "AVAILABLE" }: Props) {
  return (
    <Link
      href={`/halls/${hall.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gold/15 bg-white
                 shadow-[var(--shadow-soft)] transition-all duration-500 ease-out
                 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[var(--shadow-lift)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
                 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        {hall.images[0] && (
          <Image
            src={hall.images[0]}
            alt={hall.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
        {/* Gentle bordeaux wash anchors the badge and adds depth on hover. */}
        <div className="absolute inset-0 bg-gradient-to-t from-bordeaux-deep/35 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <Badge status={availability} className="shadow-sm backdrop-blur" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl text-charcoal transition-colors duration-300 group-hover:text-bordeaux">
          {hall.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal-soft">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-gold-deep" aria-hidden />
            {hall.capacity.toLocaleString()} guests
          </span>
          {hall.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold-deep" aria-hidden />
              {hall.location}
            </span>
          )}
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal-soft">
          {hall.description}
        </p>

        <div className="mt-5 flex items-end justify-between border-t border-gold/15 pt-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.14em] text-charcoal-soft/70">
              Starting from
            </p>
            <p className="font-serif text-lg text-bordeaux">
              {typeof hall.price === "number" ? priceFmt.format(hall.price) : "On request"}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1 text-xs font-medium text-gold-deep
                       transition-all duration-300 group-hover:gap-2"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
