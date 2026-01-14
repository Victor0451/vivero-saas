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
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { deleteSubgenero } from '@/app/actions/subgeneros'
import { showToast } from '@/lib/toast'
import type { SubgeneroConGenero } from '@/types'
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

interface SubgenerosTableProps {
    subgeneros: SubgeneroConGenero[]
    loading: boolean
    error: string | null
    onEdit: (subgenero: SubgeneroConGenero) => void
    onRefresh: () => void
}

export function SubgenerosTable({
    subgeneros,
    loading,
    error,
    onEdit,
    onRefresh,
}: SubgenerosTableProps) {
    const [deleting, setDeleting] = useState<number | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [subgeneroToDelete, setSubgeneroToDelete] = useState<SubgeneroConGenero | null>(null)

    const handleDeleteClick = (subgenero: SubgeneroConGenero) => {
        setSubgeneroToDelete(subgenero)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!subgeneroToDelete) return

        setDeleting(subgeneroToDelete.id_subgenero)
        try {
            const result = await deleteSubgenero(subgeneroToDelete.id_subgenero)
            if (result.success) {
                showToast.success('Subgénero eliminado correctamente')
                onRefresh()
            } else {
                showToast.error(result.error || 'Error al eliminar subgénero')
            }
        } catch (error) {
            console.error('Error deleting subgenero:', error)
            showToast.error('Error al eliminar subgénero')
        } finally {
            setDeleting(null)
            setDeleteDialogOpen(false)
            setSubgeneroToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={onRefresh} className="mt-4">
                    Reintentar
                </Button>
            </div>
        )
    }

    if (subgeneros.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>No hay subgéneros registrados</p>
                <p className="text-sm mt-2">Crea tu primer subgénero usando el botón de arriba</p>
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Género Padre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subgeneros.map((subgenero) => (
                            <TableRow key={subgenero.id_subgenero}>
                                <TableCell className="font-medium">{subgenero.nombre}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {subgenero.generos_planta?.nombre || 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-md truncate">
                                    {subgenero.descripcion || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onEdit(subgenero)}
                                            disabled={deleting === subgenero.id_subgenero}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(subgenero)}
                                            disabled={deleting === subgenero.id_subgenero}
                                        >
                                            {deleting === subgenero.id_subgenero ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar subgénero?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar el subgénero &ldquo;{subgeneroToDelete?.nombre}&rdquo;?
                            Las plantas asociadas no se eliminarán, solo perderán la referencia al subgénero.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
