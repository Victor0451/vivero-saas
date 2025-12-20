'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { MacetaForm } from './maceta-form'
import type { Maceta } from '@/types'

interface MacetaSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  maceta?: Maceta | null
  onSuccess?: () => void
}

export function MacetaSheet({ open, onOpenChange, maceta, onSuccess }: MacetaSheetProps) {
  const isEditing = !!maceta

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
            {isEditing ? 'Editar Maceta' : 'Nueva Maceta'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos de la maceta seleccionada.'
              : 'Agrega una nueva maceta a tu catálogo.'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <MacetaForm
            maceta={maceta}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
