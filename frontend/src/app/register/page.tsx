"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { dashboardPathForRole } from "@/lib/dashboard-path";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [village, setVillage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, village }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error?.message ?? "Registration failed");
      setSubmitting(false);
      return;
    }
    router.push(dashboardPathForRole(data?.role ?? "MEMBER"));
    router.refresh();
  }

  return (
    <AuthShell
      eyebrow="Join the community"
      title="Create a demo account"
      subtitle="Sign up to submit reports and track the water points you care about."
    >
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </div>
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
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
          <p className="mt-1 text-xs text-black/50 dark:text-white/50">
            At least 10 characters, with an uppercase letter, lowercase letter, and digit.
          </p>
        </div>
        <div>
          <label htmlFor="village" className="block text-sm font-medium">
            Village <span className="font-normal text-black/50 dark:text-white/50">(optional)</span>
          </label>
          <input
            id="village"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
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
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-sm text-black/60 dark:text-white/60">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--wb-water-500)] underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
