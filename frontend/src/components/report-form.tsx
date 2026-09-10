"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ISSUE_LABELS } from "@/lib/labels";
import { useLocale } from "@/components/locale-provider";
import { LOCALES, LOCALE_LABELS, ISSUE_LABELS_LG, reportFormString } from "@/lib/i18n";

export function ReportForm({ waterPointId }: { waterPointId: string }) {
  const router = useRouter();
  const { locale, setLocale } = useLocale();
  const [issueType, setIssueType] = useState("NO_WATER");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const issueLabels = locale === "lg" ? ISSUE_LABELS_LG : ISSUE_LABELS;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waterPointId, issueType, description, reporterName }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrorMessage(data?.error?.message ?? reportFormString("genericError", locale));
        setStatus("error");
        return;
      }
      setStatus("success");
      setDescription("");
      router.refresh();
    } catch {
      setErrorMessage(reportFormString("networkError", locale));
      setStatus("error");
    }
  }

  const languageSwitcher = (
    <div className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50">
      {LOCALES.map((code, i) => (
        <span key={code}>
          {i > 0 && <span className="mx-1">·</span>}
          <button
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={locale === code}
            className={locale === code ? "font-semibold text-[var(--wb-water-500)]" : "hover:underline"}
          >
            {LOCALE_LABELS[code]}
          </button>
        </span>
      ))}
    </div>
  );

  if (status === "success") {
    return (
      <div className="flex flex-col gap-3">
        {languageSwitcher}
        <p role="status" className="rounded-md bg-emerald-100 p-4 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          {reportFormString("successMessage", locale)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {languageSwitcher}
      <div>
        <label htmlFor="issueType" className="block text-sm font-medium">
          {reportFormString("issueTypeLabel", locale)}
        </label>
        <select
          id="issueType"
          value={issueType}
          onChange={(e) => setIssueType(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        >
          {Object.entries(issueLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          {reportFormString("descriptionLabel", locale)}
        </label>
        <textarea
          id="description"
          required
          minLength={10}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      <div>
        <label htmlFor="reporterName" className="block text-sm font-medium">
          {reportFormString("nameLabel", locale)}{" "}
          <span className="font-normal text-black/50 dark:text-white/50">
            {reportFormString("nameOptional", locale)}
          </span>
        </label>
        <input
          id="reporterName"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          maxLength={100}
          className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-fit rounded-md bg-[var(--wb-water-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--wb-water-400)] disabled:opacity-60"
      >
        {status === "submitting" ? reportFormString("submitting", locale) : reportFormString("submit", locale)}
      </button>
    </form>
  );
}

