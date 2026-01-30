'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Maceta, ActionResponse } from '@/types'

// Tipos para macetas
export type CreateMacetaData = {
    tipo: string
    material?: string
    diametro_cm?: number
    altura_cm?: number
    volumen_lts?: number
}

export type UpdateMacetaData = {
    tipo?: string
    material?: string
    diametro_cm?: number
    altura_cm?: number
    volumen_lts?: number
}

export async function getMacetas(): Promise<Maceta[]> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('macetas')
            .select('*')
            .order('tipo', { ascending: true })

        if (error) {
            throw new Error(`Error al obtener macetas: ${error.message}`)
        }

        return data || []
    } catch (error: unknown) {
        console.error('Error en getMacetas:', error)
        throw error
    }
}

export async function getMacetaById(id: number): Promise<Maceta | null> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('macetas')
            .select('*')
            .eq('id_maceta', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw new Error('Error al obtener la maceta')
        }

        return data
    } catch (error: unknown) {
        console.error('Error getting maceta by id:', error)
        throw error
    }
}

export async function createMaceta(data: CreateMacetaData): Promise<ActionResponse> {
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

        const { error } = await supabase
            .from('macetas')
            .insert({
                tipo: data.tipo,
                material: data.material,
                diametro_cm: data.diametro_cm,
                altura_cm: data.altura_cm,
                volumen_lts: data.volumen_lts,
                id_tenant: userData.id_tenant,
            })

        if (error) {
            console.error('Error de Supabase al crear maceta:', error)
            return {
                success: false,
                message: `Error al crear la maceta: ${error.message}`
            }
        }

        revalidatePath('/catalogos/macetas')
        return {
            success: true,
            message: 'Maceta creada exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en createMaceta:', error)
        return {
            success: false,
            message: `Error al crear la maceta: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function updateMaceta(id: number, data: UpdateMacetaData): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('macetas')
            .update(data)
            .eq('id_maceta', id)

        if (error) {
            return {
                success: false,
                message: `Error al actualizar la maceta: ${error.message}`
            }
        }

        revalidatePath('/catalogos/macetas')
        return {
            success: true,
            message: 'Maceta actualizada exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en updateMaceta:', error)
        return {
            success: false,
            message: `Error al actualizar la maceta: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function deleteMaceta(id: number): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('macetas')
            .delete()
            .eq('id_maceta', id)

        if (error) {
            return {
                success: false,
                message: `Error al eliminar la maceta: ${error.message}`
            }
        }

        revalidatePath('/catalogos/macetas')
        return {
            success: true,
            message: 'Maceta eliminada exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en deleteMaceta:', error)
        return {
            success: false,
            message: `Error al eliminar la maceta: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}
