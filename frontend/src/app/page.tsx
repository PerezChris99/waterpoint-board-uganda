import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium tracking-wide text-[var(--wb-water-500)] uppercase">
        Community water-point tracker
      </p>
      <h1 className="text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
        WaterPoint Board Uganda
      </h1>
      <p className="max-w-xl text-base text-[var(--foreground)]/80">
        See reported water-point conditions in one local community. This is an early foundation
        build &mdash; the public directory, reporting flow, and dashboards arrive in later phases.
      </p>
      <Link
        href="/water-points"
        className="w-fit rounded-md border border-[var(--wb-water-500)] px-4 py-2 text-sm font-medium text-[var(--wb-water-500)] transition-colors hover:bg-[var(--wb-water-500)] hover:text-white"
      >
        Explore water points
      </Link>
      <p className="max-w-xl text-xs text-[var(--foreground)]/60">
        WaterPoint Board displays community-reported operational information. Statuses may change
        and should be verified locally. This platform does not certify water quality or
        drinking-water safety.
      </p>
    </main>
  );
}
