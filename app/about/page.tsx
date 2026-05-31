import Image from "next/image";
import { Heart, Gem, ShieldCheck, Sparkles } from "lucide-react";
import PageHeader from "@/app/_components/PageHeader";
import Button from "@/app/_components/Button";

export const metadata = { title: "About · Shaadi Halls" };

const VALUES = [
  {
    icon: Gem,
    title: "Curated Venues",
    body: "Every hall is hand-selected for its beauty, comfort, and craftsmanship — no compromises.",
  },
  {
    icon: ShieldCheck,
    title: "Confirmed Bookings",
    body: "Our team reviews every request, so the date you celebrate is truly, exclusively yours.",
  },
  {
    icon: Sparkles,
    title: "Effortless Planning",
    body: "Browse, choose a slot, and track your booking — all in one calm, considered place.",
  },
];

const STATS = [
  { value: "20+", label: "Curated Halls" },
  { value: "5,000+", label: "Happy Couples" },
  { value: "12", label: "Years of Craft" },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Our Story"
        title="Celebrating Love, Beautifully"
        subtitle="We believe a wedding venue should feel as timeless as the vows exchanged within it."
      />

      {/* Intro split */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold/15 shadow-[var(--shadow-soft)]">
            <Image
              src="/halls/royal-palm-banquet.jpg"
              alt="A beautifully decorated banquet hall"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <span className="inline-flex items-center gap-2 text-gold-deep">
              <Heart className="h-5 w-5 fill-gold/20" aria-hidden />
              <span className="eyebrow">Made for your moments</span>
            </span>
            <h2 className="mt-4 font-serif text-3xl text-charcoal sm:text-4xl">
              A venue for every kind of forever
            </h2>
            <p className="mt-5 text-base leading-relaxed text-charcoal-soft">
              Shaadi Halls began with a simple belief: finding the perfect place
              to celebrate should be joyful, not stressful. From intimate courts
              to grand marquees, we bring together the region&apos;s most beautiful
              wedding venues under one elegant roof.
            </p>
            <p className="mt-4 text-base leading-relaxed text-charcoal-soft">
              Each booking is personally confirmed by our team, so you can plan
              with complete peace of mind — knowing your date is held just for you.
            </p>
            <Button href="/halls" className="mt-7">
              Explore Our Halls
            </Button>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-bordeaux">
        <div className="mx-auto grid max-w-4xl grid-cols-1 divide-y divide-gold/20 px-4 py-12 text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 py-4">
              <p className="font-serif text-4xl text-gold-soft">{s.value}</p>
              <p className="mt-1 text-sm uppercase tracking-[0.18em] text-ivory/70">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="eyebrow">Why Couples Choose Us</p>
          <h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">
            Thoughtful from first look to final dance
          </h2>
          <div className="hairline mx-auto mt-7 max-w-[110px]" />
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-gold/15 bg-white p-7 text-center shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/35"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-bordeaux">
                <v.icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-4 font-serif text-xl text-charcoal">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
