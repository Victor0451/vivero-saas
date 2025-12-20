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
  onSuccess?: () => void
}

export function TareaSheet({ open, onOpenChange, tarea, defaultPlantaId, onSuccess }: TareaSheetProps) {
  const isEditing = !!tarea

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
            {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos de la tarea seleccionada.'
              : 'Agrega una nueva tarea a tu lista de pendientes.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <TareaForm
            tarea={tarea}
            defaultPlantaId={defaultPlantaId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
