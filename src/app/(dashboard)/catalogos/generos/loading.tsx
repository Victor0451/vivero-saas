export default function GenerosLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded-lg w-64 animate-pulse" />
        <div className="h-4 bg-muted rounded w-96 animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-1 max-w-md">
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-muted rounded w-24 animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-8 bg-muted rounded w-8 animate-pulse" />
          <div className="h-3 bg-muted rounded w-32 mt-2 animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border rounded-lg">
        <div className="p-6 border-b">
          <div className="h-6 bg-muted rounded w-40 animate-pulse" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-muted rounded w-[200px] animate-pulse" />
                <div className="h-4 bg-muted rounded w-[300px] animate-pulse" />
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
