'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { HistoriaClinicaForm } from './historia-clinica-form'
import type { HistoriaClinica } from '@/types'

interface HistoriaClinicaSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  historia?: HistoriaClinica | null
  idPlanta: number
  plantas?: Array<{ id_planta: number; nombre: string }>
  allowPlantaSelection?: boolean
  onSuccess?: () => void
}

export function HistoriaClinicaSheet({
  open,
  onOpenChange,
  historia,
  idPlanta,
  plantas = [],
  allowPlantaSelection = false,
  onSuccess
}: HistoriaClinicaSheetProps) {
  const isEditing = !!historia

  const handleSuccess = () => {
    onSuccess?.()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Editar Registro Clínico' : 'Nuevo Registro Clínico'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos del registro clínico seleccionado.'
              : 'Registra el estado de salud y tratamientos aplicados a la planta.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <HistoriaClinicaForm
            historia={historia}
            idPlanta={idPlanta}
            plantas={plantas}
            allowPlantaSelection={allowPlantaSelection}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
