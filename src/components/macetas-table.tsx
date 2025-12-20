'use client'

import { useState } from 'react'
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
import { MoreHorizontal, Pencil, Trash2, Box } from 'lucide-react'
import { showToast } from '@/lib/toast'
import type { Maceta } from '@/types'
import { deleteMaceta } from '../app/actions/plantas'

interface MacetasTableProps {
  macetas: Maceta[]
  loading?: boolean
  error?: string | null
  onEdit?: (maceta: Maceta) => void
  onRefresh?: () => void
}

export function MacetasTable({ macetas, loading, error, onEdit, onRefresh }: MacetasTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; nombre: string }>({
    open: false,
    id: null,
    nombre: ''
  })

  const handleDeleteClick = (id: number, nombre: string) => {
    setConfirmDelete({ open: true, id, nombre })
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return

    setDeletingId(confirmDelete.id)
    setConfirmDelete({ open: false, id: null, nombre: '' })

    try {
      const result = await deleteMaceta(confirmDelete.id)
      if (result.success) {
        onRefresh?.()
        showToast.success('Maceta eliminada correctamente')
      } else {
        showToast.error(result.message || 'Error al eliminar la maceta')
      }
    } catch (error) {
      console.error('Error deleting maceta:', error)
      showToast.error('Error al eliminar la maceta')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, id: null, nombre: '' })
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Dimensiones</TableHead>
              <TableHead>Volumen</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Error al cargar macetas</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onRefresh} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (macetas.length === 0) {
    return (
      <EmptyState
        icon={<Box className="h-12 w-12 text-muted-foreground" />}
        title="No hay macetas registradas"
        description="Comienza creando las macetas disponibles en tu vivero."
      />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Dimensiones</TableHead>
            <TableHead>Volumen</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {macetas.map((maceta) => (
            <TableRow key={maceta.id_maceta}>
              <TableCell className="font-medium">
                {maceta.tipo}
              </TableCell>
              <TableCell>
                {maceta.material ? (
                  <Badge variant="outline">{maceta.material}</Badge>
                ) : (
                  <span className="text-muted-foreground">No especificado</span>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {maceta.diametro_cm && (
                    <span>Ø{maceta.diametro_cm}cm</span>
                  )}
                  {maceta.diametro_cm && maceta.altura_cm && (
                    <span> × </span>
                  )}
                  {maceta.altura_cm && (
                    <span>{maceta.altura_cm}cm alto</span>
                  )}
                  {!maceta.diametro_cm && !maceta.altura_cm && (
                    <span className="text-muted-foreground">No especificadas</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {maceta.volumen_lts ? (
                  <span className="text-sm font-medium">
                    {maceta.volumen_lts}L
                  </span>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={deletingId === maceta.id_maceta}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(maceta)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteClick(maceta.id_maceta, maceta.tipo || 'Maceta')}
                      disabled={deletingId === maceta.id_maceta}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
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
        title="Eliminar Maceta"
        description={`¿Estás seguro de que quieres eliminar la maceta "${confirmDelete.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}
