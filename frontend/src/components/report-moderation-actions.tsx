"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportModerationActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function moderate(moderationStatus: "APPROVED" | "REJECTED") {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/reports/${reportId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moderationStatus }),
    });
    setBusy(false);
    if (response.ok) {
      router.refresh();
    } else {
      setMessage("Failed to update.");
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        onClick={() => moderate("APPROVED")}
        disabled={busy}
        className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        Approve
      </button>
      <button
        onClick={() => moderate("REJECTED")}
        disabled={busy}
        className="rounded-md border border-red-400 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950"
      >
        Reject
      </button>
      {message && <span className="text-xs text-black/60 dark:text-white/60">{message}</span>}
    </div>
  );
}
