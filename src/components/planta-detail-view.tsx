'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  Lightbulb,
  Sprout,
  AlertTriangle,
  Skull,
  Calendar,
  ImageIcon,
  Plus,
  CheckSquare,
  QrCode,
  Activity,
  Download
} from 'lucide-react'
import { getPlantaByIdWithResponse, softDeletePlanta } from '@/app/actions/plantas'
import { getHistoriaClinicaByPlanta } from '@/app/actions/historia-clinica'
import { getTareas } from '@/app/actions/tareas'
import { getGeneros } from '@/app/actions/generos'
import { getMacetas } from '@/app/actions/macetas'
import { showToast } from '@/lib/toast'
import { formatDateUTC } from '@/lib/utils'
import { PlantaSheet } from './planta-sheet'
import { DeletePlantaDialog } from './delete-planta-dialog'
import { HistoriaClinicaTimeline } from './historia-clinica-timeline'
import { HistoriaClinicaSheet } from './historia-clinica-sheet'
import { TareaSheet } from './tarea-sheet'
import { PlantaQRLabel } from './planta-qr-label'
import { ShareCaseDialog } from './share-case-dialog'
import { AddFotoDialog } from './add-foto-dialog'
import { generateClinicalReport } from '@/lib/pdf-generator'

// ... existing imports
import { PlantaFotosGallery } from './planta-fotos-gallery'
import { getFotosPlanta } from '@/app/actions/fotos'
import { HistoriaClinicaFilters, type FilterState } from './historia-clinica-filters'
import type { PlantaConDetalles, HistoriaClinica, Tarea, GeneroPlanta, Maceta, FotoPlanta } from '@/types'

export interface PlantaDetailViewProps {
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
  const [generos, setGeneros] = useState<GeneroPlanta[]>([])
  const [macetas, setMacetas] = useState<Maceta[]>([])
  const [fotos, setFotos] = useState<FotoPlanta[]>([])

  const [historiaSheetOpen, setHistoriaSheetOpen] = useState(false)
  const [tareaSheetOpen, setTareaSheetOpen] = useState(false)
  const [addFotoOpen, setAddFotoOpen] = useState(false)
  const [editingHistoria, setEditingHistoria] = useState<HistoriaClinica | null>(null)
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null)
  const [qrLabelOpen, setQrLabelOpen] = useState(false)

  const [historyFilters, setHistoryFilters] = useState<FilterState>({
    search: '',
    tipoEvento: 'all',
    estado: 'all',
    fechaStart: '',
    fechaEnd: ''
  })

  const loadTareas = useCallback(async () => {
    try {
      const data = await getTareas()
      // Filtrar solo las tareas relacionadas con esta planta
      const tareasPlanta = data.filter(tarea => tarea.id_planta === id)
      setTareas(tareasPlanta)
    } catch (err) {
      console.error('Error loading tareas:', err)
    }
  }, [id])

  const loadFotos = useCallback(async () => {
    try {
      const data = await getFotosPlanta(id)
      setFotos(data)
    } catch (err) {
      console.error('Error loading fotos:', err)
    }
  }, [id])

  const loadHistoriaClinica = useCallback(async () => {
    try {
      const data = await getHistoriaClinicaByPlanta(id)
      setHistoriaClinica(data)
    } catch (err) {
      console.error('Error loading historia clinica:', err)
    }
  }, [id])

  const loadPlanta = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getPlantaByIdWithResponse(id)

      if (result.success && result.data) {
        setPlanta(result.data)
        // Cargar historial clínico y tareas relacionadas
        await Promise.all([
          loadHistoriaClinica(),
          loadTareas(),
          loadFotos()
        ])
      } else {
        setError(result.message === 'Planta no encontrada' ? 'No tienes permiso para ver esta planta o no existe.' : (result.message || 'Error al cargar la planta'))
      }
    } catch (err) {
      console.error('Error loading planta:', err)
      setError('Error al cargar la planta')
    } finally {
      setLoading(false)
    }
  }, [id, loadHistoriaClinica, loadTareas, loadFotos])

  useEffect(() => {
    loadPlanta()
  }, [loadPlanta])

  useEffect(() => {
    async function fetchCatalogues() {
      try {
        const [g, m] = await Promise.all([getGeneros(), getMacetas()])
        setGeneros(g)
        setMacetas(m)
      } catch (e) {
        console.error('Error fetching catalogues', e)
      }
    }
    fetchCatalogues()
  }, [])


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
    loadPlanta() // Recargar la planta para actualizar la maceta si hubo un transplante
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

  const filteredHistory = historiaClinica.filter(item => {
    // Filter by Search
    if (historyFilters.search && !item.descripcion.toLowerCase().includes(historyFilters.search.toLowerCase()) &&
      (!item.tratamiento || !item.tratamiento.toLowerCase().includes(historyFilters.search.toLowerCase()))) {
      return false;
    }

    // Filter by Type
    if (historyFilters.tipoEvento !== 'all' && item.tipo_evento !== historyFilters.tipoEvento) {
      return false;
    }

    // Filter by State
    if (historyFilters.estado !== 'all') {
      if (historyFilters.estado === 'enferma' && !item.estuvo_enferma) return false;
      if (historyFilters.estado === 'sana' && item.estuvo_enferma) return false;
    }

    // Filter by Date
    if (historyFilters.fechaStart && new Date(item.fecha) < new Date(historyFilters.fechaStart)) return false;
    if (historyFilters.fechaEnd && new Date(item.fecha) > new Date(historyFilters.fechaEnd)) return false;

    return true;
  }).sort((a, b) => {
    // Sort by Date DESC
    const timeA = new Date(a.fecha).getTime()
    const timeB = new Date(b.fecha).getTime()
    if (timeA !== timeB) return timeB - timeA

    // Secondary Sort by ID DESC (Newest created first)
    return b.id_historia - a.id_historia
  });

  const activeFiltersCount = [
    historyFilters.search !== '',
    historyFilters.tipoEvento !== 'all',
    historyFilters.estado !== 'all',
    historyFilters.fechaStart !== '',
    historyFilters.fechaEnd !== ''
  ].filter(Boolean).length;

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
          <ShareCaseDialog idPlanta={planta.id_planta} plantName={planta.nombre} />
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={() => setQrLabelOpen(true)} className="border-primary/20 hover:bg-primary/5 text-primary">
            <QrCode className="w-4 h-4 mr-2" />
            Etiqueta QR
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
        {/* Bitácora Visual Section */}
        <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-muted/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <ImageIcon className="w-4 h-4 text-primary" />
              </div>
              Bitácora Visual
            </CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAddFotoOpen(true)}
              className="h-8 px-3 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Agregar
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            {/* Foto Principal Actual */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Portada Actual</h4>
              {planta.image_url ? (
                <div className="aspect-video w-full relative rounded-xl overflow-hidden border border-border/50 shadow-sm group">
                  <img
                    src={planta.image_url}
                    alt={planta.nombre}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden')
                    }}
                  />
                  <div className="fallback hidden absolute inset-0 flex items-center justify-center bg-muted">
                    <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div className="aspect-video w-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/10 bg-muted/30">
                  <ImageIcon className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground/60 font-medium">Sin portada asignada</p>
                </div>
              )}
            </div>

            <Separator className="bg-border/40" />

            {/* Galería (Línea de Tiempo) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Línea de Tiempo</h4>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {fotos.length} fotos
                </span>
              </div>
              <PlantaFotosGallery
                fotos={fotos}
                idPlanta={id}
                onUpdate={() => {
                  loadFotos()
                  loadPlanta() // Para actualizar la portada si cambió
                }}
              />
            </div>
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
                    {formatDateUTC(planta.fecha_compra, "dd 'de' MMMM 'de' yyyy")}
                  </p>
                </div>
              )}

              {planta.fecha_transplante && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha de transplante</p>
                  <p className="text-sm">
                    {formatDateUTC(planta.fecha_transplante, "dd 'de' MMMM 'de' yyyy")}
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
        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="border-b bg-muted/40 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-indigo-100 rounded-md">
                  <Activity className="h-5 w-5 text-indigo-600" />
                </div>
                Historial Clínico
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => generateClinicalReport(planta, filteredHistory)}
                  className="hidden sm:flex bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border border-indigo-200 shadow-sm"
                  title="Descargar Informe PDF"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button size="sm" onClick={handleAddHistoriaClinica} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Registro
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <HistoriaClinicaFilters
              onFilterChange={setHistoryFilters}
              activeFiltersCount={activeFiltersCount}
            />

            <div className="relative pl-2">
              <HistoriaClinicaTimeline
                historias={filteredHistory}
                onEdit={handleEditHistoriaClinica}
              />
            </div>
          </CardContent>
        </Card>
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
        defaultPlantaId={id}
        plantas={planta ? [{
          id_planta: planta.id_planta,
          nombre: planta.nombre,
          id_genero: planta.id_genero,
          id_subgenero: planta.id_subgenero,
          id_maceta: planta.id_maceta
        }] : []}
        generos={generos}
        macetas={macetas}
        onSuccess={handleHistoriaClinicaSuccess}
      />

      <TareaSheet
        open={tareaSheetOpen}
        onOpenChange={setTareaSheetOpen}
        tarea={editingTarea}
        onSuccess={handleTareaSuccess}
      />

      <PlantaQRLabel
        open={qrLabelOpen}
        onOpenChange={setQrLabelOpen}
        planta={planta}
      />

      <AddFotoDialog
        open={addFotoOpen}
        onOpenChange={setAddFotoOpen}
        idPlanta={id}
        onSuccess={() => {
          loadFotos()
          loadPlanta()
        }}
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
