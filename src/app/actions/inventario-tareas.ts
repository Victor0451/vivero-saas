'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createMovimiento, getMovimientos } from './inventario'
import type { MovimientoConDetalles } from '@/types'

// ============================================
// INTEGRACIÓN CON TAREAS
// ============================================

/**
 * Tipo para registrar consumo de materiales
 */
export type ConsumoMaterial = {
    id_item: number
    cantidad: number
    motivo?: string
}

/**
 * Registra el consumo de materiales al completar una tarea
 * Crea movimientos de salida y actualiza el stock automáticamente
 */
export async function registrarConsumoTarea(
    id_tarea: number,
    materiales: ConsumoMaterial[]
): Promise<boolean> {
    const supabase = await createClient()

    // Obtener tenant y usuario
    const { data: authData } = await supabase.auth.getUser()
    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', authData.user?.id)
        .single()

    if (!userData) throw new Error('Usuario no encontrado')

    // Obtener información de la tarea
    const { data: tarea } = await supabase
        .from('tareas')
        .select('titulo')
        .eq('id_tarea', id_tarea)
        .single()

    if (!tarea) throw new Error('Tarea no encontrada')

    try {
        // Registrar cada material consumido
        for (const material of materiales) {
            // Obtener stock actual del item
            const { data: item } = await supabase
                .from('items_inventario')
                .select('stock_actual, nombre')
                .eq('id_item', material.id_item)
                .single()

            if (!item) {
                throw new Error(`Item con ID ${material.id_item} no encontrado`)
            }

            // Verificar que hay stock suficiente
            const stock_anterior = item.stock_actual
            const stock_nuevo = stock_anterior - material.cantidad

            if (stock_nuevo < 0) {
                throw new Error(
                    `Stock insuficiente para ${item.nombre}. ` +
                    `Disponible: ${stock_anterior}, Requerido: ${material.cantidad}`
                )
            }

            // Crear movimiento de salida
            const motivo = material.motivo || `Consumo en tarea: ${tarea.titulo}`

            await createMovimiento({
                id_item: material.id_item,
                tipo: 'salida',
                cantidad: material.cantidad,
                motivo,
                id_tarea
            })
        }

        revalidatePath('/tareas')
        revalidatePath('/inventario')
        return true
    } catch (error) {
        console.error('Error registrando consumo de materiales:', error)
        throw error
    }
}

/**
 * Obtiene el historial de materiales consumidos en una tarea
 */
export async function getMaterialesConsumidosPorTarea(
    id_tarea: number
): Promise<MovimientoConDetalles[]> {
    return getMovimientos(undefined, 100).then(movimientos =>
        movimientos.filter(m => m.id_tarea === id_tarea && m.tipo === 'salida')
    )
}
