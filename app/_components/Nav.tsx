"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

// Mobile-first navigation (Constitution Principle IV): hamburger menu on small
// screens, inline links on larger viewports.
export default function Nav() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/halls", label: "Halls" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="border-b border-black/10 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Shaadi Halls
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm hover:underline">
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-sm hover:underline">
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-black" />
          <span className="mt-1 block h-0.5 w-6 bg-black" />
          <span className="mt-1 block h-0.5 w-6 bg-black" />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col gap-1 border-t border-black/10 px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm"
            >
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="py-2 text-sm">
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="py-2 text-left text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="py-2 text-sm">
                Login
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="py-2 text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
