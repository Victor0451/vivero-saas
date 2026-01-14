'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notifications'
import { subDays, addDays } from 'date-fns'

/**
 * Verifica y genera notificaciones para tareas vencidas
 */
export async function checkOverdueTasks() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Obtener tenant del usuario
    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) return

    const today = new Date()

    // Buscar tareas vencidas (no completadas y fecha pasada)
    const { data: overdueTasks } = await supabase
        .from('tareas')
        .select('id_tarea, titulo, fecha_programada')
        .eq('id_tenant', userData.id_tenant)
        .eq('completada', false)
        .lt('fecha_programada', today.toISOString().split('T')[0])

    if (!overdueTasks || overdueTasks.length === 0) return

    // Crear notificación para cada tarea vencida
    for (const task of overdueTasks) {
        await createNotification({
            id_tenant: userData.id_tenant,
            id_usuario: user.id,
            tipo: 'tarea_vencida',
            titulo: 'Tarea Vencida',
            mensaje: `La tarea "${task.titulo}" está vencida desde ${task.fecha_programada}`,
            url_accion: `/tareas`,
            metadata: { id_tarea: task.id_tarea }
        })
    }
}

/**
 * Verifica y genera notificaciones para tareas próximas (24 horas)
 */
export async function checkUpcomingTasks() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) return

    const tomorrow = addDays(new Date(), 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Buscar tareas programadas para mañana
    const { data: upcomingTasks } = await supabase
        .from('tareas')
        .select('id_tarea, titulo, fecha_programada')
        .eq('id_tenant', userData.id_tenant)
        .eq('completada', false)
        .eq('fecha_programada', tomorrowStr)

    if (!upcomingTasks || upcomingTasks.length === 0) return

    // Crear notificación para cada tarea próxima
    for (const task of upcomingTasks) {
        await createNotification({
            id_tenant: userData.id_tenant,
            id_usuario: user.id,
            tipo: 'tarea_proxima',
            titulo: 'Tarea Próxima',
            mensaje: `La tarea "${task.titulo}" está programada para mañana`,
            url_accion: `/dashboard/tareas`,
            metadata: { id_tarea: task.id_tarea }
        })
    }
}

/**
 * Verifica plantas enfermas sin tratamiento reciente (7 días)
 */
export async function checkSickPlants() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) return

    const sevenDaysAgo = subDays(new Date(), 7)

    // Buscar plantas enfermas
    const { data: sickPlants } = await supabase
        .from('plantas')
        .select('id_planta, nombre')
        .eq('id_tenant', userData.id_tenant)
        .eq('estado', 'enferma')
        .is('deleted_at', null)

    if (!sickPlants || sickPlants.length === 0) return

    // Para cada planta enferma, verificar si tiene tratamiento reciente
    for (const plant of sickPlants) {
        const { data: recentTreatment } = await supabase
            .from('historia_clinica')
            .select('id_historia')
            .eq('id_planta', plant.id_planta)
            .gte('created_at', sevenDaysAgo.toISOString())
            .limit(1)

        // Si no tiene tratamiento reciente, crear notificación
        if (!recentTreatment || recentTreatment.length === 0) {
            await createNotification({
                id_tenant: userData.id_tenant,
                id_usuario: user.id,
                tipo: 'planta_enferma',
                titulo: 'Planta Enferma Sin Tratamiento',
                mensaje: `La planta "${plant.nombre}" está enferma y no ha recibido tratamiento en los últimos 7 días`,
                url_accion: `/plantas/${plant.id_planta}`,
                metadata: { id_planta: plant.id_planta }
            })
        }
    }
}

/**
 * Genera un resumen diario de actividades
 */
export async function generateDailyDigest() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) return

    const today = new Date().toISOString().split('T')[0]

    // Contar tareas pendientes para hoy
    const { count: pendingTasks } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('id_tenant', userData.id_tenant)
        .eq('completada', false)
        .eq('fecha_programada', today)

    // Contar plantas enfermas
    const { count: sickPlants } = await supabase
        .from('plantas')
        .select('*', { count: 'exact', head: true })
        .eq('id_tenant', userData.id_tenant)
        .eq('estado', 'enferma')
        .is('deleted_at', null)

    // Solo crear resumen si hay algo que reportar
    if ((pendingTasks || 0) > 0 || (sickPlants || 0) > 0) {
        let mensaje = 'Resumen del día:\n'
        if (pendingTasks) mensaje += `• ${pendingTasks} tarea(s) pendiente(s) para hoy\n`
        if (sickPlants) mensaje += `• ${sickPlants} planta(s) enferma(s) requieren atención`

        await createNotification({
            id_tenant: userData.id_tenant,
            id_usuario: user.id,
            tipo: 'resumen_diario',
            titulo: 'Resumen Diario',
            mensaje,
            url_accion: `/`,
            metadata: { pendingTasks, sickPlants }
        })
    }
}

// ============================================
// NOTIFICACIONES DE INVENTARIO
// ============================================

/**
 * Verifica y genera notificaciones para items con stock bajo
 */
export async function checkLowStockItems() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Obtener tenant del usuario
    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) return

    // Buscar items con stock bajo (stock_actual <= stock_minimo)
    const { data: lowStockItems } = await supabase
        .from('items_inventario')
        .select('id_item, codigo, nombre, stock_actual, stock_minimo, unidad_medida')
        .eq('id_tenant', userData.id_tenant)
        .eq('activo', true)

    if (!lowStockItems || lowStockItems.length === 0) return

    // Filtrar items con stock bajo
    const itemsWithLowStock = lowStockItems.filter(
        item => item.stock_actual <= item.stock_minimo
    )

    if (itemsWithLowStock.length === 0) return

    // Verificar si ya existe una notificación reciente para evitar spam
    const { data: existingNotifications } = await supabase
        .from('notificaciones')
        .select('id_notificacion')
        .eq('id_tenant', userData.id_tenant)
        .eq('id_usuario', user.id)
        .eq('tipo', 'stock_bajo')
        .eq('leida', false)
        .gte('created_at', subDays(new Date(), 1).toISOString())

    // Si ya hay notificaciones recientes, no crear nuevas
    if (existingNotifications && existingNotifications.length > 0) return

    // Crear notificación general de stock bajo
    const itemsCount = itemsWithLowStock.length
    const itemsList = itemsWithLowStock
        .slice(0, 3)
        .map(item => `${item.nombre} (${item.stock_actual}/${item.stock_minimo} ${item.unidad_medida})`)
        .join(', ')

    const mensaje = itemsCount === 1
        ? `El item "${itemsWithLowStock[0].nombre}" tiene stock bajo (${itemsWithLowStock[0].stock_actual}/${itemsWithLowStock[0].stock_minimo} ${itemsWithLowStock[0].unidad_medida})`
        : `${itemsCount} items tienen stock bajo: ${itemsList}${itemsCount > 3 ? '...' : ''}`

    await createNotification({
        id_tenant: userData.id_tenant,
        id_usuario: user.id,
        tipo: 'stock_bajo',
        titulo: '⚠️ Stock Bajo en Inventario',
        mensaje,
        url_accion: `/inventario`,
        metadata: {
            items_count: itemsCount,
            items: itemsWithLowStock.map(i => ({ id: i.id_item, nombre: i.nombre }))
        }
    })
}

/**
 * Verifica y genera notificaciones para items con stock crítico (stock = 0)
 */
export async function checkCriticalStockItems() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Obtener tenant del usuario
    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) return

    // Buscar items con stock en 0
    const { data: criticalItems } = await supabase
        .from('items_inventario')
        .select('id_item, codigo, nombre, unidad_medida')
        .eq('id_tenant', userData.id_tenant)
        .eq('activo', true)
        .eq('stock_actual', 0)

    if (!criticalItems || criticalItems.length === 0) return

    // Verificar notificaciones recientes
    const { data: existingNotifications } = await supabase
        .from('notificaciones')
        .select('id_notificacion')
        .eq('id_tenant', userData.id_tenant)
        .eq('id_usuario', user.id)
        .eq('tipo', 'stock_critico')
        .eq('leida', false)
        .gte('created_at', subDays(new Date(), 1).toISOString())

    if (existingNotifications && existingNotifications.length > 0) return

    // Crear notificación de stock crítico
    const itemsCount = criticalItems.length
    const itemsList = criticalItems
        .slice(0, 3)
        .map(item => item.nombre)
        .join(', ')

    const mensaje = itemsCount === 1
        ? `El item "${criticalItems[0].nombre}" está agotado (stock en 0)`
        : `${itemsCount} items están agotados: ${itemsList}${itemsCount > 3 ? '...' : ''}`

    await createNotification({
        id_tenant: userData.id_tenant,
        id_usuario: user.id,
        tipo: 'stock_critico',
        titulo: '🚨 Stock Crítico - Items Agotados',
        mensaje,
        url_accion: `/inventario`,
        metadata: {
            items_count: itemsCount,
            items: criticalItems.map(i => ({ id: i.id_item, nombre: i.nombre }))
        }
    })
}

/**
 * Ejecuta todas las verificaciones de notificaciones
 */
export async function runNotificationChecks() {
    await Promise.all([
        checkOverdueTasks(),
        checkUpcomingTasks(),
        checkSickPlants(),
        checkLowStockItems(),
        checkCriticalStockItems()
    ])
}
