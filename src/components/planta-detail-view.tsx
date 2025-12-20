'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Lightbulb,
  Droplets,
  Sprout,
  AlertTriangle,
  Skull,
  Flower,
  ImageIcon,
  Plus,
  CheckSquare
} from 'lucide-react'
import type { PlantaConDetalles, HistoriaClinica, Tarea } from '@/types'
import { getPlantaByIdWithResponse, softDeletePlanta, getHistoriaClinicaByPlanta, getTareas } from '../app/actions/plantas'
import { showToast } from '@/lib/toast'
import { PlantaSheet } from './planta-sheet'
import { DeletePlantaDialog } from './delete-planta-dialog'
import { HistoriaClinicaList } from './historia-clinica-list'
import { HistoriaClinicaSheet } from './historia-clinica-sheet'
import { TareaSheet } from './tarea-sheet'

interface PlantaDetailViewProps {
  id: number
}

export function PlantaDetailView({ id }: PlantaDetailViewProps) {
  const router = useRouter()
  const [planta, setPlanta] = useState<PlantaConDetalles | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historiaClinica, setHistoriaClinica] = useState<HistoriaClinica[]>([])
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [historiaSheetOpen, setHistoriaSheetOpen] = useState(false)
  const [tareaSheetOpen, setTareaSheetOpen] = useState(false)
  const [editingHistoria, setEditingHistoria] = useState<HistoriaClinica | null>(null)
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null)

  const loadPlanta = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getPlantaByIdWithResponse(id)

      if (result.success && result.data) {
        setPlanta(result.data)
        // Cargar historial clínico y tareas relacionadas
        await Promise.all([
          loadHistoriaClinica(),
          loadTareas()
        ])
      } else {
        setError(result.message || 'Error al cargar la planta')
      }
    } catch (err) {
      console.error('Error loading planta:', err)
      setError('Error al cargar la planta')
    } finally {
      setLoading(false)
    }
  }

  const loadHistoriaClinica = async () => {
    try {
      const data = await getHistoriaClinicaByPlanta(id)
      setHistoriaClinica(data)
    } catch (err) {
      console.error('Error loading historia clinica:', err)
    }
  }

  const loadTareas = async () => {
    try {
      const data = await getTareas()
      // Filtrar solo las tareas relacionadas con esta planta
      const tareasPlanta = data.filter(tarea => tarea.id_planta === id)
      setTareas(tareasPlanta)
    } catch (err) {
      console.error('Error loading tareas:', err)
    }
  }

  useEffect(() => {
    loadPlanta()
  }, [id])

  const handleEdit = () => {
    setSheetOpen(true)
  }

  const handleDelete = async () => {
    if (!planta) return

    const loadingToast = showToast.loading('Eliminando planta...')

    try {
      const result = await softDeletePlanta(planta.id_planta)

      showToast.dismiss(loadingToast)

      if (result.success) {
        showToast.success('Planta eliminada correctamente')
        router.push('/plantas')
      } else {
        showToast.error(result.message || 'Error al eliminar la planta')
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      console.error('Error deleting planta:', error)
      showToast.error('Error al eliminar la planta')
    }
  }

  const handleSuccess = () => {
    loadPlanta()
  }

  const handleAddHistoriaClinica = () => {
    setEditingHistoria(null)
    setHistoriaSheetOpen(true)
  }

  const handleEditHistoriaClinica = (historia: HistoriaClinica) => {
    setEditingHistoria(historia)
    setHistoriaSheetOpen(true)
  }

  const handleHistoriaClinicaSuccess = () => {
    loadHistoriaClinica()
  }

  const handleAddTarea = () => {
    setEditingTarea(null)
    setTareaSheetOpen(true)
  }

  const handleEditTarea = (tarea: Tarea) => {
    setEditingTarea(tarea)
    setTareaSheetOpen(true)
  }

  const handleTareaSuccess = () => {
    loadTareas()
  }

  const getIluminacionIcon = (iluminacion?: string) => {
    switch (iluminacion) {
      case 'sol-directo':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />
      case 'sol-indirecto':
        return <Lightbulb className="w-4 h-4 text-orange-500" />
      case 'sombra':
        return <Lightbulb className="w-4 h-4 text-gray-500" />
      case 'luz-artificial':
        return <Lightbulb className="w-4 h-4 text-blue-500" />
      default:
        return <Lightbulb className="w-4 h-4 text-gray-400" />
    }
  }

  const getIluminacionLabel = (iluminacion?: string) => {
    switch (iluminacion) {
      case 'sol-directo':
        return 'Sol directo'
      case 'sol-indirecto':
        return 'Sol indirecto'
      case 'sombra':
        return 'Sombra'
      case 'luz-artificial':
        return 'Luz artificial'
      default:
        return 'No especificada'
    }
  }

  const getEstadoBadge = (planta: PlantaConDetalles) => {
    if (planta.esta_muerta) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Skull className="w-3 h-3" />
          Muerta
        </Badge>
      )
    }
    if (planta.esta_enferma) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Enferma
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1">
        <Sprout className="w-3 h-3" />
        Normal
      </Badge>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error al cargar la planta</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadPlanta} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || !planta) {
    return <PlantaDetailSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{planta.nombre}</h1>
            <p className="text-muted-foreground">
              {planta.tipos_planta?.nombre} • {planta.generos_planta?.nombre}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Imagen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planta.image_url ? (
              <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                <Image
                  src={planta.image_url}
                  alt={planta.nombre}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/25">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Sin imagen</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Section */}
        <div className="space-y-6">
          {/* Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent>
              {getEstadoBadge(planta)}
            </CardContent>
          </Card>

          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p className="text-sm">{planta.tipos_planta?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Género</p>
                  <p className="text-sm">{planta.generos_planta?.nombre || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Maceta</p>
                  <p className="text-sm">
                    {planta.macetas
                      ? `${planta.macetas.tipo}${planta.macetas.material ? ` (${planta.macetas.material})` : ''}`
                      : 'Sin maceta'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Iluminación</p>
                  <div className="flex items-center gap-2">
                    {getIluminacionIcon(planta.iluminacion)}
                    <span className="text-sm">{getIluminacionLabel(planta.iluminacion)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Fechas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {planta.fecha_compra && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de compra</p>
                  <p className="text-sm">
                    {new Date(planta.fecha_compra).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {planta.fecha_transplante && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de transplante</p>
                  <p className="text-sm">
                    {new Date(planta.fecha_transplante).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {!planta.fecha_compra && !planta.fecha_transplante && (
                <p className="text-sm text-muted-foreground">No hay fechas registradas</p>
              )}
            </CardContent>
          </Card>

          {/* Observaciones */}
          {planta.observaciones && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{planta.observaciones}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Historial Clínico */}
      <div className="mt-8">
        <HistoriaClinicaList
          historias={historiaClinica}
          idPlanta={id}
          onAdd={handleAddHistoriaClinica}
          onEdit={handleEditHistoriaClinica}
          onRefresh={loadHistoriaClinica}
        />
      </div>

      {/* Tareas */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Tareas ({tareas.length})
              </CardTitle>
              <Button size="sm" onClick={handleAddTarea}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tareas.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No hay tareas asignadas
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea tareas de mantenimiento para esta planta.
                </p>
                <Button onClick={handleAddTarea}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Tarea
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tareas.map((tarea) => (
                  <div
                    key={tarea.id_tarea}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${tarea.completada
                        ? 'bg-muted/50 border-muted'
                        : 'bg-card border-border'
                      }`}
                    onClick={() => handleEditTarea(tarea)}
                  >
                    <Checkbox
                      checked={tarea.completada}
                      disabled
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${tarea.completada ? 'line-through text-muted-foreground' : ''
                          }`}>
                          {tarea.titulo}
                        </h3>
                        {tarea.completada && (
                          <Badge variant="secondary" className="text-xs">
                            Completada
                          </Badge>
                        )}
                      </div>
                      {tarea.descripcion && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {tarea.descripcion}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tarea.fecha_programada), 'PPP', { locale: es })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PlantaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        planta={planta}
        onSuccess={handleSuccess}
      />

      <DeletePlantaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        planta={planta}
        onSuccess={handleDelete}
      />

      <HistoriaClinicaSheet
        open={historiaSheetOpen}
        onOpenChange={setHistoriaSheetOpen}
        historia={editingHistoria}
        idPlanta={id}
        onSuccess={handleHistoriaClinicaSuccess}
      />

      <TareaSheet
        open={tareaSheetOpen}
        onOpenChange={setTareaSheetOpen}
        tarea={editingTarea}
        onSuccess={handleTareaSuccess}
      />
    </div>
  )
}

function PlantaDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-square w-full" />
          </CardContent>
        </Card>

        {/* Info skeleton */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
