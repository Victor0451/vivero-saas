'use server'

import { createClient } from '@/lib/supabase/server'
import { createNotification } from './notifications'
import { subDays } from 'date-fns'

/**
 * Ejecuta verificaciones de notificaciones para TODOS los tenants
 * Esta función se ejecuta desde el cron job y no requiere autenticación
 */
export async function runNotificationChecksForAllTenants() {
    const supabase = await createClient()

    try {
        // Obtener todos los tenants activos
        const { data: tenants, error: tenantsError } = await supabase
            .from('tenants')
            .select('id_tenant, nombre')

        if (tenantsError) {
            console.error('Error fetching tenants:', tenantsError)
            return { success: false, error: tenantsError.message }
        }

        if (!tenants || tenants.length === 0) {
            return { success: true, message: 'No tenants found', tenantsProcessed: 0 }
        }

        const results = []

        // Procesar cada tenant
        for (const tenant of tenants) {
            try {
                const tenantResult = await checkNotificationsForTenant(tenant.id_tenant)
                results.push({
                    tenant: tenant.nombre,
                    ...tenantResult
                })
            } catch (error) {
                console.error(`Error processing tenant ${tenant.nombre}:`, error)
                results.push({
                    tenant: tenant.nombre,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        return {
            success: true,
            tenantsProcessed: tenants.length,
            results
        }
    } catch (error) {
        console.error('Error in runNotificationChecksForAllTenants:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Verifica y genera notificaciones para un tenant específico
 */
async function checkNotificationsForTenant(tenantId: string) {
    const notifications = {
        stockBajo: 0,
        stockCritico: 0,
        tareasVencidas: 0,
        tareasProximas: 0,
        plantasEnfermas: 0
    }

    try {
        // 1. Verificar stock bajo
        const stockBajoResult = await checkLowStockForTenant(tenantId)
        notifications.stockBajo = stockBajoResult.notificationsCreated

        // 2. Verificar stock crítico
        const stockCriticoResult = await checkCriticalStockForTenant(tenantId)
        notifications.stockCritico = stockCriticoResult.notificationsCreated

        // 3. Verificar tareas vencidas
        const tareasVencidasResult = await checkOverdueTasksForTenant(tenantId)
        notifications.tareasVencidas = tareasVencidasResult.notificationsCreated

        // 4. Verificar tareas próximas
        const tareasProximasResult = await checkUpcomingTasksForTenant(tenantId)
        notifications.tareasProximas = tareasProximasResult.notificationsCreated

        // 5. Verificar plantas enfermas
        const plantasEnfermasResult = await checkSickPlantsForTenant(tenantId)
        notifications.plantasEnfermas = plantasEnfermasResult.notificationsCreated

        return {
            success: true,
            notifications
        }
    } catch (error) {
        console.error(`Error checking notifications for tenant ${tenantId}:`, error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Verifica stock bajo para un tenant específico
 */
async function checkLowStockForTenant(tenantId: string) {
    const supabase = await createClient()

    // Buscar items con stock bajo
    const { data: lowStockItems } = await supabase
        .from('items_inventario')
        .select('id_item, codigo, nombre, stock_actual, stock_minimo, unidad_medida')
        .eq('id_tenant', tenantId)
        .eq('activo', true)

    if (!lowStockItems || lowStockItems.length === 0) {
        return { notificationsCreated: 0 }
    }

    const itemsWithLowStock = lowStockItems.filter(
        item => item.stock_actual <= item.stock_minimo
    )

    if (itemsWithLowStock.length === 0) {
        return { notificationsCreated: 0 }
    }

    // Obtener usuarios del tenant para notificar
    const { data: users } = await supabase
        .from('users')
        .select('id_user')
        .eq('id_tenant', tenantId)

    if (!users || users.length === 0) {
        return { notificationsCreated: 0 }
    }

    let notificationsCreated = 0

    // Crear notificación para cada usuario del tenant
    for (const user of users) {
        // Verificar si ya existe notificación reciente
        const { data: existingNotifications } = await supabase
            .from('notificaciones')
            .select('id_notificacion')
            .eq('id_tenant', tenantId)
            .eq('id_usuario', user.id_user)
            .eq('tipo', 'stock_bajo')
            .eq('leida', false)
            .gte('created_at', subDays(new Date(), 1).toISOString())

        if (existingNotifications && existingNotifications.length > 0) {
            continue
        }

        const itemsCount = itemsWithLowStock.length
        const itemsList = itemsWithLowStock
            .slice(0, 3)
            .map(item => `${item.nombre} (${item.stock_actual}/${item.stock_minimo} ${item.unidad_medida})`)
            .join(', ')

        const mensaje = itemsCount === 1
            ? `El item "${itemsWithLowStock[0].nombre}" tiene stock bajo (${itemsWithLowStock[0].stock_actual}/${itemsWithLowStock[0].stock_minimo} ${itemsWithLowStock[0].unidad_medida})`
            : `${itemsCount} items tienen stock bajo: ${itemsList}${itemsCount > 3 ? '...' : ''}`

        await createNotification({
            id_tenant: tenantId,
            id_usuario: user.id_user,
            tipo: 'stock_bajo',
            titulo: '⚠️ Stock Bajo en Inventario',
            mensaje,
            url_accion: `/inventario`,
            metadata: {
                items_count: itemsCount,
                items: itemsWithLowStock.map(i => ({ id: i.id_item, nombre: i.nombre }))
            }
        })

        notificationsCreated++
    }

    return { notificationsCreated }
}

/**
 * Verifica stock crítico para un tenant específico
 */
async function checkCriticalStockForTenant(tenantId: string) {
    const supabase = await createClient()

    const { data: criticalItems } = await supabase
        .from('items_inventario')
        .select('id_item, codigo, nombre, unidad_medida')
        .eq('id_tenant', tenantId)
        .eq('activo', true)
        .eq('stock_actual', 0)

    if (!criticalItems || criticalItems.length === 0) {
        return { notificationsCreated: 0 }
    }

    const { data: users } = await supabase
        .from('users')
        .select('id_user')
        .eq('id_tenant', tenantId)

    if (!users || users.length === 0) {
        return { notificationsCreated: 0 }
    }

    let notificationsCreated = 0

    for (const user of users) {
        const { data: existingNotifications } = await supabase
            .from('notificaciones')
            .select('id_notificacion')
            .eq('id_tenant', tenantId)
            .eq('id_usuario', user.id_user)
            .eq('tipo', 'stock_critico')
            .eq('leida', false)
            .gte('created_at', subDays(new Date(), 1).toISOString())

        if (existingNotifications && existingNotifications.length > 0) {
            continue
        }

        const itemsCount = criticalItems.length
        const itemsList = criticalItems
            .slice(0, 3)
            .map(item => item.nombre)
            .join(', ')

        const mensaje = itemsCount === 1
            ? `El item "${criticalItems[0].nombre}" está agotado (stock en 0)`
            : `${itemsCount} items están agotados: ${itemsList}${itemsCount > 3 ? '...' : ''}`

        await createNotification({
            id_tenant: tenantId,
            id_usuario: user.id_user,
            tipo: 'stock_critico',
            titulo: '🚨 Stock Crítico - Items Agotados',
            mensaje,
            url_accion: `/inventario`,
            metadata: {
                items_count: itemsCount,
                items: criticalItems.map(i => ({ id: i.id_item, nombre: i.nombre }))
            }
        })

        notificationsCreated++
    }

    return { notificationsCreated }
}

/**
 * Verifica tareas vencidas para un tenant específico
 */
async function checkOverdueTasksForTenant(tenantId: string) {
    const supabase = await createClient()
    const today = new Date()

    const { data: overdueTasks } = await supabase
        .from('tareas')
        .select('id_tarea, titulo, fecha_programada')
        .eq('id_tenant', tenantId)
        .eq('completada', false)
        .lt('fecha_programada', today.toISOString().split('T')[0])

    if (!overdueTasks || overdueTasks.length === 0) {
        return { notificationsCreated: 0 }
    }

    const { data: users } = await supabase
        .from('users')
        .select('id_user')
        .eq('id_tenant', tenantId)

    if (!users || users.length === 0) {
        return { notificationsCreated: 0 }
    }

    let notificationsCreated = 0

    for (const user of users) {
        for (const task of overdueTasks) {
            await createNotification({
                id_tenant: tenantId,
                id_usuario: user.id_user,
                tipo: 'tarea_vencida',
                titulo: 'Tarea Vencida',
                mensaje: `La tarea "${task.titulo}" está vencida desde ${task.fecha_programada}`,
                url_accion: `/tareas`,
                metadata: { id_tarea: task.id_tarea }
            })
            notificationsCreated++
        }
    }

    return { notificationsCreated }
}

/**
 * Verifica tareas próximas para un tenant específico
 */
async function checkUpcomingTasksForTenant(_tenantId: string) {
    // TODO: Implementar verificación de tareas próximas
    // Por ahora retornamos 0
    return { notificationsCreated: 0 }
}

/**
 * Verifica plantas enfermas para un tenant específico
 */
async function checkSickPlantsForTenant(_tenantId: string) {
    // TODO: Implementar verificación de plantas enfermas
    // Por ahora retornamos 0
    return { notificationsCreated: 0 }
}
