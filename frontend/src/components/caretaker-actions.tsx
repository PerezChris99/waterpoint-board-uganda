"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WaterPointStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/labels";

export function CaretakerActions({
  waterPointId,
  currentStatus,
}: {
  waterPointId: string;
  currentStatus: WaterPointStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<WaterPointStatus>(currentStatus);
  const [action, setAction] = useState("Routine inspection");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function updateStatus() {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/water-points/${waterPointId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    if (response.ok) {
      setMessage("Status updated.");
      router.refresh();
    } else {
      setMessage("Failed to update status.");
    }
  }

  async function logMaintenance() {
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/maintenance-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waterPointId, action, notes }),
    });
    setBusy(false);
    if (response.ok) {
      setMessage("Maintenance logged.");
      setNotes("");
      router.refresh();
    } else {
      setMessage("Failed to log maintenance.");
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-end gap-3 text-sm">
      <div>
        <label className="block text-xs font-medium text-black/60 dark:text-white/60">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as WaterPointStatus)}
          className="mt-1 rounded-md border border-black/15 px-2 py-1.5 dark:border-white/20 dark:bg-transparent"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={updateStatus}
        disabled={busy}
        className="rounded-md border border-black/15 px-3 py-1.5 font-medium hover:bg-black/5 disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/10"
      >
        Update status
      </button>
      <div>
        <label className="block text-xs font-medium text-black/60 dark:text-white/60">Log action</label>
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="mt-1 rounded-md border border-black/15 px-2 py-1.5 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="mt-1 min-w-[10rem] rounded-md border border-black/15 px-2 py-1.5 dark:border-white/20 dark:bg-transparent"
      />
      <button
        onClick={logMaintenance}
        disabled={busy}
        className="rounded-md bg-[var(--wb-water-500)] px-3 py-1.5 font-medium text-white hover:bg-[var(--wb-water-400)] disabled:opacity-60"
      >
        Log maintenance
      </button>
      {message && <span className="text-xs text-black/60 dark:text-white/60">{message}</span>}
    </div>
  );
}
