export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-black/10 dark:bg-white/10 ${className}`} />;
}
