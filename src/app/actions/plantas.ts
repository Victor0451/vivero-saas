'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PlantaConDetalles, ActionResponse } from '@/types'
import { PLANS, PlanType } from '@/config/plans'

// Tipos para las funciones
export type CreatePlantaData = {
  nombre: string
  id_tipo: number
  id_genero: number
  id_maceta?: number
  fecha_compra?: string
  fecha_transplante?: string
  iluminacion?: string
  esta_enferma: boolean
  esta_muerta: boolean
  observaciones?: string
  image_url?: string
}

export type UpdatePlantaData = Partial<CreatePlantaData>

export async function getPlantas(): Promise<PlantaConDetalles[]> {
  const supabase = await createClient()

  try {
    // Query con joins
    const { data, error } = await supabase
      .from('plantas')
      .select(`
        *,
        tipos_planta(id_tipo, nombre),
        generos_planta(id_genero, nombre),
        subgeneros_planta(id_subgenero, nombre),
        macetas(id_maceta, tipo, material)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      // Si falla el join, intentar sin joins (fallback)
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('plantas')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (fallbackError) {
        throw new Error(`Error incluso sin joins: ${fallbackError.message}`)
      }

      return (fallbackData || []).map(planta => ({
        ...planta,
        tipos_planta: null,
        generos_planta: null,
        macetas: null
      }))
    }

    return data || []
  } catch (error) {
    throw error
  }
}

export async function getPlantaById(id: number): Promise<PlantaConDetalles | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('plantas')
      .select(`
        *,
        tipos_planta(id_tipo, nombre),
        generos_planta(id_genero, nombre),
        macetas(id_maceta, tipo, material)
      `)
      .eq('id_planta', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching planta by id:', error)
      throw new Error('Error al obtener la planta')
    }

    return data
  } catch (error) {
    console.error('Exception in getPlantaById:', error)
    throw new Error('Error al obtener la planta')
  }
}

export async function getPlantaByIdWithResponse(id: number): Promise<ActionResponse<PlantaConDetalles>> {
  try {
    const data = await getPlantaById(id)

    if (!data) {
      return {
        success: false,
        message: 'Planta no encontrada'
      }
    }

    return {
      success: true,
      data,
      message: 'Planta obtenida correctamente'
    }
  } catch (error) {
    console.error('Error getting planta by id:', error)
    return {
      success: false,
      message: 'Error al obtener la planta'
    }
  }
}

export async function createPlanta(data: CreatePlantaData): Promise<ActionResponse> {
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

    const tenantId = userData.id_tenant

    // 🔍 VERIFICAR LÍMITE DE PLAN
    // 1. Obtener el plan del tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('plan')
      .eq('id_tenant', tenantId)
      .single()

    // Default a semilla si no hay plan definido
    const planName = (tenantData?.plan as PlanType) || 'semilla'
    const planConfig = PLANS[planName] || PLANS['semilla']

    // 2. Si el límite no es infinito, verificar cantidad actual
    if (planConfig.maxPlants !== Infinity) {
      const { count, error: countError } = await supabase
        .from('plantas')
        .select('*', { count: 'exact', head: true })
        .eq('id_tenant', tenantId)
        .is('deleted_at', null)

      if (countError) {
        console.error('Error counting plants:', countError)
        return { success: false, message: 'Error al verificar límites del plan' }
      }

      if ((count || 0) >= planConfig.maxPlants) {
        return {
          success: false,
          message: `Has alcanzado el límite de ${planConfig.maxPlants} plantas de tu plan ${planConfig.displayName}. Actualiza a Brote para ilimitadas.`
        }
      }
    }

    const { error } = await supabase
      .from('plantas')
      .insert({
        nombre: data.nombre,
        id_tipo: data.id_tipo,
        id_genero: data.id_genero,
        id_maceta: data.id_maceta,
        id_tenant: tenantId,
        fecha_compra: data.fecha_compra,
        fecha_transplante: data.fecha_transplante,
        iluminacion: data.iluminacion,
        esta_enferma: data.esta_enferma,
        esta_muerta: data.esta_muerta,
        observaciones: data.observaciones,
        image_url: data.image_url,
      })

    if (error) {
      console.error('Error de Supabase al crear planta:', error)
      return {
        success: false,
        message: `Error al crear la planta: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    revalidatePath('/plantas', 'page')
    return {
      success: true,
      message: 'Planta creada exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en createPlanta:', error)
    return {
      success: false,
      message: `Error al crear la planta: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function updatePlanta(id: number, data: UpdatePlantaData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('plantas')
      .update({
        nombre: data.nombre,
        id_tipo: data.id_tipo,
        id_genero: data.id_genero,
        id_maceta: data.id_maceta,
        fecha_compra: data.fecha_compra,
        fecha_transplante: data.fecha_transplante,
        iluminacion: data.iluminacion,
        esta_enferma: data.esta_enferma,
        esta_muerta: data.esta_muerta,
        observaciones: data.observaciones,
        image_url: data.image_url,
      })
      .eq('id_planta', id)

    if (error) {
      return {
        success: false,
        message: `Error al actualizar la planta: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    revalidatePath('/plantas', 'page')
    return {
      success: true,
      message: 'Planta actualizada exitosamente'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error al actualizar la planta: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function softDeletePlanta(id: number): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('plantas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id_planta', id)

    if (error) {
      return {
        success: false,
        message: `Error al eliminar la planta: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    return {
      success: true,
      message: 'Planta eliminada exitosamente'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error al eliminar la planta: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

export async function bulkUpdatePlantasStatus(
  ids: number[],
  status: 'normal' | 'enferma' | 'muerta'
): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const updateData = {
      esta_enferma: status === 'enferma',
      esta_muerta: status === 'muerta'
    }

    const { error } = await supabase
      .from('plantas')
      .update(updateData)
      .in('id_planta', ids)

    if (error) {
      return {
        success: false,
        message: `Error en actualización masiva: ${error.message}`
      }
    }

    revalidatePath('/plantas', 'page')
    return {
      success: true,
      message: `${ids.length} plantas actualizadas a estado ${status}`
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error en actualización masiva: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

export async function bulkSoftDeletePlantas(ids: number[]): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('plantas')
      .update({ deleted_at: new Date().toISOString() })
      .in('id_planta', ids)

    if (error) {
      return {
        success: false,
        message: `Error en eliminación masiva: ${error.message}`
      }
    }

    revalidatePath('/plantas', 'page')
    return {
      success: true,
      message: `${ids.length} plantas eliminadas`
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error en eliminación masiva: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

// Funciones auxiliares para obtener datos de los selects
export async function getTiposPlanta() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('tipos_planta')
      .select('id_tipo, nombre')
      .order('nombre')

    if (error) {
      throw new Error(`Error al obtener los tipos de planta: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}