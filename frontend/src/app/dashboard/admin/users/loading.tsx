import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-7 w-40" />
      <div className="mt-6 flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
