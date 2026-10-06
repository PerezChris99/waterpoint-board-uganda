"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error?.message ?? "Reset failed");
    } else {
      setMessage(data?.message ?? "Password reset successfully.");
      setTimeout(() => router.push("/login"), 1200);
    }
    setSubmitting(false);
  }

  return (
    <AuthShell eyebrow="Account recovery" title="Choose a new password" subtitle="Use a strong password with upper/lowercase letters and a digit.">
      <form onSubmit={submit} className="grid gap-4">
        <label htmlFor="password" className="text-sm font-medium">New password</label>
        <input id="password" type="password" minLength={10} required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent" />
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {message && <p role="status" className="text-sm text-black/60 dark:text-white/60">{message}</p>}
        <button disabled={submitting || !token} className="rounded-md bg-[var(--wb-water-500)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="mt-4 text-sm"><Link href="/login" className="text-[var(--wb-water-500)] underline">Back to login</Link></p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
