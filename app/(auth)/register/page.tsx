"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerAction } from "@/app/_actions/auth";

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
    <form onSubmit={onSubmit} className="mx-auto mt-12 max-w-sm px-4">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <label className="mt-6 block text-sm font-medium">
        Name (optional)
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-black/20 px-3 py-3 text-base"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-black/20 px-3 py-3 text-base"
        />
      </label>
      <label className="mt-4 block text-sm font-medium">
        Password
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-black/20 px-3 py-3 text-base"
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-base font-medium text-white disabled:opacity-40"
      >
        {pending ? "Creating…" : "Register"}
      </button>
      <p className="mt-4 text-sm text-black/60">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
