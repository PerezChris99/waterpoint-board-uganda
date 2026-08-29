import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-2 h-7 w-64" />
      <Skeleton className="mt-2 h-4 w-48" />
      <div className="mt-4 flex gap-3">
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
      <Skeleton className="mt-8 h-40 w-full" />
    </main>
  );
}
