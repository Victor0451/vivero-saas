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
import { format } from 'date-fns'
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
}

const PlantasTableComponent = ({ plantas, loading, error, onEdit, onRefresh, onCreate, onCreateTarea, onCreateHistoria }: PlantasTableProps) => {
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

  const handleDeleteCancel = useCallback(() => {
    setConfirmDelete({ open: false, id: null, nombre: '' })
  }, [])

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
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Género</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Compra</TableHead>
              <TableHead>Floración</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
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
    <div className="rounded-md border">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Compra</TableHead>
            <TableHead>Floración</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plantas.map((planta) => (
            <TableRow key={planta.id_planta}>
              <TableCell className="font-medium">
                <Link
                  href={`/plantas/${planta.id_planta}`}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {planta.nombre}
                </Link>
              </TableCell>
              <TableCell>
                {planta.tipos_planta?.nombre || 'N/A'}
              </TableCell>
              <TableCell>
                {planta.generos_planta?.nombre || 'N/A'}
              </TableCell>
              <TableCell>
                {getEstadoBadge(planta)}
              </TableCell>
              <TableCell>
                {planta.fecha_compra ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    {new Date(planta.fecha_compra).toLocaleDateString('es-ES')}
                  </div>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                {planta.floracion ? (
                  <Badge variant="secondary" className="gap-1">
                    <Flower className="h-3 w-3" />
                    Sí
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">No</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={deletingId === planta.id_planta}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(planta)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar planta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateTarea?.(planta)}>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Nueva tarea
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateHistoria?.(planta)}>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Nuevo registro médico
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
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
          ))}
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
