import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'

export default function ProfileLoading() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Perfil de Usuario"
        description="Administra tu información personal y preferencias"
      />

      <div className="max-w-2xl space-y-6">
        {/* Avatar Section */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  )
}
