import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Methodology",
  description: "How WaterPoint Board Uganda's seed and reported data works.",
};

export default function DataMethodologyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold">Data methodology</h1>
      <h2 className="mt-6 text-lg font-semibold">What this platform shows</h2>
      <p className="mt-2 text-black/70 dark:text-white/70">
        WaterPoint Board Uganda displays <strong>community-reported</strong> operational
        information about water points in one small, fictional demonstration community. Every
        status shown is a report, not a guarantee.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Seed data</h2>
      <p className="mt-2 text-black/70 dark:text-white/70">
        The platform ships with a fixed, deterministic seed dataset of 62 fictional water points,
        24 fictional user accounts, and hundreds of fictional reports and maintenance records
        spanning roughly two years. The seed script never runs automatically against a live
        deployment — it is only used to populate demo environments, and the core water-point list
        is never modified by the application itself. Only new reports, maintenance logs, and user
        accounts grow through normal use.
      </p>
      <h2 className="mt-6 text-lg font-semibold">What this platform does not do</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-black/70 dark:text-white/70">
        <li>It does not certify water quality or drinking-water safety.</li>
        <li>It does not detect contamination.</li>
        <li>It does not predict infrastructure failure.</li>
        <li>It does not replace local water authorities or government systems.</li>
        <li>It is not a national-scale platform.</li>
      </ul>
    </main>
  );
}
