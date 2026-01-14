'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    .min(0.1, 'El diámetro debe ser mayor a 0')
    .max(5000, 'El diámetro es demasiado grande')
    .optional(),
  diametro_unidad: z.string().optional(),
  altura_cm: z.number()
    .min(0.1, 'La altura debe ser mayor a 0')
    .max(3000, 'La altura es demasiado grande')
    .optional(),
  altura_unidad: z.string().optional(),
  volumen_lts: z.number()
    .min(0.01, 'El volumen debe ser mayor a 0')
    .max(10000, 'El volumen es demasiado grande')
    .optional(),
  volumen_unidad: z.string().optional(),
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
    watch,
    reset,
  } = useForm<MacetaFormData>({
    resolver: zodResolver(macetaSchema),
    defaultValues: {
      tipo: '',
      material: '',
      diametro_cm: undefined,
      diametro_unidad: 'cm',
      altura_cm: undefined,
      altura_unidad: 'cm',
      volumen_lts: undefined,
      volumen_unidad: 'L',
    },
  })

  const isEditing = !!maceta

  useEffect(() => {
    if (maceta) {
      reset({
        tipo: maceta.tipo,
        material: maceta.material || '',
        diametro_cm: maceta.diametro_cm || undefined,
        diametro_unidad: maceta.diametro_unidad || 'cm',
        altura_cm: maceta.altura_cm || undefined,
        altura_unidad: maceta.altura_unidad || 'cm',
        volumen_lts: maceta.volumen_lts || undefined,
        volumen_unidad: maceta.volumen_unidad || 'L',
      })
    } else {
      reset({
        tipo: '',
        material: '',
        diametro_cm: undefined,
        diametro_unidad: 'cm',
        altura_cm: undefined,
        altura_unidad: 'cm',
        volumen_lts: undefined,
        volumen_unidad: 'L',
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
          <Select
            value={watch('material') || 'none'}
            onValueChange={(value) => setValue('material', value === 'none' ? '' : value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin especificar</SelectItem>
              <SelectItem value="Plástico">Plástico</SelectItem>
              <SelectItem value="Cerámica">Cerámica</SelectItem>
              <SelectItem value="Barro">Barro</SelectItem>
              <SelectItem value="Terracota">Terracota</SelectItem>
              <SelectItem value="Fibra de vidrio">Fibra de vidrio</SelectItem>
              <SelectItem value="Metal">Metal</SelectItem>
              <SelectItem value="Madera">Madera</SelectItem>
              <SelectItem value="Cemento">Cemento</SelectItem>
              <SelectItem value="Resina">Resina</SelectItem>
            </SelectContent>
          </Select>
          {errors.material && (
            <p className="text-sm text-destructive">{errors.material.message}</p>
          )}
        </div>
      </div>

      {/* Diámetro */}
      <div className="space-y-2">
        <Label>Diámetro</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="diametro_cm"
            type="number"
            step="0.1"
            {...register('diametro_cm', { valueAsNumber: true })}
            placeholder="Ej: 25.5"
            disabled={loading}
          />
          <Select
            value={watch('diametro_unidad')}
            onValueChange={(value) => setValue('diametro_unidad', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">Centímetros (cm)</SelectItem>
              <SelectItem value="in">Pulgadas (in)</SelectItem>
              <SelectItem value="mm">Milímetros (mm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.diametro_cm && (
          <p className="text-sm text-destructive">{errors.diametro_cm.message}</p>
        )}
      </div>

      {/* Altura */}
      <div className="space-y-2">
        <Label>Altura</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="altura_cm"
            type="number"
            step="0.1"
            {...register('altura_cm', { valueAsNumber: true })}
            placeholder="Ej: 20.0"
            disabled={loading}
          />
          <Select
            value={watch('altura_unidad')}
            onValueChange={(value) => setValue('altura_unidad', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">Centímetros (cm)</SelectItem>
              <SelectItem value="in">Pulgadas (in)</SelectItem>
              <SelectItem value="mm">Milímetros (mm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.altura_cm && (
          <p className="text-sm text-destructive">{errors.altura_cm.message}</p>
        )}
      </div>

      {/* Volumen */}
      <div className="space-y-2">
        <Label>Volumen</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="volumen_lts"
            type="number"
            step="0.01"
            {...register('volumen_lts', { valueAsNumber: true })}
            placeholder="Ej: 5.0"
            disabled={loading}
          />
          <Select
            value={watch('volumen_unidad')}
            onValueChange={(value) => setValue('volumen_unidad', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Unidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Litros (L)</SelectItem>
              <SelectItem value="ml">Mililitros (ml)</SelectItem>
              <SelectItem value="gal">Galones (gal)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.volumen_lts && (
          <p className="text-sm text-destructive">{errors.volumen_lts.message}</p>
        )}
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
