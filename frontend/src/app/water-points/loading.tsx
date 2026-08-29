import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="mx-auto h-7 w-48 sm:mx-0" />
      <Skeleton className="mx-auto mt-3 h-4 w-64 sm:mx-0" />
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    </main>
  );
}
