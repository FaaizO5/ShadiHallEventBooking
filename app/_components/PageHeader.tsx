import type { ReactNode } from "react";

// Editorial page header on a warm cream band. The top padding also clears
// the fixed navbar, so inner pages start with this.
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="border-b border-gold/15 bg-cream pb-12 pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 font-serif text-4xl text-bordeaux sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-charcoal-soft sm:text-base">
            {subtitle}
          </p>
        )}
        <div className="hairline mx-auto mt-8 max-w-[110px]" />
      </div>
    </section>
  );
}
