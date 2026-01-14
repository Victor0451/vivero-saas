'use server'

import { createClient } from '@/lib/supabase/server'
import { startOfMonth, subMonths, format } from 'date-fns'

export interface PlantHealthTrend {
    mes: string
    saludables: number
    enfermas: number
    muertas: number
}

export interface TaskCompletionData {
    mes: string
    completadas: number
    pendientes: number
}

export interface PlantDistribution {
    name: string
    value: number
}

/**
 * Obtiene tendencias de salud de plantas en un rango de meses personalizado
 */
export async function getPlantHealthTrends(months: number = 6): Promise<PlantHealthTrend[]> {
    const supabase = await createClient()

    // Obtener plantas con su fecha de creación
    const { data: plantas, error } = await supabase
        .from('plantas')
        .select('estado, created_at')
        .order('created_at', { ascending: true })

    if (error || !plantas) {
        console.error('Error fetching plant health trends:', error)
        return []
    }

    // Generar meses según el parámetro
    const monthsData: PlantHealthTrend[] = []
    for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i)
        const monthStart = startOfMonth(monthDate)
        const monthLabel = format(monthDate, 'MMM yyyy')

        // Contar plantas por estado hasta ese mes
        const plantasHastaMes = plantas.filter(p => new Date(p.created_at) <= monthStart)

        const saludables = plantasHastaMes.filter(p => p.estado === 'normal' || !p.estado).length
        const enfermas = plantasHastaMes.filter(p => p.estado === 'enferma').length
        const muertas = plantasHastaMes.filter(p => p.estado === 'muerta').length

        monthsData.push({
            mes: monthLabel,
            saludables,
            enfermas,
            muertas
        })
    }

    return monthsData
}

/**
 * Obtiene distribución de plantas por género
 */
export async function getPlantDistributionByGenre(): Promise<PlantDistribution[]> {
    const supabase = await createClient()

    interface PlantaDistributionResult {
        id_genero: number | null
        generos_planta: {
            nombre: string
        } | null
    }

    const { data, error } = await supabase
        .from('plantas')
        .select(`
            id_genero,
            generos_planta (
                nombre
            )
        `)
        .is('deleted_at', null)

    if (error || !data) {
        console.error('Error fetching plant distribution:', error)
        return []
    }

    // Agrupar por género
    const distribution: Record<string, number> = {}
    const typedData = data as unknown as PlantaDistributionResult[]

    typedData.forEach((planta) => {
        const genero = planta.generos_planta?.nombre || 'Sin género'
        distribution[genero] = (distribution[genero] || 0) + 1
    })

    // Convertir a array y ordenar por cantidad
    return Object.entries(distribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) // Top 8 géneros
}

/**
 * Obtiene tasa de completado de tareas por mes en un rango personalizado
 */
export async function getTaskCompletionRate(months: number = 6): Promise<TaskCompletionData[]> {
    const supabase = await createClient()

    const { data: tareas, error } = await supabase
        .from('tareas')
        .select('completada, fecha_programada, created_at')
        .order('created_at', { ascending: true })

    if (error || !tareas) {
        console.error('Error fetching task completion rate:', error)
        return []
    }

    // Generar meses según el parámetro
    const monthsData: TaskCompletionData[] = []
    for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i)
        const monthStart = startOfMonth(monthDate)
        const monthEnd = startOfMonth(subMonths(new Date(), i - 1))
        const monthLabel = format(monthDate, 'MMM yyyy')

        // Filtrar tareas de ese mes
        const tareasDelMes = tareas.filter(t => {
            const fechaProgramada = new Date(t.fecha_programada || t.created_at)
            return fechaProgramada >= monthStart && fechaProgramada < monthEnd
        })

        const completadas = tareasDelMes.filter(t => t.completada).length
        const pendientes = tareasDelMes.filter(t => !t.completada).length

        monthsData.push({
            mes: monthLabel,
            completadas,
            pendientes
        })
    }

    return monthsData
}

/**
 * Obtiene estadísticas de actividad del vivero
 */
export async function getActivityStats() {
    const supabase = await createClient()

    // Plantas agregadas en los últimos 6 meses
    const sixMonthsAgo = subMonths(new Date(), 6)

    const { data: plantasRecientes } = await supabase
        .from('plantas')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())

    // Registros de historial clínico en los últimos 6 meses
    const { data: historialReciente } = await supabase
        .from('historia_clinica')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())

    return {
        plantasAgregadas: plantasRecientes?.length || 0,
        registrosClinicosAgregados: historialReciente?.length || 0
    }
}
