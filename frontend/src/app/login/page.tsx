"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@waterpointboard.example", password: "Admin#2026Secure" },
  { role: "Caretaker", email: "caretaker1@waterpointboard.example", password: "Caretaker#2026" },
  { role: "Member", email: "member1@waterpointboard.example", password: "Member#2026" },
];

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function fillDemo(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  }

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
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to your account"
      subtitle="Access your dashboard, reports, and caretaker or admin tools."
    >
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
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
        <div className="sm:col-span-1">
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
          <p role="alert" className="text-sm text-red-600 sm:col-span-2 dark:text-red-400">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-[var(--wb-water-500)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--wb-water-400)] disabled:opacity-60 sm:col-span-2"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <div className="mt-6 rounded-md border border-black/10 bg-[var(--wb-surface-100)] p-4 dark:border-white/10 dark:bg-[var(--wb-surface-800)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-black/50 dark:text-white/50">
          Demo accounts
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li
              key={account.email}
              className="flex flex-col gap-2 rounded-md border border-black/10 bg-[var(--background)] px-3 py-2 text-xs dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <span className="mr-2 inline-block rounded-full bg-[var(--wb-water-500)]/10 px-2 py-0.5 font-medium text-[var(--wb-water-500)]">
                  {account.role}
                </span>
                <span className="block truncate font-mono text-black/70 dark:text-white/70 sm:inline">
                  {account.email}
                </span>
              </div>
              <button
                type="button"
                onClick={() => fillDemo(account.email, account.password)}
                className="shrink-0 self-start rounded-md border border-black/15 px-2.5 py-1 font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 sm:self-auto"
              >
                Use account
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-sm text-black/60 dark:text-white/60">
        No account?{" "}
        <Link href="/register" className="text-[var(--wb-water-500)] underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
