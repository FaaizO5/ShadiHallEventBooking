"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAction } from "@/app/_actions/auth";
import Button from "@/app/_components/Button";

const inputCls =
  "mt-1.5 block w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-base " +
  "text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 " +
  "placeholder:text-charcoal-soft/50";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await registerAction({ email, password, name: name || undefined });
    if (!res.ok) {
      setError(res.error);
      setPending(false);
      return;
    }
    // Auto sign-in after registration.
    await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-16 pt-28">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="eyebrow">Join Us</p>
          <h1 className="mt-3 font-serif text-3xl text-bordeaux sm:text-4xl">
            Create an Account
          </h1>
          <div className="hairline mx-auto mt-5 max-w-[80px]" />
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-gold/20 bg-white p-7 shadow-[var(--shadow-soft)]"
        >
          <label className="block text-sm font-medium text-charcoal">
            Name <span className="text-charcoal-soft">(optional)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={inputCls}
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-charcoal">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-charcoal">
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={inputCls}
            />
          </label>

          {error && (
            <p className="mt-4 rounded-xl bg-bordeaux/10 px-4 py-2.5 text-sm text-bordeaux">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending} className="mt-6 w-full">
            {pending ? "Creating…" : "Create Account"}
          </Button>

          <p className="mt-5 text-center text-sm text-charcoal-soft">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-bordeaux underline decoration-gold/50 underline-offset-2 hover:decoration-gold">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
