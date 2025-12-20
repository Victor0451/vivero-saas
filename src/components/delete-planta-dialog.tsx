'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { softDeletePlanta } from '../app/actions/plantas'
import type { PlantaConDetalles } from '@/types'
import { showToast } from '@/lib/toast'

interface DeletePlantaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planta: PlantaConDetalles | null
  onSuccess?: () => void
}

export function DeletePlantaDialog({ open, onOpenChange, planta, onSuccess }: DeletePlantaDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!planta) return

    const loadingToast = showToast.loading('Eliminando planta...')
    setLoading(true)
    try {
      const result = await softDeletePlanta(planta.id_planta)

      showToast.dismiss(loadingToast)

      if (result.success) {
        showToast.success(result.message)
        onSuccess?.()
        onOpenChange(false)
      } else {
        showToast.error(result.message)
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      console.error('Error deleting planta:', error)
      showToast.error('Error al eliminar la planta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar planta?</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres eliminar la planta "{planta?.nombre}"?
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
