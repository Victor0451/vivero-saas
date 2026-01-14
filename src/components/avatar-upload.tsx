'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { showToast } from '@/lib/toast'

interface AvatarUploadProps {
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
  currentAvatarUrl?: string
}

export function AvatarUpload({ onUpload, isUploading, currentAvatarUrl }: AvatarUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((file: File) => {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showToast.error('Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP.')
      return
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      showToast.error('El archivo es demasiado grande. Máximo 5MB.')
      return
    }

    setSelectedFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile)
      // Limpiar preview después del upload
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayUrl = previewUrl || currentAvatarUrl

  return (
    <div className="space-y-4">
      {/* Preview Area */}
      {displayUrl && (
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={displayUrl} alt="Preview" />
            <AvatarFallback>
              <Camera className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          {previewUrl && selectedFile && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isUploading && "pointer-events-none opacity-50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Arrastra y suelta tu foto aquí, o{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  disabled={isUploading}
                >
                  selecciona un archivo
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG o WebP hasta 5MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
            data-testid="avatar-file-input"
          />
        </div>
      )}

      {/* Action Buttons */}
      {previewUrl && selectedFile && (
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            size="sm"
          >
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Subiendo...' : 'Subir Avatar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
            size="sm"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• La imagen se convertirá automáticamente a formato WebP para optimización</p>
        <p>• Se redimensionará manteniendo la proporción (máximo 400x400px)</p>
        <p>• Se almacenará de forma privada en Supabase Storage</p>
      </div>
    </div>
  )
}
