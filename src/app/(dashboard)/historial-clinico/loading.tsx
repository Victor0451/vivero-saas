export default function HistorialClinicoLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded-lg w-64 animate-pulse" />
        <div className="h-4 bg-muted rounded w-96 animate-pulse" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 bg-muted rounded w-12 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="border rounded-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-40 animate-pulse" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 bg-muted rounded w-20 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                </div>
                <div className="h-5 bg-muted rounded w-20 animate-pulse" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="h-3 bg-muted rounded w-20 mb-2 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-full animate-pulse" />
                </div>
                <div>
                  <div className="h-3 bg-muted rounded w-24 mb-2 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
