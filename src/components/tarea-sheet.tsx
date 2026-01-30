'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { TareaForm } from './tarea-form'
import type { Tarea } from '@/types'

interface TareaSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tarea?: Tarea | null
  defaultPlantaId?: number
  plantaIds?: number[]
  onSuccess?: () => void
}

export function TareaSheet({ open, onOpenChange, tarea, defaultPlantaId, plantaIds = [], onSuccess }: TareaSheetProps) {
  const isEditing = !!tarea
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
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Editar Tarea' : isBulk ? 'Nueva Tarea Masiva' : 'Nueva Tarea'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos de la tarea seleccionada.'
              : isBulk
                ? `Crea una tarea común para las ${plantaIds.length} plantas seleccionadas.`
                : 'Agrega una nueva tarea a tu lista de pendientes.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <TareaForm
            tarea={tarea}
            defaultPlantaId={defaultPlantaId}
            plantaIds={plantaIds}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
