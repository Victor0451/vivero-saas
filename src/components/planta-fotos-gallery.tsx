'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MoreVertical, Star, Trash2, Calendar, Maximize2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn, formatDateUTC } from '@/lib/utils'
import { deleteFotoPlanta, setFotoPrincipal } from '@/app/actions/fotos'
import { showToast } from '@/lib/toast'
import type { FotoPlanta } from '@/types'

interface PlantaFotosGalleryProps {
    fotos: FotoPlanta[]
    idPlanta: number
    onUpdate: () => void
}

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function PlantaFotosGallery({
    fotos,
    idPlanta,
    onUpdate
}: PlantaFotosGalleryProps) {
    const [selectedFoto, setSelectedFoto] = useState<FotoPlanta | null>(null)
    const [fotoToDelete, setFotoToDelete] = useState<FotoPlanta | null>(null)

    const handleSetPrincipal = async (foto: FotoPlanta) => {
        try {
            const result = await setFotoPrincipal(foto.id_foto, idPlanta)
            if (result.success) {
                showToast.success('Foto principal actualizada')
                onUpdate()
            } else {
                showToast.error(result.message)
            }
        } catch (error) {
            console.log(error)
            showToast.error('Error al actualizar foto principal')
        }
    }

    const handleDeleteClick = (foto: FotoPlanta) => {
        setFotoToDelete(foto)
    }

    const confirmDelete = async () => {
        if (!fotoToDelete) return

        try {
            const result = await deleteFotoPlanta(fotoToDelete.id_foto, fotoToDelete.storage_path)
            if (result.success) {
                showToast.success('Foto eliminada')
                onUpdate()
                if (selectedFoto?.id_foto === fotoToDelete.id_foto) {
                    setSelectedFoto(null)
                }
            } else {
                showToast.error(result.message)
            }
        } catch (error) {
            console.log(error)
            showToast.error('Error al eliminar foto')
        } finally {
            setFotoToDelete(null)
        }
    }

    if (fotos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg border-muted">
                <p className="text-muted-foreground text-sm">
                    No hay fotos registradas en la bitácora.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Timeline Scroll */}
            <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-card p-4">
                <div className="flex w-max space-x-4 p-1">
                    {fotos.map((foto) => (
                        <div
                            key={foto.id_foto}
                            className={cn(
                                "group relative aspect-[3/4] h-[200px] w-[150px] overflow-hidden rounded-lg border-2 bg-muted transition-all cursor-pointer",
                                foto.es_principal ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border",
                            )}
                        >
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="w-full h-full" onClick={() => setSelectedFoto(foto)}>
                                        <img
                                            src={foto.url}
                                            alt={`Foto del ${formatDateUTC(foto.fecha, 'P')}`}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </DialogTrigger>

                                {/* Overlay Info (Top Left) */}
                                {foto.es_principal && (
                                    <div className="absolute top-2 left-2 z-10">
                                        <Badge variant="secondary" className="bg-primary/90 text-primary-foreground hover:bg-primary/90 text-[10px] h-5 px-1.5">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            Principal
                                        </Badge>
                                    </div>
                                )}

                                {/* Actions Menu (Top Right) */}
                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm">
                                                <MoreVertical className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleSetPrincipal(foto)} disabled={foto.es_principal}>
                                                <Star className="mr-2 h-4 w-4" />
                                                <span>Hacer principal</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteClick(foto)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Eliminar</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Footer Info (Bottom) */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1 text-xs font-medium mb-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDateUTC(foto.fecha, 'd MMM yyyy')}
                                    </div>
                                    {foto.notas && (
                                        <p className="text-[10px] line-clamp-2 text-white/80 leading-tight">
                                            {foto.notas}
                                        </p>
                                    )}
                                </div>

                                {/* Lightbox Dialog Content */}
                                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none">
                                    <DialogTitle className="sr-only">Vista ampliada de foto</DialogTitle>
                                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                                        <img
                                            src={selectedFoto?.url}
                                            alt="Vista ampliada"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                            <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                                                <Calendar className="w-5 h-5" />
                                                {selectedFoto && formatDateUTC(selectedFoto.fecha, 'PPPP')}
                                            </h3>
                                            {selectedFoto?.notas && (
                                                <p className="text-white/80 max-w-2xl">
                                                    {selectedFoto.notas}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <AlertDialog open={!!fotoToDelete} onOpenChange={(open) => !open && setFotoToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro de eliminar esta foto?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La foto se eliminará permanentemente de la bitácora y del almacenamiento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
