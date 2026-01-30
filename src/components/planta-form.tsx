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
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import type { PlantaConDetalles, TipoPlantaOption, GeneroPlantaOption, SubgeneroPlantaOption, MacetaOption } from '@/types'
import { createPlanta, updatePlanta, getTiposPlanta } from '@/app/actions/plantas'
import { getMacetas } from '@/app/actions/macetas'
import { getGeneros } from '@/app/actions/generos'
import { getSubgenerosByGenero } from '../app/actions/subgeneros'
import { showToast } from '@/lib/toast'
import { PlantImageUpload } from './plant-image-upload'
import { createClient } from '@/lib/supabase/client'

const plantaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  id_tipo: z.number().min(1, 'El tipo es requerido'),
  id_genero: z.number().min(1, 'El género es requerido'),
  id_subgenero: z.number().optional(),
  id_maceta: z.number().optional(),
  fecha_compra: z.string().optional(),
  fecha_transplante: z.string().optional(),
  iluminacion: z.string().optional(),
  esta_enferma: z.boolean(),
  esta_muerta: z.boolean(),
  observaciones: z.string().optional(),
  image_url: z.string().optional(),
})

type PlantaFormData = z.infer<typeof plantaSchema>

interface PlantaFormProps {
  planta?: PlantaConDetalles | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function PlantaForm({ planta, onSuccess, onCancel }: PlantaFormProps) {
  const [loading, setLoading] = useState(false)
  const [tipos, setTipos] = useState<TipoPlantaOption[]>([])
  const [generos, setGeneros] = useState<GeneroPlantaOption[]>([])
  const [subgeneros, setSubgeneros] = useState<SubgeneroPlantaOption[]>([])
  const [macetas, setMacetas] = useState<MacetaOption[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [showGenerosMessage, setShowGenerosMessage] = useState(false)
  const [tenantId, setTenantId] = useState<string>('')

  // Función para cargar todas las opciones
  const loadOptions = React.useCallback(async () => {
    console.log('Cargando opciones del formulario...')

    try {

      // Cargar tipos, y si no hay, intentar poblar
      let tiposData: TipoPlantaOption[] = []
      try {
        tiposData = await getTiposPlanta()
        console.log('Tipos obtenidos:', tiposData?.length || 0)
      } catch (error) {
        console.error('Error obteniendo tipos:', error)
        tiposData = []
      }



      setTipos(tiposData || [])

      // Cargar macetas
      const macetasData = await getMacetas()
      setMacetas(macetasData || [])

      // Cargar géneros
      const generosData = await getGeneros()
      setGeneros(generosData || [])
      setShowGenerosMessage(!generosData || generosData.length === 0)

      console.log('Opciones cargadas exitosamente')
    } catch (error) {
      console.error('Error loading options:', error)
    } finally {
      setLoadingOptions(false)
    }
  }, [])

  const isEditing = !!planta

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlantaFormData>({
    resolver: zodResolver(plantaSchema),
    defaultValues: {
      nombre: planta?.nombre || '',
      id_tipo: planta?.id_tipo || undefined,
      id_genero: planta?.id_genero || undefined,
      id_subgenero: planta?.id_subgenero || undefined,
      id_maceta: planta?.id_maceta || undefined,
      fecha_compra: planta?.fecha_compra || '',
      fecha_transplante: planta?.fecha_transplante || '',
      iluminacion: planta?.iluminacion || '',
      esta_enferma: planta?.esta_enferma || false,
      esta_muerta: planta?.esta_muerta || false,
      observaciones: planta?.observaciones || '',
      image_url: planta?.image_url || '',
    },
  })

  const estaEnferma = watch('esta_enferma')
  const estaMuerta = watch('esta_muerta')
  const currentImageUrl = watch('image_url')
  const selectedGenero = watch('id_genero')

  // Cargar subgéneros cuando cambia el género
  useEffect(() => {
    const loadSubgeneros = async () => {
      if (selectedGenero) {
        try {
          const data = await getSubgenerosByGenero(selectedGenero)
          setSubgeneros(data)
        } catch (err) {
          console.error('Error loading subgeneros:', err)
          setSubgeneros([])
        }
      } else {
        setSubgeneros([])
        setValue('id_subgenero', undefined)
      }
    }
    loadSubgeneros()
  }, [selectedGenero, setValue])


  const recargarGeneros = async () => {
    const generosData = await getGeneros()
    setGeneros(generosData || [])
    setShowGenerosMessage(!generosData || generosData.length === 0)
  }

  const loadTenantId = React.useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData?.user) {
        console.error('Error obteniendo usuario autenticado:', authError)
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', authData.user.id)
        .single()

      if (userError || !userData) {
        console.error('Error obteniendo tenant del usuario:', userError)
        return
      }

      setTenantId(userData.id_tenant)
    } catch (error) {
      console.error('Error cargando tenant ID:', error)
    }
  }, [])

  useEffect(() => {
    const initializeForm = async () => {


      // Cargar tenant ID y opciones
      await Promise.all([
        loadTenantId(),
        loadOptions()
      ])
    }

    initializeForm()
  }, [loadOptions, loadTenantId])



  const onSubmit = async (data: PlantaFormData) => {
    const loadingToast = showToast.loading(
      isEditing ? 'Actualizando planta...' : 'Creando planta...'
    )

    setLoading(true)
    try {
      const result = isEditing && planta
        ? await updatePlanta(planta.id_planta, data)
        : await createPlanta(data)

      showToast.dismiss(loadingToast)

      if (result.success) {
        showToast.success(result.message)
        onSuccess?.()
      } else {
        showToast.error(result.message)
      }
    } catch (error) {
      showToast.dismiss(loadingToast)
      console.error('Error saving planta:', error)
      showToast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la planta`)
    } finally {
      setLoading(false)
    }
  }

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Cargando opciones...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre *</Label>
        <Input
          id="nombre"
          {...register('nombre')}
          placeholder="Nombre de la planta"
        />
        {errors.nombre && (
          <p className="text-sm text-red-500">{errors.nombre.message}</p>
        )}
      </div>

      {/* Tipo y Género */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id_tipo">Tipo *</Label>
          <Select
            value={watch('id_tipo')?.toString() || ''}
            onValueChange={(value) => setValue('id_tipo', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {tipos.map((tipo) => (
                <SelectItem key={tipo.id_tipo} value={tipo.id_tipo.toString()}>
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.id_tipo && (
            <p className="text-sm text-red-500">{errors.id_tipo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="id_genero">Género *</Label>
          <Select
            value={watch('id_genero')?.toString() || ''}
            onValueChange={(value) => {
              setValue('id_genero', parseInt(value))
              setValue('id_subgenero', undefined) // Limpiar subgénero al cambiar género
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              {generos.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No hay géneros configurados
                </div>
              ) : (
                generos.map((genero) => (
                  <SelectItem key={genero.id_genero} value={genero.id_genero.toString()}>
                    {genero.nombre}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.id_genero && (
            <p className="text-sm text-red-500">{errors.id_genero.message}</p>
          )}
          {!errors.id_genero && generos.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Clasificación principal de la planta
            </p>
          )}
          {showGenerosMessage && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>No hay géneros configurados.</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    recargarGeneros()
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Recargar géneros
                </button>

              </div>
            </div>
          )}
        </div>

        {/* Subgénero (opcional) */}
        {selectedGenero && subgeneros.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="id_subgenero">Subgénero (opcional)</Label>
              <span className="text-xs text-muted-foreground">
                {subgeneros.length} disponible{subgeneros.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Select
              value={watch('id_subgenero')?.toString() || 'none'}
              onValueChange={(value) => setValue('id_subgenero', value === 'none' ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar subgénero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin subgénero</SelectItem>
                {subgeneros.map((subgenero) => (
                  <SelectItem key={subgenero.id_subgenero} value={subgenero.id_subgenero.toString()}>
                    {subgenero.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Subcategoría específica dentro del género seleccionado
            </p>
          </div>
        )}
        {selectedGenero && subgeneros.length === 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            💡 No hay subgéneros para este género. Puedes crear uno en Catálogos → Géneros
          </div>
        )}
      </div>

      {/* Maceta */}
      <div className="space-y-2">
        <Label htmlFor="id_maceta">Maceta (opcional)</Label>
        <Select
          value={watch('id_maceta')?.toString() || 'none'}
          onValueChange={(value) => setValue('id_maceta', value === 'none' ? undefined : parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar maceta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sin maceta</SelectItem>
            {macetas.map((maceta) => (
              <SelectItem key={maceta.id_maceta} value={maceta.id_maceta.toString()}>
                {maceta.tipo}{maceta.material ? ` (${maceta.material})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha_compra">Fecha de compra</Label>
          <Input
            id="fecha_compra"
            type="date"
            {...register('fecha_compra')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fecha_transplante">Fecha de transplante</Label>
          <Input
            id="fecha_transplante"
            type="date"
            {...register('fecha_transplante')}
          />
        </div>
      </div>

      {/* Iluminación */}
      <div className="space-y-2">
        <Label htmlFor="iluminacion">Iluminación</Label>
        <Select
          value={watch('iluminacion')}
          onValueChange={(value) => setValue('iluminacion', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar iluminación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sol-directo">Sol directo</SelectItem>
            <SelectItem value="sol-indirecto">Sol indirecto</SelectItem>
            <SelectItem value="sombra">Sombra</SelectItem>
            <SelectItem value="luz-artificial">Luz artificial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estados */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="esta_enferma"
            checked={estaEnferma}
            onCheckedChange={(checked) => setValue('esta_enferma', checked)}
            disabled={estaMuerta}
          />
          <Label htmlFor="esta_enferma">Está enferma</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="esta_muerta"
            checked={estaMuerta}
            onCheckedChange={(checked) => {
              setValue('esta_muerta', checked)
              if (checked) {
                setValue('esta_enferma', false)
              }
            }}
          />
          <Label htmlFor="esta_muerta">Está muerta</Label>
        </div>
      </div>

      {/* Imagen */}
      <PlantImageUpload
        value={currentImageUrl}
        onChange={(url) => setValue('image_url', url || '')}
        tenantId={tenantId}
        plantId={isEditing ? planta?.id_planta : undefined}
        disabled={loading}
      />

      {/* Observaciones */}
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          {...register('observaciones')}
          placeholder="Observaciones adicionales..."
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Actualizar' : 'Crear'} Planta
        </Button>
      </div>
    </form>
  )
}
