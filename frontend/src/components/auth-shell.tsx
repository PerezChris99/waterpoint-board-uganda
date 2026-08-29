const HIGHLIGHTS = [
  { label: "62", detail: "water points tracked" },
  { label: "24", detail: "community accounts" },
  { label: "3", detail: "roles: member, caretaker, admin" },
];

export function AuthShell({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-black/10 shadow-xl shadow-black/5 dark:border-white/10 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#0a1628_0%,#1e3a5f_55%,#2f7ec2_100%)] p-10 text-white lg:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--wb-teal-400)]/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-[var(--wb-water-400)]/30 blur-3xl"
          />
          <div className="relative z-10">
            <p className="flex items-center gap-2 text-lg font-semibold">
              <span aria-hidden>💧</span> WaterPoint Board Uganda
            </p>
            <p className="mt-6 text-2xl font-semibold leading-snug">
              Real-time water infrastructure tracking, built for communities and governments alike.
            </p>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              WaterPoint Board was built so any village water committee, NGO, or district water office
              could see the true operational status of every borehole and tap stand — and act on
              problems the same day they&rsquo;re reported.
            </p>
          </div>
          <div className="relative z-10 mt-10 grid grid-cols-3 gap-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.detail}>
                <p className="text-2xl font-semibold text-[var(--wb-teal-300)]">{h.label}</p>
                <p className="mt-1 text-xs text-white/70">{h.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--background)] p-8 sm:p-12">
          <p className="text-sm font-medium tracking-wide text-[var(--wb-water-500)] uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-sm text-black/60 dark:text-white/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
