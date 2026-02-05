'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/toast'
import { uploadFotoPlanta } from '@/app/actions/fotos'
import { Loader2, X, Image as ImageIcon, Plus } from 'lucide-react'
import type { FotoPlanta } from '@/types'
import { cn } from '@/lib/utils'

interface PlantaFotosUploadProps {
    plantId: number
    onUploadComplete?: (newPhotos: FotoPlanta[]) => void
}

export function PlantaFotosUpload({ plantId, onUploadComplete }: PlantaFotosUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [photos, setPhotos] = useState<FotoPlanta[]>([])

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files)
            setUploading(true)
            const loadingToast = showToast.loading(`Subiendo ${files.length} fotos...`)

            const newUploadedPhotos: FotoPlanta[] = []
            let successCount = 0

            try {
                const uploadPromises = files.map(async (file) => {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('es_principal', 'false')
                    // Add default note for context
                    formData.append('notas', 'Adjunto desde historial clínico')

                    const result = await uploadFotoPlanta(plantId, formData)

                    if (result.success && result.data) {
                        return result.data
                    }
                    return null
                })

                const results = await Promise.all(uploadPromises)

                results.forEach(photo => {
                    if (photo) {
                        newUploadedPhotos.push(photo)
                        successCount++
                    }
                })

                if (successCount > 0) {
                    setPhotos(prev => [...prev, ...newUploadedPhotos])
                    if (onUploadComplete) {
                        onUploadComplete(newUploadedPhotos)
                    }
                    showToast.success(`${successCount} fotos subidas correctamente`)
                } else {
                    showToast.error('No se pudieron subir las fotos')
                }

            } catch (err) {
                console.error('Error uploading photos:', err)
                showToast.error('Error al subir las fotos')
            } finally {
                showToast.dismiss(loadingToast)
                setUploading(false)
                // Reset input
                e.target.value = ''
            }
        }
    }, [plantId, onUploadComplete])

    const handleRemovePreview = (idFoto: number) => {
        setPhotos(prev => prev.filter(p => p.id_foto !== idFoto))
        // Note: We are not deleting from server here to avoid accidental data loss 
        // if the user cancels the form. The photos remain "orphaned" or linked 
        // but simpler for now. A robust solution would delete them if not linked.
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photos.map((photo) => (
                    <div key={photo.id_foto} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                        <img src={photo.url} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => handleRemovePreview(photo.id_foto)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                <div className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25 transition-colors flex flex-col items-center justify-center cursor-pointer">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground font-medium">Agregar</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
