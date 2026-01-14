'use server'

import { createClient } from '@/lib/supabase/server'

export interface Notification {
    id_notificacion: number
    id_tenant: string
    id_usuario: string
    tipo: string
    titulo: string
    mensaje: string
    leida: boolean
    url_accion: string | null
    metadata: Record<string, unknown> | null
    created_at: string
}

export interface NotificationPreference {
    id_preferencia: number
    id_usuario: string
    tipo_notificacion: string
    habilitada: boolean
    frecuencia: string
    created_at: string
    updated_at: string
}

/**
 * Obtiene las notificaciones del usuario actual
 */
export async function getNotifications(limit: number = 50): Promise<Notification[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('id_usuario', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching notifications:', error)
        return []
    }

    return data || []
}

/**
 * Obtiene el contador de notificaciones no leídas
 */
export async function getUnreadCount(): Promise<number> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('id_usuario', user.id)
        .eq('leida', false)

    if (error) {
        console.error('Error fetching unread count:', error)
        return 0
    }

    return count || 0
}

/**
 * Marca una notificación como leída
 */
export async function markAsRead(id: number): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id_notificacion', id)

    if (error) {
        console.error('Error marking notification as read:', error)
        return false
    }

    return true
}

/**
 * Marca todas las notificaciones como leídas
 */
export async function markAllAsRead(): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id_usuario', user.id)
        .eq('leida', false)

    if (error) {
        console.error('Error marking all notifications as read:', error)
        return false
    }

    return true
}

/**
 * Elimina una notificación
 */
export async function deleteNotification(id: number): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id_notificacion', id)

    if (error) {
        console.error('Error deleting notification:', error)
        return false
    }

    return true
}

/**
 * Crea una nueva notificación
 */
export async function createNotification(data: {
    id_tenant: string
    id_usuario: string
    tipo: string
    titulo: string
    mensaje: string
    url_accion?: string
    metadata?: Record<string, unknown>
}): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notificaciones')
        .insert(data)

    if (error) {
        console.error('Error creating notification:', error)
        return false
    }

    return true
}

/**
 * Obtiene las preferencias de notificaciones del usuario
 */
export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('preferencias_notificaciones')
        .select('*')
        .eq('id_usuario', user.id)

    if (error) {
        console.error('Error fetching notification preferences:', error)
        return []
    }

    return data || []
}

/**
 * Actualiza una preferencia de notificación
 */
export async function updateNotificationPreference(
    tipo: string,
    habilitada: boolean,
    frecuencia: string
): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase
        .from('preferencias_notificaciones')
        .upsert({
            id_usuario: user.id,
            tipo_notificacion: tipo,
            habilitada,
            frecuencia
        }, {
            onConflict: 'id_usuario,tipo_notificacion'
        })

    if (error) {
        console.error('Error updating notification preference:', error)
        return false
    }

    return true
}

/**
 * Inicializa las preferencias por defecto para un usuario
 */
export async function initializeDefaultPreferences(): Promise<boolean> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const defaultPreferences = [
        { tipo_notificacion: 'tarea_vencida', habilitada: true, frecuencia: 'inmediata' },
        { tipo_notificacion: 'tarea_proxima', habilitada: true, frecuencia: 'inmediata' },
        { tipo_notificacion: 'planta_enferma', habilitada: true, frecuencia: 'diaria' },
        { tipo_notificacion: 'nueva_planta', habilitada: true, frecuencia: 'inmediata' },
    ]

    const preferencesWithUser = defaultPreferences.map(pref => ({
        id_usuario: user.id,
        ...pref
    }))

    const { error } = await supabase
        .from('preferencias_notificaciones')
        .upsert(preferencesWithUser, {
            onConflict: 'id_usuario,tipo_notificacion',
            ignoreDuplicates: true
        })

    if (error) {
        console.error('Error initializing default preferences:', error)
        return false
    }

    return true
}
