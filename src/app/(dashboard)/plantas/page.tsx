import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { Plus } from 'lucide-react'
import { PlantasContent } from '../../../components/plantas-content'

export default function PlantasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantas"
        description="Gestiona tu colección de plantas"
      >
        <Button className="gap-2" form="planta-form">
          <Plus className="h-4 w-4" />
          Nueva Planta
        </Button>
      </PageHeader>

      <Suspense fallback={<div>Cargando plantas...</div>}>
        <PlantasContent />
      </Suspense>
    </div>
  )
}