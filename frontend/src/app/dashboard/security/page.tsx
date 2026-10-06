"use client";

import { useState } from "react";
import Link from "next/link";

export default function SecurityPage() {
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function setup() {
    setError("");
    const response = await fetch("/api/auth/mfa/setup", { method: "POST" });
    const data = await response.json().catch(() => null);
    if (!response.ok) return setError(data?.error?.message ?? "MFA setup failed");
    setSecret(data.secret);
    setUri(data.otpauthUri);
    setMessage("Add the account to your authenticator app, then enter the six-digit code.");
  }

  async function confirm() {
    setError("");
    const response = await fetch("/api/auth/mfa/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return setError(data?.error?.message ?? "MFA confirmation failed");
    setMessage(data?.message ?? "MFA enabled");
    setSecret("");
    setUri("");
    setCode("");
  }

  async function disable() {
    setError("");
    const response = await fetch("/api/auth/mfa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return setError(data?.error?.message ?? "MFA disable failed");
    setMessage(data?.message ?? "MFA disabled");
    setCode("");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-[var(--wb-water-500)] underline">Back to WaterPoint Board</Link>
      <h1 className="mt-6 text-2xl font-semibold">Account security</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        Protect this account with an authenticator app. Privileged national deployments should require MFA for all administrators.
      </p>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="mt-4 text-sm text-green-700">{message}</p>}

      {!secret ? (
        <button onClick={setup} className="mt-6 rounded-md bg-[var(--wb-water-500)] px-4 py-2.5 text-sm font-medium text-white">
          Set up authenticator MFA
        </button>
      ) : (
        <section className="mt-6 rounded-xl border border-black/10 p-5 dark:border-white/10">
          <p className="text-sm font-medium">Manual setup key</p>
          <code className="mt-2 block break-all rounded bg-black/5 p-3 text-xs dark:bg-white/10">{secret}</code>
          <p className="mt-3 text-xs text-black/60 dark:text-white/60">
            If your authenticator supports an otpauth URI, use the value below. Treat both values as a secret.
          </p>
          <code className="mt-2 block break-all rounded bg-black/5 p-3 text-xs dark:bg-white/10">{uri}</code>
          <label htmlFor="mfa-code" className="mt-4 block text-sm font-medium">Authenticator code</label>
          <input id="mfa-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent" />
          <button onClick={confirm} className="mt-4 rounded-md bg-[var(--wb-water-500)] px-4 py-2.5 text-sm font-medium text-white">Confirm and enable MFA</button>
        </section>
      )}

      <section className="mt-8 rounded-xl border border-black/10 p-5 dark:border-white/10">
        <h2 className="font-medium">Disable MFA</h2>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">Only disable MFA if you can immediately restore another strong account protection.</p>
        <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Current 6-digit code" className="mt-3 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent" />
        <button onClick={disable} className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm text-red-700">Disable MFA</button>
      </section>
    </main>
  );
}
