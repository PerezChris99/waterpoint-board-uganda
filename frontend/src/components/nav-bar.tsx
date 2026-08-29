import Link from "next/link";

export async function NavBar({
  session,
}: {
  session: { name: string; role: string } | null;
}) {
  return (
    <header className="border-b border-black/10 bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/75 sticky top-0 z-40">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--wb-water-500)] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6"
      >
        <Link href="/" className="flex min-w-0 shrink items-center gap-1.5 font-semibold tracking-tight sm:gap-2">
          <span aria-hidden className="shrink-0 text-lg">💧</span>
          <span className="truncate">
            <span className="sm:hidden">WaterPoint</span>
            <span className="hidden sm:inline">WaterPoint Board Uganda</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href="/water-points" className="hover:text-[var(--wb-water-500)]">
            Water Points
          </Link>
          <Link href="/map" className="hover:text-[var(--wb-water-500)]">
            Map &amp; Insights
          </Link>
          <Link href="/about" className="hover:text-[var(--wb-water-500)]">
            About
          </Link>
          {session?.role === "MEMBER" ? (
            <Link href="/dashboard/member" className="hover:text-[var(--wb-water-500)]">
              My Reports
            </Link>
          ) : null}
          {session?.role === "CARETAKER" || session?.role === "ADMIN" ? (
            <Link href="/dashboard/caretaker" className="hover:text-[var(--wb-water-500)]">
              Caretaker
            </Link>
          ) : null}
          {session?.role === "ADMIN" ? (
            <Link href="/dashboard/admin" className="hover:text-[var(--wb-water-500)]">
              Admin
            </Link>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
          {session ? (
            <form action="/api/auth/logout" method="post" className="flex items-center gap-2 sm:gap-3">
              <span className="hidden text-black/60 sm:inline dark:text-white/60">
                {session.name}
              </span>
              <button
                type="submit"
                className="whitespace-nowrap rounded-md border border-black/15 px-2.5 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 sm:px-3 sm:text-sm"
              >
                Log out
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-md border border-black/15 px-2.5 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 sm:px-3 sm:text-sm"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-md bg-[var(--wb-water-500)] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[var(--wb-water-400)] sm:px-3 sm:text-sm"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
