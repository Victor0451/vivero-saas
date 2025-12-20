'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Tarea, Planta } from '@/types'
import { createTarea, updateTarea, getPlantas } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'

const tareaSchema = z.object({
  titulo: z.string()
    .min(1, 'El título es requerido')
    .max(100, 'El título no puede tener más de 100 caracteres')
    .trim(),
  descripcion: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  fecha_programada: z.string()
    .min(1, 'La fecha programada es requerida')
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'La fecha programada no puede ser anterior a hoy'),
  id_planta: z.number().optional(),
})

type TareaFormData = z.infer<typeof tareaSchema>

interface TareaFormProps {
  tarea?: Tarea | null
  defaultPlantaId?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function TareaForm({ tarea, defaultPlantaId, onSuccess, onCancel }: TareaFormProps) {
  const [loading, setLoading] = useState(false)
  const [plantas, setPlantas] = useState<Planta[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TareaFormData>({
    resolver: zodResolver(tareaSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      fecha_programada: format(new Date(), 'yyyy-MM-dd'),
      id_planta: undefined,
    },
  })

  const isEditing = !!tarea

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plantasData] = await Promise.all([
          getPlantas()
        ])
        setPlantas(plantasData)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    if (tarea) {
      reset({
        titulo: tarea.titulo,
        descripcion: tarea.descripcion || '',
        fecha_programada: tarea.fecha_programada,
        id_planta: tarea.id_planta || undefined,
      })
    } else {
      reset({
        titulo: '',
        descripcion: '',
        fecha_programada: format(new Date(), 'yyyy-MM-dd'),
        id_planta: defaultPlantaId || undefined,
      })
    }
  }, [tarea, defaultPlantaId, reset])

  const onSubmit = async (data: TareaFormData) => {
    setLoading(true)

    try {
      const loadingToast = showToast.loading(
        isEditing ? 'Actualizando tarea...' : 'Creando tarea...'
      )

      const result = isEditing
        ? await updateTarea(tarea!.id_tarea, data)
        : await createTarea(data)

      showToast.dismiss(loadingToast)

      if (result.success) {
        showToast.success(result.message)
        onSuccess?.()
      } else {
        showToast.error(result.message)
      }
    } catch (error) {
      console.error('Error submitting tarea:', error)
      showToast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la tarea`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="titulo">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="titulo"
          {...register('titulo')}
          placeholder="Ej: Regar plantas de interior"
          disabled={loading}
        />
        {errors.titulo && (
          <p className="text-sm text-destructive">{errors.titulo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          {...register('descripcion')}
          placeholder="Describe la tarea a realizar..."
          rows={3}
          disabled={loading}
        />
        {errors.descripcion && (
          <p className="text-sm text-destructive">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha_programada">
          Fecha programada <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fecha_programada"
          type="date"
          {...register('fecha_programada')}
          disabled={loading}
        />
        {errors.fecha_programada && (
          <p className="text-sm text-destructive">{errors.fecha_programada.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Planta relacionada</Label>
        {defaultPlantaId ? (
          // Mostrar planta preseleccionada como campo de solo lectura
          <div className="p-3 bg-muted rounded-md border">
            <span className="text-sm font-medium">
              {plantas.find(p => p.id_planta === defaultPlantaId)?.nombre || `Planta ID: ${defaultPlantaId}`}
            </span>
          </div>
        ) : (
          // Mostrar selector completo cuando no hay planta preseleccionada
          <Select
            value={watch('id_planta')?.toString() || 'none'}
            onValueChange={(value) => setValue('id_planta', value === 'none' ? undefined : parseInt(value))}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar planta (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin planta específica</SelectItem>
              {plantas.map((planta) => (
                <SelectItem key={planta.id_planta} value={planta.id_planta.toString()}>
                  {planta.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.id_planta && !defaultPlantaId && (
          <p className="text-sm text-destructive">{errors.id_planta.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Actualizar Tarea' : 'Crear Tarea'}
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
