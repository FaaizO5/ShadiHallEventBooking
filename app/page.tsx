import Image from "next/image";
import { CalendarHeart, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { getHalls } from "@/lib/hall";
import HallCard from "@/app/_components/HallCard";
import Button from "@/app/_components/Button";

// Hall data is request-time (DB-backed); render dynamically.
export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Sparkles,
    title: "Browse Venues",
    body: "Explore our curated collection of wedding halls, from intimate courts to grand marquees.",
  },
  {
    icon: CalendarHeart,
    title: "Pick Your Date",
    body: "Choose a date and a day or night slot. See real-time availability at a glance.",
  },
  {
    icon: ShieldCheck,
    title: "Confirmed by Us",
    body: "Send your request and our team confirms availability — no double bookings, ever.",
  },
];

export default async function HomePage() {
  // Home shows a hero + exactly 6 featured halls (FR-020, SC-007).
  const featured = await getHalls({ featured: true, take: 6 });

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        <Image
          src="/halls/shalimar-grand.jpg"
          alt="An elegantly decorated wedding hall"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Layered bordeaux overlay for legible, romantic depth. */}
        <div className="absolute inset-0 bg-gradient-to-b from-bordeaux-deep/80 via-bordeaux-deep/55 to-bordeaux-deep/85" />
        <div className="absolute inset-0 bg-charcoal/20" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center text-ivory">
          <p className="mb-5 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold-soft">
            <span className="h-px w-8 bg-gold/60" />
            Wedding Venues, Beautifully Booked
            <span className="h-px w-8 bg-gold/60" />
          </p>
          <h1 className="font-serif text-4xl leading-tight sm:text-6xl">
            Where Your Forever
            <span className="block italic text-gold-soft">Begins</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ivory/80 sm:text-base">
            Discover exquisite halls for your big day. Choose your date, reserve
            your slot, and let us handle the rest — every detail, beautifully.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/halls" size="lg">
              Browse Halls
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button href="/about" variant="secondary" size="lg" className="!text-ivory !border-gold/60 hover:!bg-ivory/10">
              Our Story
            </Button>
          </div>
        </div>

        {/* Soft fade into the ivory page below. */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
      </section>

      {/* ---------- How it works ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">How It Works</p>
          <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">
            Three steps to your celebration
          </h2>
          <div className="hairline mx-auto mt-7 max-w-[110px]" />
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="group text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-cream text-bordeaux transition-colors duration-300 group-hover:bg-bordeaux group-hover:text-gold-soft">
                <s.icon className="h-7 w-7" aria-hidden />
              </div>
              <p className="mt-2 font-serif text-sm text-gold-deep">0{i + 1}</p>
              <h3 className="mt-1 font-serif text-xl text-charcoal">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-charcoal-soft">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Featured halls ---------- */}
      <section className="bg-cream/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <p className="eyebrow">Handpicked</p>
              <h2 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">
                Featured Halls
              </h2>
            </div>
            <Button href="/halls" variant="secondary" size="md">
              View all venues
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>

          {featured.length === 0 ? (
            <p className="mt-10 text-center text-sm text-charcoal-soft">
              No featured halls yet — check back soon.
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((hall) => (
                <HallCard key={hall.id} hall={hall} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="relative overflow-hidden bg-bordeaux px-4 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(circle_at_center,theme(colors.gold)_0,transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl text-ivory sm:text-4xl">
            Ready to plan the perfect day?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ivory/75">
            Create an account to request dates, track approvals, and manage all
            your bookings in one elegant place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/register" variant="secondary" size="lg" className="!text-ivory !border-gold/60 hover:!bg-ivory/10">
              Create Account
            </Button>
            <Button href="/halls" size="lg" className="!bg-gold !text-bordeaux-deep hover:!bg-gold-soft">
              Browse Halls
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
