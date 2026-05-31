"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import Button from "./Button";

// Navbar: transparent over the home hero, turns solid ivory once scrolled
// (or on any non-home route). Active link carries a gold underline.
export default function Nav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  // Overlay (light text over the hero image) only at the very top of home.
  const overlay = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/halls", label: "Halls" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        overlay
          ? "bg-transparent"
          : "border-b border-gold/20 bg-ivory/90 shadow-[0_1px_20px_-12px_rgba(74,13,23,0.4)] backdrop-blur-md",
      ].join(" ")}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className={[
            "font-serif text-xl tracking-tight transition-colors",
            overlay ? "text-ivory" : "text-bordeaux",
          ].join(" ")}
        >
          Shaadi<span className="text-gold">Halls</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={[
                  "group relative text-sm font-medium transition-colors",
                  overlay
                    ? "text-ivory/85 hover:text-ivory"
                    : "text-charcoal-soft hover:text-bordeaux",
                  active && (overlay ? "text-ivory" : "text-bordeaux"),
                ].join(" ")}
              >
                {l.label}
                <span
                  className={[
                    "absolute -bottom-1.5 left-0 h-px bg-gold transition-all duration-300",
                    active ? "w-full" : "w-0 group-hover:w-full",
                  ].join(" ")}
                />
              </Link>
            );
          })}

          <span className={overlay ? "h-5 w-px bg-ivory/30" : "h-5 w-px bg-charcoal/15"} />

          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className={[
                  "text-sm font-medium transition-colors",
                  overlay ? "text-ivory/85 hover:text-ivory" : "text-charcoal-soft hover:text-bordeaux",
                ].join(" ")}
              >
                Dashboard
              </Link>
              <Button variant={overlay ? "secondary" : "primary"} size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className={[
                  "text-sm font-medium transition-colors",
                  overlay ? "text-ivory/85 hover:text-ivory" : "text-charcoal-soft hover:text-bordeaux",
                ].join(" ")}
              >
                Login
              </Link>
              <Button href="/register" size="sm">
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={[
            "rounded-full p-1.5 transition-colors md:hidden",
            overlay ? "text-ivory" : "text-bordeaux",
          ].join(" ")}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t border-gold/20 bg-ivory px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={[
                  "border-b border-gold/10 py-3 text-sm font-medium transition-colors",
                  isActive(l.href) ? "text-bordeaux" : "text-charcoal-soft",
                ].join(" ")}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {session?.user ? (
              <>
                <Button href="/dashboard" variant="secondary" size="md" className="w-full" onClick={() => setOpen(false)}>
                  Dashboard
                </Button>
                <Button size="md" className="w-full" onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="secondary" size="md" className="w-full" onClick={() => setOpen(false)}>
                  Login
                </Button>
                <Button href="/register" size="md" className="w-full" onClick={() => setOpen(false)}>
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
