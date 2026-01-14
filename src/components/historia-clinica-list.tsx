'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Calendar, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { deleteHistoriaClinica } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'
import type { HistoriaClinica } from '@/types'

interface HistoriaClinicaListProps {
  historias: HistoriaClinica[]
  idPlanta: number
  onAdd?: () => void
  onEdit?: (historia: HistoriaClinica) => void
  onRefresh?: () => void
  showTitle?: boolean
  compact?: boolean
}

export function HistoriaClinicaList({
  historias,
  onAdd,
  onEdit,
  onRefresh,
  showTitle = true,
  compact = false
}: HistoriaClinicaListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const result = await deleteHistoriaClinica(id)
      if (result.success) {
        showToast.success(result.message)
        onRefresh?.()
      } else {
        showToast.error(result.message)
      }
    } catch (error) {
      console.error('Error deleting historia clinica:', error)
      showToast.error('Error al eliminar el registro')
    } finally {
      setDeletingId(null)
    }
  }

  if (historias.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Historial Clínico
              </CardTitle>
              {onAdd && (
                <Button size="sm" onClick={onAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Registro
                </Button>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No hay registros clínicos
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Registra el estado de salud y tratamientos de esta planta.
            </p>
            {onAdd && (
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Registro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Historial Clínico ({historias.length})
            </CardTitle>
            {onAdd && (
              <Button size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={compact ? "p-0" : ""}>
        <div className="space-y-4">
          {historias.map((historia) => (
            <div
              key={historia.id_historia}
              className={`border rounded-lg p-4 transition-all hover:shadow-sm ${historia.estuvo_enferma
                ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20'
                : 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(new Date(historia.fecha), 'PPP', { locale: es })}
                  </span>
                  <Badge variant={historia.estuvo_enferma ? "destructive" : "secondary"}>
                    {historia.estuvo_enferma ? 'Enferma' : 'Saludable'}
                  </Badge>
                </div>
                {!compact && onEdit && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(historia)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente
                            el registro clínico del {format(new Date(historia.fecha), 'PPP', { locale: es })}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(historia.id_historia)}
                            disabled={deletingId === historia.id_historia}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingId === historia.id_historia ? 'Eliminando...' : 'Eliminar'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Descripción
                  </h4>
                  <p className="text-sm">{historia.descripcion}</p>
                </div>

                {historia.tratamiento && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Tratamiento
                    </h4>
                    <p className="text-sm">{historia.tratamiento}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
