'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Plus, CheckSquare, Clock, Filter, Calendar, Sprout } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getTareas, toggleTareaCompletada } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'
import { TareaSheet } from '@/components/tarea-sheet'
import type { Tarea } from '@/types'

// Tipos extendidos para mostrar información de plantas relacionadas
type TareaConPlanta = Tarea & {
  plantas?: {
    nombre: string
  } | null
}

type FilterType = 'all' | 'pending' | 'completed'

export default function TareasPage() {
  const [tareas, setTareas] = useState<TareaConPlanta[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingTarea, setEditingTarea] = useState<Tarea | null>(null)

  const loadTareas = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getTareas()
      setTareas(data)
    } catch (err) {
      console.error('Error loading tareas:', err)
      setError('Error al cargar las tareas')
      showToast.error('Error al cargar las tareas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTareas()
  }, [])

  const filteredTareas = tareas.filter(tarea => {
    switch (filter) {
      case 'pending':
        return !tarea.completada
      case 'completed':
        return tarea.completada
      default:
        return true
    }
  })

  const handleToggleTarea = async (id: number) => {
    const tarea = tareas.find(t => t.id_tarea === id)
    if (!tarea) return

    // Optimistic update
    setTareas(prev => prev.map(t =>
      t.id_tarea === id
        ? { ...t, completada: !t.completada }
        : t
    ))

    try {
      const result = await toggleTareaCompletada(id)
      if (result.success) {
        showToast.success(result.message)
      } else {
        // Revert optimistic update on error
        setTareas(prev => prev.map(t =>
          t.id_tarea === id
            ? { ...t, completada: !t.completada }
            : t
        ))
        showToast.error(result.message)
      }
    } catch (error) {
      // Revert optimistic update on error
      setTareas(prev => prev.map(t =>
        t.id_tarea === id
          ? { ...t, completada: !t.completada }
          : t
      ))
      showToast.error('Error al actualizar la tarea')
    }
  }

  const handleCreate = () => {
    setEditingTarea(null)
    setSheetOpen(true)
  }

  const handleEdit = (tarea: Tarea) => {
    setEditingTarea(tarea)
    setSheetOpen(true)
  }

  const handleSuccess = () => {
    loadTareas()
  }

  const stats = {
    total: tareas.length,
    pending: tareas.filter(t => !t.completada).length,
    completed: tareas.filter(t => t.completada).length
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tareas"
        description="Gestiona las tareas de mantenimiento de tus plantas"
      >
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Lista de Tareas
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas ({stats.total})
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendientes ({stats.pending})
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('completed')}
              >
                Completadas ({stats.completed})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTareas.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="h-12 w-12 text-muted-foreground" />}
              title="No hay tareas en esta categoría"
              description={
                filter === 'pending'
                  ? "¡Excelente! Todas las tareas están completadas."
                  : filter === 'completed'
                    ? "Aún no has completado ninguna tarea."
                    : "No hay tareas registradas."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredTareas.map((tarea) => (
                <div
                  key={tarea.id_tarea}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-all hover:shadow-sm ${tarea.completada
                      ? 'bg-muted/50 border-muted'
                      : 'bg-card border-border'
                    }`}
                >
                  <Checkbox
                    checked={tarea.completada}
                    onCheckedChange={() => handleToggleTarea(tarea.id_tarea)}
                    disabled={isLoading}
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
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(tarea.fecha_programada), 'PPP', { locale: es })}
                      </div>
                      {tarea.plantas && (
                        <div className="flex items-center gap-1">
                          <Sprout className="h-3 w-3" />
                          {tarea.plantas.nombre}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TareaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        tarea={editingTarea}
        onSuccess={handleSuccess}
      />
    </div>
  )
}