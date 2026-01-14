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
import { Loader2, Package, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Tarea, Planta, ItemInventarioConDetalles } from '@/types'
import { createTarea, updateTarea, getPlantas } from '@/app/actions/plantas'
import { getItems } from '@/app/actions/inventario'
import { registrarConsumoTarea, type ConsumoMaterial } from '@/app/actions/inventario-tareas'
import { showToast } from '@/lib/toast'
import { Checkbox } from '@/components/ui/checkbox'

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
  const [itemsInventario, setItemsInventario] = useState<ItemInventarioConDetalles[]>([])
  const [showMateriales, setShowMateriales] = useState(false)
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState<Array<{
    id: string
    id_item: string
    cantidad: string
    motivo: string
  }>>([{ id: '1', id_item: '', cantidad: '', motivo: '' }])

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
        const [plantasData, itemsData] = await Promise.all([
          getPlantas(),
          getItems()
        ])
        setPlantas(plantasData)
        setItemsInventario(itemsData)
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

  const handleAddMaterial = () => {
    const newId = (Math.max(...materialesSeleccionados.map(m => parseInt(m.id))) + 1).toString()
    setMaterialesSeleccionados([
      ...materialesSeleccionados,
      { id: newId, id_item: '', cantidad: '', motivo: '' }
    ])
  }

  const handleRemoveMaterial = (id: string) => {
    if (materialesSeleccionados.length > 1) {
      setMaterialesSeleccionados(materialesSeleccionados.filter(m => m.id !== id))
    }
  }

  const handleMaterialChange = (id: string, field: keyof typeof materialesSeleccionados[0], value: string) => {
    setMaterialesSeleccionados(materialesSeleccionados.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const getItemStock = (id_item: string) => {
    const item = itemsInventario.find(i => i.id_item.toString() === id_item)
    return item?.stock_actual || 0
  }

  const getItemUnidad = (id_item: string) => {
    const item = itemsInventario.find(i => i.id_item.toString() === id_item)
    return item?.unidad_medida || ''
  }

  const onSubmit = async (data: TareaFormData) => {
    setLoading(true)

    // Validar materiales si está activo
    let consumos: ConsumoMaterial[] = []
    if (showMateriales) {
      const materialesValidos = materialesSeleccionados.filter(m => m.id_item && m.cantidad)
      if (materialesValidos.length === 0) {
        showToast.error('Si activas el registro de materiales, debes agregar al menos uno')
        setLoading(false)
        return
      }

      consumos = materialesValidos.map(m => ({
        id_item: parseInt(m.id_item),
        cantidad: parseFloat(m.cantidad),
        motivo: m.motivo || undefined
      }))
    }

    try {
      const loadingToast = showToast.loading(
        isEditing ? 'Actualizando tarea...' : 'Creando tarea...'
      )

      const result = isEditing
        ? await updateTarea(tarea!.id_tarea, data)
        : await createTarea(data)

      showToast.dismiss(loadingToast)

      if (result.success) {
        // Si hay materiales para registrar
        if (showMateriales && consumos.length > 0) {
          const idTarea = isEditing ? tarea!.id_tarea : result.data?.id_tarea

          if (idTarea) {
            try {
              const materialsToast = showToast.loading('Registrando consumo de materiales...')
              await registrarConsumoTarea(idTarea, consumos)
              showToast.dismiss(materialsToast)
              showToast.success('Materiales registrados correctamente')
            } catch (matError) {
              console.error('Error registrando materiales:', matError)
              showToast.error('Tarea guardada, pero hubo un error al registrar materiales')
            }
          }
        }

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

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="registrar_materiales"
            checked={showMateriales}
            onCheckedChange={(checked) => {
              setShowMateriales(!!checked)
              if (checked && materialesSeleccionados.length === 0) {
                handleAddMaterial()
              }
            }}
            disabled={loading}
          />
          <Label htmlFor="registrar_materiales" className="font-medium">
            Registrar consumo de materiales
          </Label>
        </div>

        {showMateriales && (
          <div className="space-y-3 pl-6 border-l-2 border-muted ml-1">
            {materialesSeleccionados.map((item, index) => (
              <div key={item.id} className="grid gap-3 p-3 bg-muted/40 rounded-lg relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {materialesSeleccionados.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMaterial(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                  <div className="space-y-1">
                    <Label className="text-xs">Material / Item</Label>
                    <Select
                      value={item.id_item}
                      onValueChange={(value) => handleMaterialChange(item.id, 'id_item', value)}
                      disabled={loading}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Seleccionar item..." />
                      </SelectTrigger>
                      <SelectContent>
                        {itemsInventario.map((invItem) => (
                          <SelectItem key={invItem.id_item} value={invItem.id_item.toString()}>
                            <div className="flex justify-between items-center w-full gap-2">
                              <span>{invItem.nombre}</span>
                              <span className={`text-xs ${invItem.stock_actual <= 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                (Stock: {invItem.stock_actual} {invItem.unidad_medida})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Cantidad</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-8"
                        placeholder="0.00"
                        value={item.cantidad}
                        onChange={(e) => handleMaterialChange(item.id, 'cantidad', e.target.value)}
                        disabled={loading}
                      />
                      <span className="text-xs text-muted-foreground w-12 truncate">
                        {item.id_item ? getItemUnidad(item.id_item) : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Motivo / Notas (Opcional)</Label>
                  <Input
                    className="h-8"
                    placeholder="Ej: Fertilizante inicial"
                    value={item.motivo}
                    onChange={(e) => handleMaterialChange(item.id, 'motivo', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMaterial}
              disabled={loading}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar otro material
            </Button>
          </div>
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
