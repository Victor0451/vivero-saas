'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { registrarConsumoTarea, type ConsumoMaterial } from './inventario-tareas'
import type { Tarea, ActionResponse } from '@/types'

// Tipos para tareas
export type CreateTareaData = {
    titulo: string
    descripcion?: string
    fecha_programada: string
    id_planta?: number
}

export type UpdateTareaData = {
    titulo?: string
    descripcion?: string
    fecha_programada?: string
    completada?: boolean
}

export async function getTareas(): Promise<Tarea[]> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('tareas')
            .select(`
        *,
        plantas(id_planta, nombre)
      `)
            .order('fecha_programada', { ascending: true })

        if (error) {
            throw new Error(`Error al obtener tareas: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }

        return data || []
    } catch (error) {
        console.error('Error en getTareas:', error)
        throw error
    }
}

export async function getTareaById(id: number): Promise<Tarea | null> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('tareas')
            .select('*')
            .eq('id_tarea', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw new Error('Error al obtener la tarea')
        }

        return data
    } catch (error) {
        console.error('Error getting tarea by id:', error)
        throw error
    }
}

export async function createTarea(data: CreateTareaData): Promise<ActionResponse<Tarea>> {
    const supabase = await createClient()

    try {
        // Obtener el tenant del usuario autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData?.user) {
            return {
                success: false,
                message: 'Usuario no autenticado'
            }
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id_tenant')
            .eq('id_user', authData.user.id)
            .single()

        if (userError || !userData) {
            return {
                success: false,
                message: 'No se pudo obtener el tenant del usuario'
            }
        }

        const { data: tarea, error } = await supabase
            .from('tareas')
            .insert({
                titulo: data.titulo,
                descripcion: data.descripcion,
                fecha_programada: data.fecha_programada,
                id_planta: data.id_planta,
                id_tenant: userData.id_tenant,
                completada: false,
            })
            .select()
            .single()

        if (error) {
            console.error('Error de Supabase al crear tarea:', error)
            return {
                success: false,
                message: `Error al crear la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }
        }

        revalidatePath('/tareas')
        revalidatePath('/dashboard')

        return {
            success: true,
            message: 'Tarea creada exitosamente',
            data: tarea
        }
    } catch (error: unknown) {
        console.error('Error en createTarea:', error)
        return {
            success: false,
            message: `Error al crear la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function bulkCreateTareas(
    ids: number[],
    data: CreateTareaData,
    materiales?: ConsumoMaterial[]
): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        // Obtener el tenant del usuario autenticado
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData?.user) {
            return { success: false, message: 'Usuario no autenticado' }
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id_tenant')
            .eq('id_user', authData.user.id)
            .single()

        if (userError || !userData) {
            return { success: false, message: 'No se pudo obtener el tenant' }
        }

        const tareasToInsert = ids.map(idPlanta => ({
            titulo: data.titulo,
            descripcion: data.descripcion,
            fecha_programada: data.fecha_programada,
            id_planta: idPlanta,
            id_tenant: userData.id_tenant,
            completada: false
        }))

        const { data: createdTareas, error } = await supabase
            .from('tareas')
            .insert(tareasToInsert)
            .select('id_tarea')

        if (error) {
            console.error('Error in bulk task creation:', error)
            return {
                success: false,
                message: `Error al crear tareas en lote: ${error.message}`
            }
        }

        // Registrar consumo de materiales para cada tarea si existen
        if (materiales && materiales.length > 0 && createdTareas) {
            try {
                for (const tarea of createdTareas) {
                    await registrarConsumoTarea(tarea.id_tarea, materiales)
                }
            } catch (matError) {
                console.error('Error recording materials in bulk:', matError)
                return {
                    success: true,
                    message: `${ids.length} tareas creadas, pero hubo un error al registrar algunos materiales.`
                }
            }
        }

        revalidatePath('/tareas')
        revalidatePath('/dashboard')
        revalidatePath('/plantas')

        return {
            success: true,
            message: `${ids.length} tareas creadas exitosamente`
        }
    } catch (error: unknown) {
        console.error('Error in bulkCreateTareas:', error)
        return {
            success: false,
            message: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function updateTarea(id: number, data: UpdateTareaData): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('tareas')
            .update(data)
            .eq('id_tarea', id)

        if (error) {
            return {
                success: false,
                message: `Error al actualizar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }
        }

        revalidatePath('/tareas', 'page')
        revalidatePath('/dashboard', 'page')
        return {
            success: true,
            message: 'Tarea actualizada exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en updateTarea:', error)
        return {
            success: false,
            message: `Error al actualizar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function deleteTarea(id: number): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('tareas')
            .delete()
            .eq('id_tarea', id)

        if (error) {
            return {
                success: false,
                message: `Error al eliminar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }
        }

        revalidatePath('/tareas', 'page')
        revalidatePath('/dashboard', 'page')
        return {
            success: true,
            message: 'Tarea eliminada exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en deleteTarea:', error)
        return {
            success: false,
            message: `Error al eliminar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function toggleTareaCompletada(id: number): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        // Primero obtener el estado actual
        const { data: tarea, error: getError } = await supabase
            .from('tareas')
            .select('completada')
            .eq('id_tarea', id)
            .single()

        if (getError) {
            return {
                success: false,
                message: `Error al obtener la tarea: ${getError.message}`
            }
        }

        // Actualizar el estado opuesto
        const { error } = await supabase
            .from('tareas')
            .update({ completada: !tarea.completada })
            .eq('id_tarea', id)

        if (error) {
            return {
                success: false,
                message: `Error al actualizar el estado: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }
        }

        revalidatePath('/tareas', 'page')
        revalidatePath('/dashboard', 'page')
        return {
            success: true,
            message: `Tarea ${!tarea.completada ? 'marcada como completada' : 'marcada como pendiente'}`
        }
    } catch (error: unknown) {
        console.error('Error en toggleTareaCompletada:', error)
        return {
            success: false,
            message: `Error al cambiar el estado: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}
