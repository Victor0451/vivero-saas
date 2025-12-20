'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { GeneroForm } from './genero-form'
import type { GeneroPlanta } from '@/types'

interface GeneroSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  genero?: GeneroPlanta | null
  onSuccess?: () => void
}

export function GeneroSheet({ open, onOpenChange, genero, onSuccess }: GeneroSheetProps) {
  const isEditing = !!genero

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
            {isEditing ? 'Editar Género' : 'Nuevo Género'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos del género seleccionado.'
              : 'Agrega un nuevo género de plantas a tu catálogo.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <GeneroForm
            genero={genero}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
