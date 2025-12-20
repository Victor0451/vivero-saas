import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'

export default function PlantasLoading() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantas"
        description="Gestiona tu colección de plantas"
      >
        <Skeleton className="h-10 w-[140px]" />
      </PageHeader>

      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-4">
            {/* Header de tabla */}
            <div className="grid grid-cols-6 gap-4 pb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>

            {/* Filas de la tabla */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-4 border-t">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
