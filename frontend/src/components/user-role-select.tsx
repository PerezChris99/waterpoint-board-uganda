"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/labels";

export function UserRoleSelect({ userId, currentRole }: { userId: string; currentRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [busy, setBusy] = useState(false);

  async function handleChange(next: Role) {
    setRole(next);
    setBusy(true);
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    setBusy(false);
    if (response.ok) router.refresh();
    else setRole(currentRole);
  }

  return (
    <select
      value={role}
      disabled={busy}
      onChange={(e) => handleChange(e.target.value as Role)}
      className="rounded-md border border-black/15 px-2 py-1 text-sm dark:border-white/20 dark:bg-transparent"
    >
      {Object.entries(ROLE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
