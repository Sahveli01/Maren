import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded animate-pulse", className)}
      style={{ background: "#111" }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="lv-sbox">
      <Skeleton className="h-2.5 w-14 mb-3" />
      <Skeleton className="h-6 w-20 mb-2" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  );
}
