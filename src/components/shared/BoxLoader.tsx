"use client";
const PromotionCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-sm border border-border overflow-hidden animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="relative aspect-video bg-muted" />

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />

            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>

            <div className="flex gap-4 pt-3 border-t border-border">
              <div className="h-3 bg-muted rounded w-16" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromotionCardSkeleton;
