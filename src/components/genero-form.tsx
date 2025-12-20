'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { GeneroPlanta } from '@/types'
import { createGenero, updateGenero } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'

const generoSchema = z.object({
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .trim(),
  descripcion: z.string()
    .max(255, 'La descripción no puede tener más de 255 caracteres')
    .optional(),
})

type GeneroFormData = z.infer<typeof generoSchema>

interface GeneroFormProps {
  genero?: GeneroPlanta | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function GeneroForm({ genero, onSuccess, onCancel }: GeneroFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GeneroFormData>({
    resolver: zodResolver(generoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
  })

  const isEditing = !!genero

  useEffect(() => {
    if (genero) {
      reset({
        nombre: genero.nombre,
        descripcion: genero.descripcion || '',
      })
    } else {
      reset({
        nombre: '',
        descripcion: '',
      })
    }
  }, [genero, reset])

  const onSubmit = async (data: GeneroFormData) => {
    setLoading(true)

    try {
      const loadingToast = showToast.loading(
        isEditing ? 'Actualizando género...' : 'Creando género...'
      )

      const result = isEditing
        ? await updateGenero(genero!.id_genero, data)
        : await createGenero(data)

      showToast.dismiss(loadingToast)

      if (result.success) {
        showToast.success(result.message)
        onSuccess?.()
      } else {
        showToast.error(result.message)
      }
    } catch (error) {
      console.error('Error submitting genero:', error)
      showToast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el género`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nombre">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nombre"
          {...register('nombre')}
          placeholder="Ej: Suculentas, Cactus, Orquídeas..."
          disabled={loading}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          {...register('descripcion')}
          placeholder="Descripción opcional del género..."
          rows={3}
          disabled={loading}
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Actualizar Género' : 'Crear Género'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
