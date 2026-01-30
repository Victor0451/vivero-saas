'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { GeneroPlanta, ActionResponse } from '@/types'

// Tipos para géneros
export type CreateGeneroData = {
    nombre: string
    descripcion?: string
}

export type UpdateGeneroData = {
    nombre?: string
    descripcion?: string
}

export async function getGeneros(): Promise<GeneroPlanta[]> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('generos_planta')
            .select('*')
            .order('nombre', { ascending: true })

        if (error) {
            throw new Error(`Error al obtener géneros: ${error.message}`)
        }

        return data || []
    } catch (error: unknown) {
        console.error('Error en getGeneros:', error)
        throw error
    }
}

export async function getGeneroById(id: number): Promise<GeneroPlanta | null> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('generos_planta')
            .select('*')
            .eq('id_genero', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw new Error('Error al obtener el género')
        }

        return data
    } catch (error: unknown) {
        console.error('Error getting genero by id:', error)
        throw error
    }
}

export async function createGenero(data: CreateGeneroData): Promise<ActionResponse> {
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
            .from('generos_planta')
            .insert({
                nombre: data.nombre,
                descripcion: data.descripcion,
                id_tenant: userData.id_tenant,
            })

        if (error) {
            console.error('Error de Supabase al crear género:', error)
            return {
                success: false,
                message: `Error al crear el género: ${error.message}`
            }
        }

        revalidatePath('/catalogos/generos')
        return {
            success: true,
            message: 'Género creado exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en createGenero:', error)
        return {
            success: false,
            message: `Error al crear el género: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function updateGenero(id: number, data: UpdateGeneroData): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('generos_planta')
            .update(data)
            .eq('id_genero', id)

        if (error) {
            return {
                success: false,
                message: `Error al actualizar el género: ${error.message}`
            }
        }

        revalidatePath('/catalogos/generos')
        return {
            success: true,
            message: 'Género actualizado exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en updateGenero:', error)
        return {
            success: false,
            message: `Error al actualizar el género: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function deleteGenero(id: number): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('generos_planta')
            .delete()
            .eq('id_genero', id)

        if (error) {
            return {
                success: false,
                message: `Error al eliminar el género: ${error.message}`
            }
        }

        revalidatePath('/catalogos/generos')
        return {
            success: true,
            message: 'Género eliminado exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en deleteGenero:', error)
        return {
            success: false,
            message: `Error al eliminar el género: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}
