import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-48" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="mt-8 h-64 w-full" />
    </div>
  );
}
