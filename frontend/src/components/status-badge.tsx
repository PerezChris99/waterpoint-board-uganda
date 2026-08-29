import type { WaterPointStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_TONE } from "@/lib/labels";

const TONE_CLASSES: Record<string, string> = {
  good: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  warn: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  bad: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300",
  info: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

export function StatusBadge({ status }: { status: WaterPointStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      <span aria-hidden className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
