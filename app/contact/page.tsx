import { MapPin, Phone, Mail, Clock } from "lucide-react";
import PageHeader from "@/app/_components/PageHeader";
import ContactForm from "./_components/ContactForm";

export const metadata = { title: "Contact · Shaadi Halls" };

const DETAILS = [
  { icon: MapPin, label: "Visit Us", value: "Gulberg III, Lahore, Pakistan" },
  { icon: Phone, label: "Call Us", value: "+92 42 3500 0000", href: "tel:+924235000000" },
  { icon: Mail, label: "Email Us", value: "hello@shaadihalls.pk", href: "mailto:hello@shaadihalls.pk" },
  { icon: Clock, label: "Hours", value: "Mon – Sat, 10am – 8pm" },
];

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Get in Touch"
        title="Let's Plan Together"
        subtitle="Have a question about a venue or a date? We'd love to hear from you."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact details */}
          <div>
            <h2 className="font-serif text-2xl text-charcoal">Reach us directly</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal-soft">
              Prefer a personal touch? Use any of the details below — our team is
              always glad to help you find the perfect venue.
            </p>

            <ul className="mt-8 space-y-5">
              {DETAILS.map((d) => (
                <li key={d.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-cream text-bordeaux">
                    <d.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-deep">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="text-base text-charcoal transition-colors hover:text-bordeaux"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="text-base text-charcoal">{d.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
