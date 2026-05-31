import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide " +
  "transition-all duration-300 ease-out select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-ivory disabled:pointer-events-none disabled:opacity-50";

// primary  = bordeaux fill, warms toward gold on hover (ring + lift)
// secondary = champagne-gold outline that fills softly on hover
// ghost     = quiet text link that picks up bordeaux on hover
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-bordeaux text-ivory shadow-[var(--shadow-soft)] hover:bg-bordeaux-deep " +
    "hover:shadow-[var(--shadow-lift)] hover:ring-1 hover:ring-gold/70 hover:-translate-y-0.5",
  secondary:
    "border border-gold/70 text-bordeaux hover:border-gold hover:bg-gold/10 " +
    "hover:-translate-y-0.5",
  ghost: "text-charcoal hover:text-bordeaux",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-sm sm:text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const cls = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={cls} {...(rest as ComponentProps<typeof Link>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
