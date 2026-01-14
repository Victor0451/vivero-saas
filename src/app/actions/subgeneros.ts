'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SubgeneroPlanta, SubgeneroConGenero } from '@/types'

/**
 * Obtiene todos los subgéneros con información del género padre
 */
export async function getSubgeneros(): Promise<SubgeneroConGenero[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('subgeneros_planta')
        .select(`
      *,
      generos_planta (
        id_genero,
        nombre,
        descripcion
      )
    `)
        .order('nombre')

    if (error) {
        console.error('Error fetching subgeneros:', error)
        throw error
    }

    return data || []
}

/**
 * Obtiene subgéneros de un género específico
 */
export async function getSubgenerosByGenero(id_genero: number): Promise<SubgeneroPlanta[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('subgeneros_planta')
        .select('*')
        .eq('id_genero', id_genero)
        .order('nombre')

    if (error) {
        console.error('Error fetching subgeneros by genero:', error)
        throw error
    }

    return data || []
}

/**
 * Obtiene un subgénero por ID
 */
export async function getSubgeneroById(id_subgenero: number): Promise<SubgeneroConGenero | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('subgeneros_planta')
        .select(`
      *,
      generos_planta (
        id_genero,
        nombre,
        descripcion
      )
    `)
        .eq('id_subgenero', id_subgenero)
        .single()

    if (error) {
        console.error('Error fetching subgenero:', error)
        return null
    }

    return data
}

/**
 * Crea un nuevo subgénero
 */
export async function createSubgenero(data: {
    id_genero: number
    nombre: string
    descripcion?: string
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Usuario no autenticado' }
        }

        const { data: userData } = await supabase
            .from('users')
            .select('id_tenant')
            .eq('id_user', user.id)
            .single()

        if (!userData) {
            return { success: false, error: 'Usuario no encontrado' }
        }

        const { error } = await supabase
            .from('subgeneros_planta')
            .insert({
                id_tenant: userData.id_tenant,
                ...data
            })

        if (error) {
            console.error('Error creating subgenero:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/catalogos/generos')
        return { success: true }
    } catch (err) {
        console.error('Error in createSubgenero:', err)
        return { success: false, error: 'Error al crear subgénero' }
    }
}

/**
 * Actualiza un subgénero
 */
export async function updateSubgenero(
    id_subgenero: number,
    data: { nombre: string; descripcion?: string }
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('subgeneros_planta')
            .update(data)
            .eq('id_subgenero', id_subgenero)

        if (error) {
            console.error('Error updating subgenero:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/catalogos/generos')
        return { success: true }
    } catch (err) {
        console.error('Error in updateSubgenero:', err)
        return { success: false, error: 'Error al actualizar subgénero' }
    }
}

/**
 * Elimina un subgénero
 */
export async function deleteSubgenero(id_subgenero: number): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('subgeneros_planta')
            .delete()
            .eq('id_subgenero', id_subgenero)

        if (error) {
            console.error('Error deleting subgenero:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/catalogos/generos')
        return { success: true }
    } catch (err) {
        console.error('Error in deleteSubgenero:', err)
        return { success: false, error: 'Error al eliminar subgénero' }
    }
}

/**
 * Cuenta cuántos subgéneros tiene un género
 */
export async function countSubgenerosByGenero(id_genero: number): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from('subgeneros_planta')
        .select('*', { count: 'exact', head: true })
        .eq('id_genero', id_genero)

    if (error) {
        console.error('Error counting subgeneros:', error)
        return 0
    }

    return count || 0
}
