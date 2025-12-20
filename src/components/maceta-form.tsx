'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { Maceta } from '@/types'
import { createMaceta, updateMaceta } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'

const macetaSchema = z.object({
  tipo: z.string()
    .min(1, 'El tipo es requerido')
    .max(50, 'El tipo no puede tener más de 50 caracteres')
    .trim(),
  material: z.string()
    .max(50, 'El material no puede tener más de 50 caracteres')
    .optional(),
  diametro_cm: z.number()
    .min(1, 'El diámetro debe ser mayor a 0')
    .max(500, 'El diámetro no puede ser mayor a 500 cm')
    .optional(),
  altura_cm: z.number()
    .min(1, 'La altura debe ser mayor a 0')
    .max(300, 'La altura no puede ser mayor a 300 cm')
    .optional(),
  volumen_lts: z.number()
    .min(0.1, 'El volumen debe ser mayor a 0')
    .max(1000, 'El volumen no puede ser mayor a 1000 litros')
    .optional(),
})

type MacetaFormData = z.infer<typeof macetaSchema>

interface MacetaFormProps {
  maceta?: Maceta | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function MacetaForm({ maceta, onSuccess, onCancel }: MacetaFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<MacetaFormData>({
    resolver: zodResolver(macetaSchema),
    defaultValues: {
      tipo: '',
      material: '',
      diametro_cm: undefined,
      altura_cm: undefined,
      volumen_lts: undefined,
    },
  })

  const isEditing = !!maceta

  useEffect(() => {
    if (maceta) {
      reset({
        tipo: maceta.tipo,
        material: maceta.material || '',
        diametro_cm: maceta.diametro_cm || undefined,
        altura_cm: maceta.altura_cm || undefined,
        volumen_lts: maceta.volumen_lts || undefined,
      })
    } else {
      reset({
        tipo: '',
        material: '',
        diametro_cm: undefined,
        altura_cm: undefined,
        volumen_lts: undefined,
      })
    }
  }, [maceta, reset])

  const onSubmit = async (data: MacetaFormData) => {
    setLoading(true)

    try {
      const loadingToast = showToast.loading(
        isEditing ? 'Actualizando maceta...' : 'Creando maceta...'
      )

      const result = isEditing
        ? await updateMaceta(maceta!.id_maceta, data)
        : await createMaceta(data)

      showToast.dismiss(loadingToast)

      if (result.success) {
        showToast.success(result.message)
        onSuccess?.()
      } else {
        showToast.error(result.message)
      }
    } catch (error) {
      console.error('Error submitting maceta:', error)
      showToast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la maceta`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo">
            Tipo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="tipo"
            {...register('tipo')}
            placeholder="Ej: Redonda, Cuadrada, Rectangular..."
            disabled={loading}
          />
          {errors.tipo && (
            <p className="text-sm text-destructive">{errors.tipo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            {...register('material')}
            placeholder="Ej: Plástico, Cerámica, Barro..."
            disabled={loading}
          />
          {errors.material && (
            <p className="text-sm text-destructive">{errors.material.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="diametro_cm">Diámetro (cm)</Label>
          <Input
            id="diametro_cm"
            type="number"
            step="0.1"
            {...register('diametro_cm', { valueAsNumber: true })}
            placeholder="Ej: 25.5"
            disabled={loading}
          />
          {errors.diametro_cm && (
            <p className="text-sm text-destructive">{errors.diametro_cm.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="altura_cm">Altura (cm)</Label>
          <Input
            id="altura_cm"
            type="number"
            step="0.1"
            {...register('altura_cm', { valueAsNumber: true })}
            placeholder="Ej: 20.0"
            disabled={loading}
          />
          {errors.altura_cm && (
            <p className="text-sm text-destructive">{errors.altura_cm.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="volumen_lts">Volumen (L)</Label>
          <Input
            id="volumen_lts"
            type="number"
            step="0.1"
            {...register('volumen_lts', { valueAsNumber: true })}
            placeholder="Ej: 5.0"
            disabled={loading}
          />
          {errors.volumen_lts && (
            <p className="text-sm text-destructive">{errors.volumen_lts.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Actualizar Maceta' : 'Crear Maceta'}
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
