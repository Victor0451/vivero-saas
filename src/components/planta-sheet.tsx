'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PlantaForm } from './planta-form'
import type { PlantaConDetalles } from '@/types'

interface PlantaSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planta?: PlantaConDetalles | null
  onSuccess?: () => void
}

export function PlantaSheet({ open, onOpenChange, planta, onSuccess }: PlantaSheetProps) {
  const isEditing = !!planta

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
            {isEditing ? 'Editar Planta' : 'Nueva Planta'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos de la planta seleccionada.'
              : 'Agrega una nueva planta a tu colección.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <PlantaForm
            planta={planta}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
