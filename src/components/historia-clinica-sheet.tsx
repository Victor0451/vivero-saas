'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { HistoriaClinicaForm } from './historia-clinica-form'
import type { HistoriaClinica, Maceta } from '@/types'

interface HistoriaClinicaSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  historia?: HistoriaClinica | null
  defaultPlantaId?: number
  plantaIds?: number[] // New Prop
  plantas?: any[] // Using any[] to match Form's flexible type or import types properly
  generos?: any[]
  macetas?: any[]
  onSuccess?: () => void
}

export function HistoriaClinicaSheet({
  open,
  onOpenChange,
  historia,
  defaultPlantaId = 0,
  plantaIds = [],
  plantas = [],
  generos = [],
  macetas = [],
  onSuccess
}: HistoriaClinicaSheetProps) {
  const isEditing = !!historia
  const isBulk = plantaIds.length > 1

  const handleSuccess = () => {
    onSuccess?.()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2 text-xl">
            {isEditing
              ? 'Editar Registro Clínico'
              : isBulk
                ? 'Nuevo Evento Masivo'
                : 'Nuevo Evento Clínico'
            }
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los detalles del evento registrado.'
              : isBulk
                ? `Registra un suceso aplicado a ${plantaIds.length} plantas simultáneamente.`
                : 'Registra un suceso, tratamiento o cambio en la planta.'
            }
          </SheetDescription>
        </SheetHeader>

        <HistoriaClinicaForm
          historia={historia}
          idPlanta={defaultPlantaId}
          plantaIds={plantaIds}
          plantas={plantas}
          generos={generos}
          macetas={macetas}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          allowPlantaSelection={!isEditing && !isBulk && defaultPlantaId === 0}
        />
      </SheetContent>
    </Sheet>
  )
}
