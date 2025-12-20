'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { PlantaDetailView } from '@/components/planta-detail-view'

export default function PlantaDetailPage() {
  const params = useParams()
  const id = parseInt(params.id as string)

  if (!id || isNaN(id)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">ID de planta inválido</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<PlantaDetailSkeleton />}>
      <PlantaDetailView id={id} />
    </Suspense>
  )
}

function PlantaDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded-lg w-64 animate-pulse" />
        <div className="h-4 bg-muted rounded w-96 animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Info skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-48 animate-pulse" />
              <div className="h-4 bg-muted rounded w-40 animate-pulse" />
              <div className="h-4 bg-muted rounded w-36 animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-44 animate-pulse" />
              <div className="h-4 bg-muted rounded w-38 animate-pulse" />
              <div className="h-4 bg-muted rounded w-42 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
