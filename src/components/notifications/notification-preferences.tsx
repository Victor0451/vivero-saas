'use client'

import { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    getNotificationPreferences,
    updateNotificationPreference,
    initializeDefaultPreferences,
    type NotificationPreference
} from '@/app/actions/notifications'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

const notificationTypes = [
    {
        id: 'tarea_vencida',
        label: 'Tareas Vencidas',
        description: 'Notificaciones cuando una tarea no se completa en la fecha programada'
    },
    {
        id: 'tarea_proxima',
        label: 'Tareas Próximas',
        description: 'Recordatorios de tareas programadas para las próximas 24 horas'
    },
    {
        id: 'planta_enferma',
        label: 'Plantas Enfermas',
        description: 'Alertas de plantas enfermas sin tratamiento reciente'
    },
    {
        id: 'nueva_planta',
        label: 'Nuevas Plantas',
        description: 'Notificaciones cuando se agrega una nueva planta'
    },
]

const frequencies = [
    { value: 'inmediata', label: 'Inmediata' },
    { value: 'diaria', label: 'Resumen Diario' },
    { value: 'semanal', label: 'Resumen Semanal' },
    { value: 'deshabilitada', label: 'Deshabilitada' },
]

export function NotificationPreferences() {
    const [preferences, setPreferences] = useState<NotificationPreference[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadPreferences = useCallback(async () => {
        // isLoading ya empieza en true
        let prefs = await getNotificationPreferences()

        // Si no hay preferencias, inicializar con valores por defecto
        if (prefs.length === 0) {
            await initializeDefaultPreferences()
            prefs = await getNotificationPreferences()
        }

        setPreferences(prefs)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPreferences()
    }, [loadPreferences])

    const handleToggle = async (tipo: string, enabled: boolean) => {
        const pref = preferences.find(p => p.tipo_notificacion === tipo)
        const frecuencia = pref?.frecuencia || 'inmediata'

        const success = await updateNotificationPreference(tipo, enabled, frecuencia)
        if (success) {
            setPreferences(prev =>
                prev.map(p =>
                    p.tipo_notificacion === tipo
                        ? { ...p, habilitada: enabled }
                        : p
                )
            )
            toast.success(enabled ? 'Notificación habilitada' : 'Notificación deshabilitada')
        } else {
            toast.error('Error al actualizar preferencia')
        }
    }

    const handleFrequencyChange = async (tipo: string, frecuencia: string) => {
        const pref = preferences.find(p => p.tipo_notificacion === tipo)
        const habilitada = pref?.habilitada ?? true

        const success = await updateNotificationPreference(tipo, habilitada, frecuencia)
        if (success) {
            setPreferences(prev =>
                prev.map(p =>
                    p.tipo_notificacion === tipo
                        ? { ...p, frecuencia }
                        : p
                )
            )
            toast.success('Frecuencia actualizada')
        } else {
            toast.error('Error al actualizar frecuencia')
        }
    }

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Cargando preferencias...</div>
    }

    return (
        <div className="space-y-6">
            {notificationTypes.map((type, index) => {
                const pref = preferences.find(p => p.tipo_notificacion === type.id)
                const isEnabled = pref?.habilitada ?? true
                const frequency = pref?.frecuencia || 'inmediata'

                return (
                    <div key={type.id}>
                        {index > 0 && <Separator className="my-4" />}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5 flex-1">
                                    <Label htmlFor={type.id} className="text-base font-medium">
                                        {type.label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {type.description}
                                    </p>
                                </div>
                                <Switch
                                    id={type.id}
                                    checked={isEnabled}
                                    onCheckedChange={(checked) => handleToggle(type.id, checked)}
                                />
                            </div>

                            {isEnabled && (
                                <div className="ml-0 space-y-2">
                                    <Label htmlFor={`${type.id}-frequency`} className="text-sm">
                                        Frecuencia
                                    </Label>
                                    <Select
                                        value={frequency}
                                        onValueChange={(value) => handleFrequencyChange(type.id, value)}
                                    >
                                        <SelectTrigger id={`${type.id}-frequency`} className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {frequencies.map((freq) => (
                                                <SelectItem key={freq.value} value={freq.value}>
                                                    {freq.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
