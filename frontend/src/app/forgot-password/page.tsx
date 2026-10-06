"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const response = await fetch("/api/auth/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json().catch(() => null);
    setMessage(data?.message ?? "If the account exists, reset instructions have been sent.");
    setSubmitting(false);
  }

  return (
    <AuthShell eyebrow="Account recovery" title="Reset your password" subtitle="Enter your email and we will send a time-limited reset link.">
      <form onSubmit={submit} className="grid gap-4">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent" />
        {message && <p role="status" className="text-sm text-black/60 dark:text-white/60">{message}</p>}
        <button disabled={submitting} className="rounded-md bg-[var(--wb-water-500)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-4 text-sm"><Link href="/login" className="text-[var(--wb-water-500)] underline">Back to login</Link></p>
    </AuthShell>
  );
}
