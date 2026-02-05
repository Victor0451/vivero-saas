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
import { Badge } from '@/components/ui/badge'
import { Loader2, Camera, Bell, Calendar as CalendarIcon, AlertCircle, X } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { getSubgenerosByGenero } from '@/app/actions/subgeneros'
import type { HistoriaClinica, SubgeneroPlanta, Maceta } from '@/types'
import { createHistoriaClinica, updateHistoriaClinica, bulkCreateHistoriaClinica } from '@/app/actions/historia-clinica'
import { showToast } from '@/lib/toast'
import { PlantaFotosUpload } from './plant-photos-upload'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { es } from 'date-fns/locale'

const historiaClinicaSchema = z.object({
  id_planta: z.number().min(1, 'La planta es requerida'),
  fecha: z.string()
    .min(1, 'La fecha es requerida')
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return selectedDate <= today
    }, 'La fecha no puede ser futura'),
  descripcion: z.string()
    .min(1, 'La descripción es requerida')
    .max(1000, 'La descripción no puede tener más de 1000 caracteres')
    .trim(),
  tratamiento: z.string()
    .max(500, 'El tratamiento no puede tener más de 500 caracteres')
    .optional(),
  tipo_evento: z.string().optional(),
  id_maceta_nueva: z.number().optional(),
  estuvo_enferma: z.boolean(),
  severidad: z.enum(['baja', 'media', 'alta', 'critica']).optional(),
  // Campos UI
  create_reminder: z.boolean().optional(),
  reminder_date: z.date().optional(),
  reminder_title: z.string().optional(),
})

type HistoriaClinicaFormData = z.infer<typeof historiaClinicaSchema>

interface HistoriaClinicaFormProps {
  historia?: HistoriaClinica | null
  idPlanta: number
  plantas?: Array<{ id_planta: number; nombre: string; id_genero: number; id_subgenero?: number | null; id_maceta?: number | null }>
  generos?: Array<{ id_genero: number; nombre: string }>
  macetas?: Maceta[]
  allowPlantaSelection?: boolean
  plantaIds?: number[] // New Prop
  onSuccess?: () => void
  onCancel?: () => void
}

// Stable empty array to prevent useEffect loops
const emptyArray: any[] = []

export function HistoriaClinicaForm({
  historia,
  idPlanta,
  plantas = emptyArray,
  generos = emptyArray,
  macetas = emptyArray,
  allowPlantaSelection = false,
  plantaIds = emptyArray,
  onSuccess,
  onCancel
}: HistoriaClinicaFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedGenero, setSelectedGenero] = useState<string>('all')
  const [selectedSubgenero, setSelectedSubgenero] = useState<string>('all')
  const [subgeneros, setSubgeneros] = useState<SubgeneroPlanta[]>([])
  const [uploadedPhotoIds, setUploadedPhotoIds] = useState<number[]>([])

  const isBulk = plantaIds.length > 1

  // ... (useEffect for subgeneros remains same) ...

  const filteredPlantas = plantas.filter(planta => {
    // ... existing filter logic
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
      // ... existing default values
      descripcion: '',
      tratamiento: '',
      tipo_evento: '',
      id_maceta_nueva: undefined,
      estuvo_enferma: false,
      severidad: 'baja',
      create_reminder: false,
      reminder_title: 'Revisar evolución',
      reminder_date: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
  })

  const isEditing = !!historia
  const showSeverity = watch('estuvo_enferma')
  const showReminder = watch('create_reminder')

  // ... (useEffect for reminder date default remains same) ...

  useEffect(() => {
    if (historia) {
      reset({
        id_planta: historia.id_planta,
        fecha: historia.fecha,
        descripcion: historia.descripcion,
        tratamiento: historia.tratamiento || '',
        tipo_evento: historia.tipo_evento || '',
        estuvo_enferma: historia.estuvo_enferma,
        severidad: historia.severidad,
      })
    } else {
      // For bulk actions, use the first ID to satisfy Zod schema (min(1))
      const defaultIdPlanta = isBulk && plantaIds.length > 0 ? plantaIds[0] : (allowPlantaSelection ? (plantas.length > 0 ? plantas[0].id_planta : 0) : idPlanta)

      reset({
        id_planta: defaultIdPlanta,
        fecha: format(new Date(), 'yyyy-MM-dd'),
        descripcion: '',
        tratamiento: '',
        estuvo_enferma: false,
        create_reminder: false,
      })
    }
  }, [historia, idPlanta, plantas, allowPlantaSelection, reset, isBulk, plantaIds])

  const onSubmit = async (data: HistoriaClinicaFormData) => {
    setLoading(true)

    try {
      const loadingToast = showToast.loading(
        isEditing
          ? 'Actualizando registro...'
          : isBulk
            ? `Registrando eventos para ${plantaIds.length} plantas...`
            : 'Creando registro...'
      )

      // Prepare payload
      const payload: any = {
        ...data,
        selected_photo_ids: uploadedPhotoIds.length > 0 ? uploadedPhotoIds : undefined,
      }

      if (data.create_reminder && data.reminder_date && data.reminder_title) {
        payload.recordatorio = {
          fecha: format(data.reminder_date, 'yyyy-MM-dd'),
          titulo: data.reminder_title
        }
      }

      let result;
      if (isEditing) {
        result = await updateHistoriaClinica(historia!.id_historia, payload)
      } else if (isBulk) {
        // Bulk Action!
        result = await bulkCreateHistoriaClinica(plantaIds, payload)
      } else {
        result = await createHistoriaClinica(payload)
      }

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
    if (maceta.diametro_cm) parts.push(`Ø${maceta.diametro_cm}cm`);
    if (maceta.volumen_lts) parts.push(`${maceta.volumen_lts}L`);
    return parts.join(' - ');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* 1. Selección de Planta (si aplica) */}
      {allowPlantaSelection && !isEditing && (
        <div className="space-y-4 border p-4 rounded-xl bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="font-bold text-xs">1</span>
            </div>
            <h4 className="font-semibold">Seleccionar Paciente</h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Filtro Género</Label>
              <Select value={selectedGenero} onValueChange={setSelectedGenero}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {generos.map((g) => (<SelectItem key={g.id_genero} value={g.id_genero.toString()}>{g.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Filtro Subgénero</Label>
              <Select value={selectedSubgenero} onValueChange={setSelectedSubgenero} disabled={selectedGenero === 'all'}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {subgeneros.map((s) => (<SelectItem key={s.id_subgenero} value={s.id_subgenero.toString()}>{s.nombre}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Select
              disabled={filteredPlantas.length === 0}
              onValueChange={(value) => setValue('id_planta', parseInt(value))}
              value={watch('id_planta')?.toString() || ''}
            >
              <SelectTrigger className="font-medium">
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
            {errors.id_planta && <p className="text-xs text-destructive">{errors.id_planta.message}</p>}
          </div>
        </div>
      )}

      {/* 2. Detalles del Evento */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Fecha del Suceso</Label>
          <Input type="date" {...register('fecha')} disabled={loading} />
          {errors.fecha && <p className="text-xs text-destructive">{errors.fecha.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Tipo de Evento</Label>
          <Select value={watch('tipo_evento') || ''} onValueChange={(value) => setValue('tipo_evento', value)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar tipo de evento..." /></SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="Consulta General">Consulta / Checkup General</SelectItem>

              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 mt-1">Patología y Diagnóstico</div>
              <SelectItem value="Diagnóstico de Enfermedad">Diagnóstico de Enfermedad</SelectItem>
              <SelectItem value="Detección de Plagas">Detección de Plagas</SelectItem>
              <SelectItem value="Deficiencia Nutricional">Deficiencia Nutricional</SelectItem>

              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 mt-1">Intervenciones (Cirugía)</div>
              <SelectItem value="Poda Sanitaria">Poda Sanitaria</SelectItem>
              <SelectItem value="Poda de Formación">Poda de Formación</SelectItem>
              <SelectItem value="Decapitación">Decapitación / Esquejado</SelectItem>
              <SelectItem value="Limpieza de Raíces">Limpieza de Raíces</SelectItem>

              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 mt-1">Tratamiento y Terapia</div>
              <SelectItem value="Aplicación Fungicida">Aplicación Fungicida</SelectItem>
              <SelectItem value="Aplicación Insecticida">Aplicación Insecticida</SelectItem>
              <SelectItem value="Limpieza Foliar">Limpieza Foliar</SelectItem>
              <SelectItem value="Riego Terapéutico">Riego Terapéutico</SelectItem>

              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 mt-1">Sustrato y Nutrición</div>
              <SelectItem value="Transplante">Transplante / Cambio de Maceta</SelectItem>
              <SelectItem value="Fertilización">Fertilización / Abonado</SelectItem>
              <SelectItem value="Cambio de Sustrato">Cambio de Sustrato Parcial</SelectItem>

              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 mt-1">Fenología y Ciclo</div>
              <SelectItem value="Inicio Floración">Inicio de Floración</SelectItem>
              <SelectItem value="Polinización">Polinización</SelectItem>
              <SelectItem value="Recolección Semillas">Recolección de Semillas</SelectItem>
              <SelectItem value="Entrada en Dormancia">Entrada en Dormancia</SelectItem>

              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 mt-1">Otros</div>
              <SelectItem value="Accidente Físico">Accidente / Daño Físico</SelectItem>
              <SelectItem value="Deceso">Defunción de Planta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selector de Transplante */}
      {watch('tipo_evento') === 'Transplante' && (
        <div className="space-y-4 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-lg">
          <div className="flex items-center gap-2 text-blue-600 font-medium">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            Cambio de Maceta
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nueva Maceta</Label>
            <Select value={watch('id_maceta_nueva')?.toString() || ''} onValueChange={(value) => setValue('id_maceta_nueva', parseInt(value))}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Selecciona la nueva maceta" /></SelectTrigger>
              <SelectContent>
                {macetas.map((maceta) => (
                  <SelectItem key={maceta.id_maceta} value={maceta.id_maceta.toString()}>
                    {formatMacetaLabel(maceta)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 3. Evidencia Visual (FOTOS) */}
      {!isEditing && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-600" />
            Evidencia Visual
            <Badge variant="outline" className="text-[10px] font-normal">Opcional</Badge>
          </Label>
          <div className="border border-dashed rounded-xl p-4 bg-muted/10">
            <PlantaFotosUpload
              plantId={watch('id_planta')}
              onUploadComplete={(newPhotos: any[]) => {
                setUploadedPhotoIds(prev => [...prev, ...newPhotos.map(p => p.id_foto)])
                showToast.success(`${newPhotos.length} fotos adjuntadas al reporte`)
              }}
            />
            {uploadedPhotoIds.length > 0 && (
              <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">✓</div>
                {uploadedPhotoIds.length} fotos listas para vincular
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Descripción Clínica</Label>
        <Textarea
          {...register('descripcion')}
          placeholder="Describe síntomas, observaciones o detalles del procedimiento..."
          className="min-h-[100px]"
        />
        {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Tratamiento / Receta</Label>
        <Textarea
          {...register('tratamiento')}
          placeholder="Productos aplicados, dosis, o pasos a seguir..."
          className="min-h-[80px]"
        />
      </div>

      {/* 4. Estado de Salud y Severidad */}
      <div className="space-y-4 p-4 border rounded-xl bg-muted/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className={cn("w-5 h-5", showSeverity ? "text-orange-500" : "text-muted-foreground")} />
            <Label htmlFor="estuvo_enferma" className="cursor-pointer">¿Presenta enfermedad?</Label>
          </div>
          <Switch
            id="estuvo_enferma"
            checked={watch('estuvo_enferma')}
            onCheckedChange={(checked) => setValue('estuvo_enferma', checked)}
          />
        </div>

        {showSeverity && (
          <div className="pt-2 animate-in slide-in-from-top-2">
            <Label className="text-xs mb-2 block text-orange-600 font-semibold">Nivel de Severidad</Label>
            <div className="grid grid-cols-4 gap-2">
              {['baja', 'media', 'alta', 'critica'].map((level) => (
                <div
                  key={level}
                  onClick={() => setValue('severidad', level as any)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-2 text-center text-xs font-semibold capitalize transition-all hover:scale-105",
                    watch('severidad') === level
                      ? level === 'baja' ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                        : level === 'media' ? 'bg-orange-100 border-orange-500 text-orange-700'
                          : level === 'alta' ? 'bg-red-100 border-red-500 text-red-700'
                            : 'bg-purple-100 border-purple-500 text-purple-700'
                      : "bg-background hover:bg-muted"
                  )}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Recordatorio Automático */}
      {!isEditing && (
        <div className="space-y-4 p-4 border rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className={cn("w-5 h-5", showReminder ? "text-indigo-600" : "text-muted-foreground")} />
              <div className="flex flex-col">
                <Label htmlFor="create_reminder" className="cursor-pointer font-semibold text-indigo-950 dark:text-indigo-200">Agendar Seguimiento</Label>
                <span className="text-[10px] text-muted-foreground">Crear tarea automática en calendario</span>
              </div>
            </div>
            <Switch
              id="create_reminder"
              checked={watch('create_reminder')}
              onCheckedChange={(checked) => setValue('create_reminder', checked)}
            />
          </div>

          {showReminder && (
            <div className="grid gap-4 pt-2 animate-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label className="text-xs">Título de la Tarea</Label>
                <Input {...register('reminder_title')} placeholder="Ej: Revisar evolución de hongos" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Fecha de Revisión</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background",
                        !watch('reminder_date') && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('reminder_date') ? format(watch('reminder_date')!, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch('reminder_date')}
                      onSelect={(date) => setValue('reminder_date', date)}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
      )}


      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-900/20">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Guardar Cambios' : 'Registrar Evento'}
        </Button>
      </div>
    </form>
  )
}

