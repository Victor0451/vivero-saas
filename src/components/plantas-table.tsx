'use client'

import { useState, memo, useCallback } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/empty-state'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MoreHorizontal, Pencil, Trash2, Sprout, CheckSquare, Stethoscope, Calendar, Flower } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { Checkbox } from '@/components/ui/checkbox'
import type { PlantaConDetalles } from '@/types'
import { softDeletePlanta } from '../app/actions/plantas'

interface PlantasTableProps {
  plantas: PlantaConDetalles[]
  loading?: boolean
  error?: string | null
  onEdit?: (planta: PlantaConDetalles) => void
  onRefresh?: () => void
  onCreate?: () => void
  onCreateTarea?: (planta: PlantaConDetalles) => void
  onCreateHistoria?: (planta: PlantaConDetalles) => void
  selectedIds?: number[]
  onToggleSelection?: (id: number) => void
  onToggleAllSelect?: (ids: number[]) => void
}

const PlantasTableComponent = ({
  plantas,
  loading,
  error,
  onEdit,
  onRefresh,
  onCreate,
  onCreateTarea,
  onCreateHistoria,
  selectedIds = [],
  onToggleSelection,
  onToggleAllSelect
}: PlantasTableProps) => {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; nombre: string }>({
    open: false,
    id: null,
    nombre: ''
  })

  const handleDeleteClick = useCallback((id: number, nombre: string) => {
    setConfirmDelete({ open: true, id, nombre })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDelete.id) return

    setDeletingId(confirmDelete.id)
    setConfirmDelete({ open: false, id: null, nombre: '' })

    try {
      await softDeletePlanta(confirmDelete.id)
      onRefresh?.()
      showToast.success('Planta eliminada correctamente')
    } catch (error) {
      console.error('Error deleting planta:', error)
      showToast.error('Error al eliminar la planta')
    } finally {
      setDeletingId(null)
    }
  }, [confirmDelete.id, onRefresh])


  const getEstadoBadge = (planta: PlantaConDetalles) => {
    if (planta.esta_muerta) {
      return <Badge variant="destructive">Muerta</Badge>
    }
    if (planta.esta_enferma) {
      return <Badge variant="secondary">Enferma</Badge>
    }
    return <Badge variant="default">Normal</Badge>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-4">Error al cargar las plantas</div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={onRefresh} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Table>
          <TableHeader>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={plantas.length > 0 && selectedIds.length === plantas.length}
                onCheckedChange={(checked) => {
                  if (checked) onToggleAllSelect?.(plantas.map(p => p.id_planta))
                  else onToggleAllSelect?.([])
                }}
              />
            </TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Compra</TableHead>
            <TableHead>Floración</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (plantas.length === 0) {
    return (
      <EmptyState
        icon={<Sprout className="h-12 w-12 text-muted-foreground" />}
        title="No hay plantas registradas"
        description="Comienza agregando tu primera planta a la colección."
        action={
          onCreate && (
            <Button onClick={onCreate}>
              <Sprout className="w-4 h-4 mr-2" />
              Agregar primera planta
            </Button>
          )
        }
      />
    )
  }

  return (
    <div className="rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
            <TableHead className="w-[40px] py-4">
              <Checkbox
                checked={plantas.length > 0 && selectedIds.length === plantas.length}
                onCheckedChange={(checked) => {
                  if (checked) onToggleAllSelect?.(plantas.map(p => p.id_planta))
                  else onToggleAllSelect?.([])
                }}
              />
            </TableHead>
            <TableHead className="font-semibold py-4">Nombre</TableHead>
            <TableHead className="font-semibold py-4">Género & Subgénero</TableHead>
            <TableHead className="font-semibold py-4">Tipo</TableHead>
            <TableHead className="font-semibold py-4">Estado</TableHead>
            <TableHead className="font-semibold py-4">Fecha Compra</TableHead>
            <TableHead className="font-semibold py-4">Floración</TableHead>
            <TableHead className="w-[70px] py-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plantas.map((planta) => {
            const isSelected = selectedIds.includes(planta.id_planta)
            return (
              <TableRow
                key={planta.id_planta}
                className={`group hover:bg-muted/20 transition-colors border-b last:border-0 ${isSelected ? 'bg-primary/5' : ''}`}
              >
                <TableCell className="py-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection?.(planta.id_planta)}
                  />
                </TableCell>
                <TableCell className="py-4">
                  <Link
                    href={`/plantas/${planta.id_planta}`}
                    className="font-bold text-primary hover:underline decoration-primary/30 underline-offset-4 transition-all"
                  >
                    {planta.nombre}
                  </Link>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{planta.generos_planta?.nombre || 'N/A'}</span>
                    {planta.subgeneros_planta && (
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {planta.subgeneros_planta.nombre}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className="font-normal bg-muted/50 rounded-lg">
                    {planta.tipos_planta?.nombre || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  {getEstadoBadge(planta)}
                </TableCell>
                <TableCell className="py-4">
                  {planta.fecha_compra ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(planta.fecha_compra).toLocaleDateString('es-ES')}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">N/A</span>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  {planta.floracion ? (
                    <Badge variant="secondary" className="gap-1 bg-pink-500/10 text-pink-500 border-pink-500/20 rounded-full hover:bg-pink-500/20">
                      <Flower className="h-3 w-3" />
                      Sí
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">No</span>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={deletingId === planta.id_planta}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => onEdit?.(planta)} className="rounded-lg">
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar planta
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCreateTarea?.(planta)} className="rounded-lg">
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Nueva tarea
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onCreateHistoria?.(planta)} className="rounded-lg">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Nuevo registro médico
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive rounded-lg focus:text-destructive"
                        onClick={() => handleDeleteClick(planta.id_planta, planta.nombre)}
                        disabled={deletingId === planta.id_planta}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === planta.id_planta ? 'Eliminando...' : 'Eliminar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete(prev => ({ ...prev, open }))}
        title="Eliminar Planta"
        description={`¿Estás seguro de que quieres eliminar la planta "${confirmDelete.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}

export const PlantasTable = memo(PlantasTableComponent)
