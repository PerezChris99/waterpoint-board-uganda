export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-[var(--wb-surface-100)] py-8 text-sm dark:bg-[var(--wb-surface-800)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-medium">WaterPoint Board Uganda</p>
        <p className="mt-1 max-w-2xl text-black/60 dark:text-white/60">
          A community water-point tracking demo. Statuses shown are community reports, not
          certified water-safety guarantees. This platform does not detect contamination and does
          not replace local water authorities.
        </p>
        <p className="mt-3 text-xs text-black/40 dark:text-white/40">
          All data on this site is fictional demonstration data. See{" "}
          <a className="underline" href="/data-methodology">
            data methodology
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
