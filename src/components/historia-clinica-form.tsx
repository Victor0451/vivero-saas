'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import type { HistoriaClinica } from '@/types'
import { createHistoriaClinica, updateHistoriaClinica } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'

const historiaClinicaSchema = z.object({
  id_planta: z.number().min(1, 'La planta es requerida'),
  fecha: z.string()
    .min(1, 'La fecha es requerida')
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // Fin del día de hoy
      return selectedDate <= today
    }, 'La fecha no puede ser futura'),
  descripcion: z.string()
    .min(1, 'La descripción es requerida')
    .max(1000, 'La descripción no puede tener más de 1000 caracteres')
    .trim(),
  tratamiento: z.string()
    .max(500, 'El tratamiento no puede tener más de 500 caracteres')
    .optional(),
  estuvo_enferma: z.boolean(),
})

type HistoriaClinicaFormData = z.infer<typeof historiaClinicaSchema>

interface HistoriaClinicaFormProps {
  historia?: HistoriaClinica | null
  idPlanta: number
  plantas?: Array<{ id_planta: number; nombre: string }>
  allowPlantaSelection?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export function HistoriaClinicaForm({
  historia,
  idPlanta,
  plantas = [],
  allowPlantaSelection = false,
  onSuccess,
  onCancel
}: HistoriaClinicaFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<HistoriaClinicaFormData>({
    resolver: zodResolver(historiaClinicaSchema),
    defaultValues: {
      id_planta: idPlanta,
      fecha: format(new Date(), 'yyyy-MM-dd'),
      descripcion: '',
      tratamiento: '',
      estuvo_enferma: false,
    },
  })

  const isEditing = !!historia

  useEffect(() => {
    if (historia) {
      reset({
        id_planta: historia.id_planta,
        fecha: historia.fecha,
        descripcion: historia.descripcion,
        tratamiento: historia.tratamiento || '',
        estuvo_enferma: historia.estuvo_enferma,
      })
    } else {
      reset({
        id_planta: allowPlantaSelection ? (plantas.length > 0 ? plantas[0].id_planta : 0) : idPlanta,
        fecha: format(new Date(), 'yyyy-MM-dd'),
        descripcion: '',
        tratamiento: '',
        estuvo_enferma: false,
      })
    }
  }, [historia, idPlanta, plantas, allowPlantaSelection, reset])

  const onSubmit = async (data: HistoriaClinicaFormData) => {
    setLoading(true)

    try {
      const loadingToast = showToast.loading(
        isEditing ? 'Actualizando registro...' : 'Creando registro...'
      )

      const result = isEditing
        ? await updateHistoriaClinica(historia!.id_historia, data)
        : await createHistoriaClinica(data)

      showToast.dismiss(loadingToast)

      if (result.success) {
        showToast.success(result.message)
        onSuccess?.()
      } else {
        showToast.error(result.message)
      }
    } catch (error) {
      console.error('Error submitting historia clinica:', error)
      showToast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} el registro`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fecha">
          Fecha <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fecha"
          type="date"
          {...register('fecha')}
          disabled={loading}
        />
        {errors.fecha && (
          <p className="text-sm text-destructive">{errors.fecha.message}</p>
        )}
      </div>

      {allowPlantaSelection && plantas.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="id_planta">
            Planta <span className="text-destructive">*</span>
          </Label>
          <Select
            value={watch('id_planta')?.toString() || ''}
            onValueChange={(value) => setValue('id_planta', parseInt(value))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar planta" />
            </SelectTrigger>
            <SelectContent>
              {plantas.map((planta) => (
                <SelectItem key={planta.id_planta} value={planta.id_planta.toString()}>
                  {planta.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.id_planta && (
            <p className="text-sm text-destructive">{errors.id_planta.message}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="descripcion">
          Descripción <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="descripcion"
          {...register('descripcion')}
          placeholder="Describe el estado de salud de la planta, síntomas, observaciones..."
          rows={4}
          disabled={loading}
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tratamiento">Tratamiento aplicado</Label>
        <Textarea
          id="tratamiento"
          {...register('tratamiento')}
          placeholder="Describe el tratamiento aplicado (opcional)..."
          rows={3}
          disabled={loading}
        />
        {errors.tratamiento && (
          <p className="text-sm text-destructive">{errors.tratamiento.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="estuvo_enferma"
          checked={watch('estuvo_enferma')}
          onCheckedChange={(checked) => setValue('estuvo_enferma', checked)}
          disabled={loading}
        />
        <Label htmlFor="estuvo_enferma">
          ¿La planta estuvo enferma en esta fecha?
        </Label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Actualizar Registro' : 'Crear Registro'}
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
