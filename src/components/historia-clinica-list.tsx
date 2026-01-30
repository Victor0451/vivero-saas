'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Calendar, Stethoscope, Droplets, Scissors, Sprout, Skull, Activity, Syringe, MoveRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { deleteHistoriaClinica } from '@/app/actions/historia-clinica'
import { showToast } from '@/lib/toast'
import type { HistoriaClinica } from '@/types'

interface HistoriaClinicaListProps {
  historias: HistoriaClinica[]
  idPlanta?: number
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

  const getEventIcon = (type?: string) => {
    switch (type) {
      case 'Riego': return <Droplets className="h-4 w-4" />;
      case 'Poda':
      case 'Decapitación':
      case 'Esquejado': return <Scissors className="h-4 w-4" />;
      case 'Fertilización': return <Sprout className="h-4 w-4" />;
      case 'Transplante': return <MoveRight className="h-4 w-4" />;
      case 'Tratamiento': return <Syringe className="h-4 w-4" />;
      case 'Deceso': return <Skull className="h-4 w-4" />;
      case 'Diagnóstico': return <Activity className="h-4 w-4" />;
      default: return <Stethoscope className="h-4 w-4" />;
    }
  }

  const getEventColor = (type?: string) => {
    switch (type) {
      case 'Riego': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800';
      case 'Tratamiento': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-800';
      case 'Transplante': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-800';
      case 'Deceso': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-200 dark:border-red-800';
      default: return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
    }
  }

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
        )
        }
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
      </Card >
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
                  <Badge variant={historia.estuvo_enferma ? "destructive" : "outline"}>
                    {historia.estuvo_enferma ? 'Enferma' : 'Saludable'}
                  </Badge>
                  {historia.tipo_evento && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getEventColor(historia.tipo_evento)}`}>
                      {getEventIcon(historia.tipo_evento)}
                      {historia.tipo_evento}
                    </div>
                  )}
                  {historia.plantas && (
                    <Badge variant="secondary" className="bg-muted">
                      {historia.plantas.nombre}
                    </Badge>
                  )}
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
    </Card >
  )
}
