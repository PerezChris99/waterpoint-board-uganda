import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="mt-2 text-black/60 dark:text-white/60">
        Your account does not have permission to view this page.
      </p>
      <Link href="/" className="mt-6 text-[var(--wb-water-500)] underline">
        Return home
      </Link>
    </main>
  );
}
