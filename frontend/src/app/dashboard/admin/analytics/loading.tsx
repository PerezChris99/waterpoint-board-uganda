import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}
