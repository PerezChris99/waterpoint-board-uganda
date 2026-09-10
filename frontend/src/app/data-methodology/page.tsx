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
        information about real water points nationwide. Every status shown is a report, not a
        guarantee.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Real water point data</h2>
      <p className="mt-2 text-black/70 dark:text-white/70">
        The ~98,700 water points shown are imported from the Water Point Data Exchange (WPDx), a
        free, open aggregator of field-collected water point data. Uganda&apos;s records come from
        the Ministry of Water and Environment&apos;s 2009 nationwide census plus later surveys by
        Water For People, The Water Trust, IRC, World Vision, and other WASH organizations.
        Coordinates, technology, and location are carried over as reported; a functional status
        is only shown as current when its underlying field report is from 2016 or later — older
        status readings (most of the dataset, dominated by the 2009 census) are marked
        &quot;Needs verification&quot; instead of presented as current fact. See{" "}
        <a
          href="https://github.com/PerezChris99/waterpoint-board-uganda/blob/main/docs/DATA-METHODOLOGY.md"
          className="underline"
        >
          docs/DATA-METHODOLOGY.md
        </a>{" "}
        in the repository for full detail.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Development/test seed data</h2>
      <p className="mt-2 text-black/70 dark:text-white/70">
        Separately, the codebase ships a fixed, deterministic <em>fictional</em> seed dataset used
        only for local development and CI testing — never run against this live deployment. Login
        credentials for any seeded accounts are private to the operator, not published.
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
