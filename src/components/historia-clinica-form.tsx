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
import { getSubgenerosByGenero } from '@/app/actions/subgeneros'
import type { HistoriaClinica, SubgeneroPlanta, Maceta } from '@/types'
import { createHistoriaClinica, updateHistoriaClinica } from '@/app/actions/historia-clinica'
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

    .max(500, 'El tratamiento no puede tener más de 500 caracteres')
    .optional(),
  tipo_evento: z.string().optional(),
  id_maceta_nueva: z.number().optional(),
  estuvo_enferma: z.boolean(),
})

type HistoriaClinicaFormData = z.infer<typeof historiaClinicaSchema>

interface HistoriaClinicaFormProps {
  historia?: HistoriaClinica | null
  idPlanta: number
  plantas?: Array<{ id_planta: number; nombre: string; id_genero: number; id_subgenero?: number | null; id_maceta?: number | null }>
  generos?: Array<{ id_genero: number; nombre: string }>
  macetas?: Maceta[]
  allowPlantaSelection?: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

export function HistoriaClinicaForm({
  historia,
  idPlanta,
  plantas = [],
  generos = [],
  macetas = [],
  allowPlantaSelection = false,
  onSuccess,
  onCancel
}: HistoriaClinicaFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedGenero, setSelectedGenero] = useState<string>('all')
  const [selectedSubgenero, setSelectedSubgenero] = useState<string>('all')
  const [subgeneros, setSubgeneros] = useState<SubgeneroPlanta[]>([])

  // Cargar subgéneros cuando cambia el género
  useEffect(() => {
    const loadSubgeneros = async () => {
      if (selectedGenero && selectedGenero !== 'all') {
        try {
          const data = await getSubgenerosByGenero(parseInt(selectedGenero))
          setSubgeneros(data)
        } catch (err) {
          console.error('Error loading subgeneros:', err)
          setSubgeneros([])
        }
      } else {
        setSubgeneros([])
      }
      setSelectedSubgenero('all')
    }
    loadSubgeneros()
  }, [selectedGenero])

  const filteredPlantas = plantas.filter(planta => {
    if (selectedGenero !== 'all' && planta.id_genero !== parseInt(selectedGenero)) return false
    if (selectedSubgenero !== 'all' && planta.id_subgenero !== parseInt(selectedSubgenero)) return false
    return true
  })

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
      tipo_evento: '',
      id_maceta_nueva: undefined,
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
        tipo_evento: historia.tipo_evento || '',
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

      setLoading(true)

      const payload = {
        ...data,
      }

      const result = isEditing
        ? await updateHistoriaClinica(historia!.id_historia, payload)
        : await createHistoriaClinica(payload)

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

  const formatMacetaLabel = (maceta: Maceta) => {
    const parts = [maceta.tipo];
    if (maceta.material) parts.push(maceta.material);

    const dims = [];
    if (maceta.diametro_cm) dims.push(`Ø${maceta.diametro_cm}cm`);
    if (maceta.altura_cm) dims.push(`H${maceta.altura_cm}cm`);
    if (dims.length > 0) parts.push(`(${dims.join(' x ')})`);

    if (maceta.volumen_lts) parts.push(`${maceta.volumen_lts}L`);

    return parts.join(' - ');
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

      {allowPlantaSelection && !isEditing && (
        <div className="space-y-4 border p-4 rounded-md bg-muted/20">
          <h4 className="text-sm font-medium">Filtrar Planta</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filtro-genero">Género</Label>
              <Select
                value={selectedGenero}
                onValueChange={setSelectedGenero}
              >
                <SelectTrigger id="filtro-genero">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {generos.map((genero) => (
                    <SelectItem key={genero.id_genero} value={genero.id_genero.toString()}>
                      {genero.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filtro-subgenero">Subgénero</Label>
              <Select
                value={selectedSubgenero}
                onValueChange={setSelectedSubgenero}
                disabled={selectedGenero === 'all'}
              >
                <SelectTrigger id="filtro-subgenero">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {subgeneros.map((sub) => (
                    <SelectItem key={sub.id_subgenero} value={sub.id_subgenero.toString()}>
                      {sub.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_planta">Seleccionar Planta ({filteredPlantas.length})</Label>
            <Select
              disabled={filteredPlantas.length === 0}
              onValueChange={(value) => setValue('id_planta', parseInt(value))}
              defaultValue={watch('id_planta')?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una planta" />
              </SelectTrigger>
              <SelectContent>
                {filteredPlantas.map((planta) => (
                  <SelectItem key={planta.id_planta} value={planta.id_planta.toString()}>
                    {planta.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredPlantas.length === 0 && (
              <p className="text-sm text-destructive">No hay plantas que coincidan con los filtros</p>
            )}
            {errors.id_planta && (
              <p className="text-sm text-destructive">{errors.id_planta.message}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="eventType">Tipo de Evento</Label>
        <Select
          value={watch('tipo_evento') || ''}
          onValueChange={(value) => setValue('tipo_evento', value)}
        >
          <SelectTrigger id="eventType">
            <SelectValue placeholder="Selecciona el tipo de evento (opcional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
            <SelectItem value="Tratamiento">Tratamiento</SelectItem>
            <SelectItem value="Riego">Riego</SelectItem>
            <SelectItem value="Fertilización">Fertilización</SelectItem>
            <SelectItem value="Poda">Poda</SelectItem>
            <SelectItem value="Transplante">Transplante</SelectItem>
            <SelectItem value="Decapitación">Decapitación</SelectItem>
            <SelectItem value="Esquejado">Esquejado</SelectItem>
            <SelectItem value="Deceso">Deceso</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>



      {watch('tipo_evento') === 'Transplante' && (
        <div className="space-y-4 border p-4 rounded-md bg-muted/20">
          <h4 className="text-sm font-medium">Detalles del Transplante</h4>

          <div className="space-y-2">
            <Label>Maceta Actual</Label>
            <div className="p-2 border rounded-md bg-background text-sm text-muted-foreground">
              {(() => {
                const selectedPlanta = plantas.find(p => p.id_planta === watch('id_planta'));
                const currentMaceta = macetas.find(m => m.id_maceta === selectedPlanta?.id_maceta);
                return currentMaceta ? formatMacetaLabel(currentMaceta) : 'Sin maceta';
              })()}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_maceta_nueva">Nueva Maceta</Label>
            <Select
              value={watch('id_maceta_nueva')?.toString() || ''}
              onValueChange={(value) => setValue('id_maceta_nueva', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la nueva maceta" />
              </SelectTrigger>
              <SelectContent>
                {macetas.map((maceta) => (
                  <SelectItem key={maceta.id_maceta} value={maceta.id_maceta.toString()}>
                    {formatMacetaLabel(maceta)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-start gap-2 pt-2">
              <div className="mt-0.5 rounded-full bg-blue-100 p-1 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-info"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <p className="text-xs text-muted-foreground">
                Los detalles del cambio de maceta se registrarán automáticamente en el campo de tratamiento.
              </p>
            </div>
          </div>
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
