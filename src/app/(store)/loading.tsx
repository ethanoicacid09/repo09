import { Skeleton } from "@/components/ui/skeleton";

export default function StoreLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <Skeleton className="h-[400px] rounded-2xl mb-12" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
