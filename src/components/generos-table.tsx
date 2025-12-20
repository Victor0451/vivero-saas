'use client'

import { useState } from 'react'
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
import { MoreHorizontal, Pencil, Trash2, Sprout } from 'lucide-react'
import { showToast } from '@/lib/toast'
import type { GeneroPlanta } from '@/types'
import { deleteGenero } from '../app/actions/plantas'

interface GenerosTableProps {
  generos: GeneroPlanta[]
  loading?: boolean
  error?: string | null
  onEdit?: (genero: GeneroPlanta) => void
  onRefresh?: () => void
}

export function GenerosTable({ generos, loading, error, onEdit, onRefresh }: GenerosTableProps) {
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
      const result = await deleteGenero(confirmDelete.id)
      if (result.success) {
        onRefresh?.()
        showToast.success('Género eliminado correctamente')
      } else {
        showToast.error(result.message || 'Error al eliminar el género')
      }
    } catch (error) {
      console.error('Error deleting genero:', error)
      showToast.error('Error al eliminar el género')
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
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
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
          <h3 className="text-lg font-semibold mb-2">Error al cargar géneros</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={onRefresh} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (generos.length === 0) {
    return (
      <EmptyState
        icon={<Sprout className="h-12 w-12 text-muted-foreground" />}
        title="No hay géneros registrados"
        description="Comienza creando los géneros de plantas para tu vivero."
      />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generos.map((genero) => (
            <TableRow key={genero.id_genero}>
              <TableCell className="font-medium">
                {genero.nombre}
              </TableCell>
              <TableCell className="max-w-md">
                <span className="text-sm text-muted-foreground">
                  {genero.descripcion || 'Sin descripción'}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      disabled={deletingId === genero.id_genero}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(genero)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteClick(genero.id_genero, genero.nombre)}
                      disabled={deletingId === genero.id_genero}
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
        title="Eliminar Género"
        description={`¿Estás seguro de que quieres eliminar el género "${confirmDelete.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  )
}
