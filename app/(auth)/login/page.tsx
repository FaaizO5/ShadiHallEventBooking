"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Button from "@/app/_components/Button";

const inputCls =
  "mt-1.5 block w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-base " +
  "text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 " +
  "placeholder:text-charcoal-soft/50";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-16 pt-28">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="eyebrow">Welcome Back</p>
          <h1 className="mt-3 font-serif text-3xl text-bordeaux sm:text-4xl">Sign In</h1>
          <div className="hairline mx-auto mt-5 max-w-[80px]" />
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl border border-gold/20 bg-white p-7 shadow-[var(--shadow-soft)]"
        >
          <label className="block text-sm font-medium text-charcoal">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
            />
          </label>

          {error && (
            <p className="mt-4 rounded-xl bg-bordeaux/10 px-4 py-2.5 text-sm text-bordeaux">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={pending} className="mt-6 w-full">
            {pending ? "Signing in…" : "Sign In"}
          </Button>

          <p className="mt-5 text-center text-sm text-charcoal-soft">
            No account?{" "}
            <Link href="/register" className="font-medium text-bordeaux underline decoration-gold/50 underline-offset-2 hover:decoration-gold">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
