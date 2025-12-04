/**
 * Skeleton Loader Component
 * Shows animated placeholder while content is loading
 */

export function SkeletonCard() {
  return (
    <div className="rounded-lg overflow-hidden bg-muted animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-[4/3] bg-muted-foreground/20" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-muted-foreground/20 rounded w-3/4" />

        {/* Subtitle */}
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />

        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-3 bg-muted-foreground/20 rounded-full" />
          ))}
        </div>

        {/* Price */}
        <div className="h-6 bg-muted-foreground/20 rounded w-1/3" />

        {/* Button */}
        <div className="h-10 bg-muted-foreground/20 rounded w-full" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonProductDetails() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image skeleton */}
      <div className="animate-pulse">
        <div className="w-full aspect-square bg-muted-foreground/20 rounded-lg mb-4" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-20 bg-muted-foreground/20 rounded" />
          ))}
        </div>
      </div>

      {/* Details skeleton */}
      <div className="animate-pulse space-y-6">
        {/* Title */}
        <div>
          <div className="h-8 bg-muted-foreground/20 rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
        </div>

        {/* Rating */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-4 bg-muted-foreground/20 rounded" />
          ))}
          <div className="h-4 bg-muted-foreground/20 rounded w-20" />
        </div>

        {/* Price */}
        <div className="h-10 bg-muted-foreground/20 rounded w-1/4" />

        {/* Stock */}
        <div className="h-12 bg-muted-foreground/20 rounded" />

        {/* Quantity */}
        <div className="h-10 bg-muted-foreground/20 rounded w-1/3" />

        {/* Button */}
        <div className="h-12 bg-muted-foreground/20 rounded" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded w-full" />
          <div className="h-4 bg-muted-foreground/20 rounded w-full" />
          <div className="h-4 bg-muted-foreground/20 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCartItem() {
  return (
    <div className="animate-pulse flex gap-4 p-4 border rounded-lg">
      {/* Image */}
      <div className="h-24 w-24 bg-muted-foreground/20 rounded" />

      {/* Details */}
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-muted-foreground/20 rounded w-1/2" />
        <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
        <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
      </div>

      {/* Price */}
      <div className="h-6 bg-muted-foreground/20 rounded w-20" />
    </div>
  );
}

export function SkeletonCheckout() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cart items */}
      <div className="md:col-span-2 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCartItem key={i} />
        ))}
      </div>

      {/* Order summary */}
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted-foreground/20 rounded w-3/4" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
            <div className="h-4 bg-muted-foreground/20 rounded w-1/4" />
          </div>
        </div>
        <div className="h-12 bg-muted-foreground/20 rounded" />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted-foreground/20 rounded"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
