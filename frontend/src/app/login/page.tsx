"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error?.message ?? "Login failed");
      setSubmitting(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-[var(--wb-water-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--wb-water-400)] disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <div className="mt-6 rounded-md bg-[var(--wb-surface-100)] p-3 text-xs text-black/60 dark:bg-[var(--wb-surface-800)] dark:text-white/60">
        <p className="font-medium">Demo accounts</p>
        <p>admin@waterpointboard.example / Admin#2026Secure</p>
        <p>caretaker1@waterpointboard.example / Caretaker#2026</p>
        <p>member1@waterpointboard.example / Member#2026</p>
      </div>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        No account?{" "}
        <Link href="/register" className="text-[var(--wb-water-500)] underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
