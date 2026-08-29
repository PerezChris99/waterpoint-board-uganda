import Link from "next/link";

const FEATURES = [
  {
    title: "Public directory",
    body: "Browse every water point with live status, type, village, and last-verified freshness.",
  },
  {
    title: "Community reporting",
    body: "Anyone can flag an issue — no water, contamination concerns, physical damage — in seconds.",
  },
  {
    title: "Caretaker tools",
    body: "Assigned caretakers triage reports, log maintenance history, and update status.",
  },
  {
    title: "Admin & analytics",
    body: "Admins manage users and caretakers; dashboards chart uptime, report volume, and exports.",
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16 sm:py-24">
        <p className="text-sm font-medium tracking-wide text-[var(--wb-water-500)] uppercase">
          Community water-point tracker
        </p>
        <h1 className="text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
          WaterPoint Board Uganda
        </h1>
        <p className="max-w-xl text-base text-[var(--foreground)]/80">
          Reported water-point conditions for one small Ugandan community — full public directory,
          community reporting, caretaker and admin dashboards, and analytics, built as a
          production-shaped full-stack demo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/water-points"
            className="w-fit rounded-md bg-[var(--wb-water-500)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--wb-water-400)]"
          >
            Explore water points
          </Link>
          <Link
            href="/register"
            className="w-fit rounded-md border border-[var(--wb-water-500)] px-4 py-2 text-sm font-medium text-[var(--wb-water-500)] transition-colors hover:bg-[var(--wb-water-500)] hover:text-white"
          >
            Create a demo account
          </Link>
        </div>
        <p className="max-w-xl text-xs text-[var(--foreground)]/60">
          WaterPoint Board displays community-reported operational information. Statuses may change
          and should be verified locally. This platform does not certify water quality or
          drinking-water safety.
        </p>
      </section>
      <section className="border-t border-black/10 bg-[var(--wb-surface-100)] py-14 dark:bg-[var(--wb-surface-800)]">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-black/10 bg-[var(--background)] p-5 dark:border-white/10">
              <h2 className="font-semibold text-[var(--foreground)]">{feature.title}</h2>
              <p className="mt-1.5 text-sm text-[var(--foreground)]/70">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
