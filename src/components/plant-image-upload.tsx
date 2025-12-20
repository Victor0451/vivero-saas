'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { showToast } from '@/lib/toast'
import { uploadPlantImage, deletePlantImage, validateImageFile } from '@/lib/supabase/storage'
import Image from 'next/image'

interface PlantImageUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  tenantId: string
  plantId?: number
  disabled?: boolean
}

export function PlantImageUpload({
  value,
  onChange,
  tenantId,
  plantId,
  disabled = false
}: PlantImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value)
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Limpiar object URLs cuando cambie el value
  useEffect(() => {
    if (objectUrl && value !== objectUrl) {
      URL.revokeObjectURL(objectUrl)
      setObjectUrl(undefined)
      setPreviewUrl(value)
    } else if (!objectUrl) {
      setPreviewUrl(value)
    }
  }, [value, objectUrl])

  // Limpiar object URL al desmontar
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  const handleFileSelect = useCallback(async (file: File) => {
    // Validar archivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      showToast.error(validation.error!)
      return
    }

    // Crear preview inmediato
    const newObjectUrl = URL.createObjectURL(file)
    setObjectUrl(newObjectUrl)
    setPreviewUrl(newObjectUrl)

    setUploading(true)
    const loadingToast = showToast.loading('Subiendo imagen...')

    try {
      const result = await uploadPlantImage(file, tenantId, plantId)

      showToast.dismiss(loadingToast)

      if (result.success && result.url) {
        // Limpiar el object URL temporal y usar la URL real
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
          setObjectUrl(undefined)
        }
        setPreviewUrl(result.url)
        onChange(result.url)
        showToast.success('Imagen subida correctamente')
      } else {
        // Si falló el upload, revertir al estado anterior
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
          setObjectUrl(undefined)
        }
        setPreviewUrl(value)
        showToast.error(result.error || 'Error al subir la imagen')
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      // Revertir al estado anterior en caso de error
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        setObjectUrl(undefined)
      }
      setPreviewUrl(value)
      showToast.error('Error inesperado al subir la imagen')
    } finally {
      setUploading(false)
    }
  }, [tenantId, plantId, onChange, value, objectUrl])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleRemoveImage = useCallback(async () => {
    if (!previewUrl) return

    const loadingToast = showToast.loading('Eliminando imagen...')

    try {
      const result = await deletePlantImage(previewUrl)

      showToast.dismiss(loadingToast)

      if (result.success) {
        setPreviewUrl(undefined)
        onChange(undefined)
        showToast.success('Imagen eliminada correctamente')
      } else {
        showToast.error(result.error || 'Error al eliminar la imagen')
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      showToast.error('Error inesperado al eliminar la imagen')
    }
  }, [previewUrl, onChange])

  const handleReplaceImage = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-4">
      <Label htmlFor="plant-image">Imagen de la planta</Label>

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors
          ${uploading || disabled
            ? 'border-muted-foreground/25 bg-muted/25 cursor-not-allowed'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25 cursor-pointer'
          }
        `}
        onDrop={disabled ? undefined : handleDrop}
        onDragOver={disabled ? undefined : handleDragOver}
        onClick={disabled ? undefined : () => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          disabled={uploading || disabled}
          className="hidden"
        />

        {uploading ? (
          <div className="text-center">
            <Skeleton className="w-12 h-12 mx-auto mb-4 rounded" />
            <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-4">
            <div className="relative mx-auto w-32 h-32">
              <Image
                src={previewUrl}
                alt="Vista previa de la planta"
                fill
                className="object-cover rounded-lg"
                sizes="128px"
              />
            </div>

            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReplaceImage()
                }}
                disabled={disabled}
              >
                <Upload className="w-4 h-4 mr-2" />
                Reemplazar
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveImage()
                }}
                disabled={disabled}
              >
                <X className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG o WebP • Máximo 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
