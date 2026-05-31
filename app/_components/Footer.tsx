import Link from "next/link";
import { MapPin, Phone, Mail, Heart } from "lucide-react";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/halls", label: "All Halls" },
      { href: "/halls?featured=1", label: "Featured Venues" },
      { href: "/about", label: "Our Story" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign In" },
      { href: "/register", label: "Create Account" },
      { href: "/dashboard", label: "My Bookings" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-bordeaux-deep text-ivory/80">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="font-serif text-2xl text-ivory">
              Shaadi<span className="text-gold">Halls</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/65">
              Curated wedding venues for unforgettable celebrations. Find your
              hall, choose your date, and let your story begin.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-serif text-sm uppercase tracking-[0.18em] text-gold">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ivory/70 transition-colors hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-[0.18em] text-gold">
              Get in Touch
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-ivory/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                Gulberg III, Lahore, Pakistan
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                <a href="tel:+924235000000" className="transition-colors hover:text-gold">
                  +92 42 3500 0000
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                <a href="mailto:hello@shaadihalls.pk" className="transition-colors hover:text-gold">
                  hello@shaadihalls.pk
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-ivory/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Shaadi Halls. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Crafted with <Heart className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden /> for your big day
          </p>
        </div>
      </div>
    </footer>
  );
}
