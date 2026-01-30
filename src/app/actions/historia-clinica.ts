'use server'

import { createClient } from '@/lib/supabase/server'
import type { HistoriaClinica, ActionResponse, Maceta } from '@/types'

function formatMacetaLabel(maceta: Maceta) {
    const parts = [maceta.tipo];
    if (maceta.material) parts.push(maceta.material);

    const dims = [];
    if (maceta.diametro_cm) dims.push(`Ø${maceta.diametro_cm}cm`);
    if (maceta.altura_cm) dims.push(`H${maceta.altura_cm}cm`);
    if (dims.length > 0) parts.push(`(${dims.join(' x ')})`);

    if (maceta.volumen_lts) parts.push(`${maceta.volumen_lts}L`);

    return parts.join(' - ');
}

// Tipos para historial clínico
export type CreateHistoriaClinicaData = {
    id_planta: number
    fecha: string
    descripcion: string
    tratamiento?: string
    tipo_evento?: string
    estuvo_enferma: boolean
    id_maceta_nueva?: number
}

export type UpdateHistoriaClinicaData = {
    fecha?: string
    descripcion?: string
    tratamiento?: string
    tipo_evento?: string
    estuvo_enferma?: boolean
    id_maceta_nueva?: number
}

export async function getHistoriaClinicaByPlanta(idPlanta: number): Promise<HistoriaClinica[]> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('historia_clinica')
            .select(`
                *,
                plantas (
                    id_planta,
                    nombre,
                    id_genero,
                    id_maceta
                )
            `)
            .eq('id_planta', idPlanta)
            .order('fecha', { ascending: false })

        if (error) {
            throw new Error(`Error al obtener historial clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }

        return (data as unknown as HistoriaClinica[]) || []
    } catch (error) {
        console.error('Error en getHistoriaClinicaByPlanta:', error)
        throw error
    }
}

export async function getAllHistoriaClinicaWithPlantas(): Promise<HistoriaClinica[]> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('historia_clinica')
            .select(`
                *,
                plantas (
                    id_planta,
                    nombre
                )
            `)
            .order('fecha', { ascending: false })

        if (error) {
            throw new Error(`Error al obtener historial clínico global: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }

        // Supabase returns relations as objects/arrays. 
        // We cast it to match our type which now includes optional 'plantas' property
        return (data as unknown as HistoriaClinica[]) || []
    } catch (error) {
        console.error('Error en getAllHistoriaClinicaWithPlantas:', error)
        throw error
    }
}

export async function getHistoriaClinicaById(id: number): Promise<HistoriaClinica | null> {
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('historia_clinica')
            .select('*')
            .eq('id_historia', id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return null
            }
            throw new Error('Error al obtener el registro del historial clínico')
        }

        return data
    } catch (error) {
        console.error('Error getting historia clinica by id:', error)
        throw error
    }
}

export async function createHistoriaClinica(data: CreateHistoriaClinicaData): Promise<ActionResponse> {
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

        let message = 'Registro clínico creado exitosamente'

        if (data.id_maceta_nueva) {
            // Verificar si la maceta es diferente antes de actualizar
            const { data: currentPlanta } = await supabase
                .from('plantas')
                .select('id_maceta, macetas (*)')
                .eq('id_planta', data.id_planta)
                .single()

            if (currentPlanta?.id_maceta !== data.id_maceta_nueva) {
                // Obtener detalles de la nueva maceta para el registro
                const { data: newMaceta } = await supabase
                    .from('macetas')
                    .select('*')
                    .eq('id_maceta', data.id_maceta_nueva)
                    .single()

                const { error: plantaError } = await supabase
                    .from('plantas')
                    .update({ id_maceta: data.id_maceta_nueva })
                    .eq('id_planta', data.id_planta)

                if (plantaError) {
                    console.error('Error updating plant pot:', plantaError)
                    message += '. Advertencia: No se pudo actualizar la maceta de la planta.'
                } else {
                    message += ' y se actualizó la maceta de la planta correctamente.'

                    // Agregar registro del cambio a la descripción
                    if (newMaceta) {
                        const oldMacetaLabel = currentPlanta?.macetas ? formatMacetaLabel(currentPlanta.macetas as unknown as Maceta) : 'Sin maceta';
                        const newMacetaLabel = formatMacetaLabel(newMaceta as unknown as Maceta);

                        data.descripcion += `\n\n[Transplante] Cambio de maceta: ${oldMacetaLabel} ➜ ${newMacetaLabel}`;
                    }
                }
            }
        }

        const { error } = await supabase
            .from('historia_clinica')
            .insert({
                id_planta: data.id_planta,
                fecha: data.fecha,
                descripcion: data.descripcion,
                tratamiento: data.tratamiento,
                tipo_evento: data.tipo_evento,
                estuvo_enferma: data.estuvo_enferma,
                id_tenant: userData.id_tenant,
            })

        if (error) {
            console.error('Error de Supabase al crear registro clínico:', error)
            return {
                success: false,
                message: `Error al crear el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }
        }

        // No revalidar páginas dinámicas específicas, dejar que se refresquen naturalmente
        return {
            success: true,
            message: message
        }
    } catch (error: unknown) {
        console.error('Error en createHistoriaClinica:', error)
        return {
            success: false,
            message: `Error al crear el registro clínico: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
        }
    }
}



// ... (getHistoriaClinicaByPlanta, getAll, getById remain same)

export async function updateHistoriaClinica(id: number, data: UpdateHistoriaClinicaData): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        let message = 'Registro clínico actualizado exitosamente'

        // Si hay cambio de maceta, actualizar la planta
        if (data.id_maceta_nueva && data.tipo_evento === 'Transplante') {
            // Primero obtenemos el id_planta del registro histórico
            const { data: historyRecord, error: historyError } = await supabase
                .from('historia_clinica')
                .select('id_planta')
                .eq('id_historia', id)
                .single()

            if (!historyError && historyRecord) {
                const { error: plantaError } = await supabase
                    .from('plantas')
                    .update({ id_maceta: data.id_maceta_nueva })
                    .eq('id_planta', historyRecord.id_planta)

                if (plantaError) {
                    console.error('Error updating plant pot:', plantaError)
                    message += '. Advertencia: No se pudo actualizar la maceta de la planta.'
                } else {
                    message += ' y se actualizó la maceta de la planta correctamente.'
                }
            }
        }

        const { error } = await supabase
            .from('historia_clinica')
            .update({
                fecha: data.fecha,
                descripcion: data.descripcion,
                tratamiento: data.tratamiento,
                tipo_evento: data.tipo_evento,
                estuvo_enferma: data.estuvo_enferma
            })
            .eq('id_historia', id)

        if (error) {
            return {
                success: false,
                message: `Error al actualizar el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }
        }

        // No revalidar páginas dinámicas específicas, dejar que se refresquen naturalmente
        return {
            success: true,
            message: message
        }
    } catch (error: unknown) {
        console.error('Error en updateHistoriaClinica:', error)
        return {
            success: false,
            message: `Error al actualizar el registro clínico: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
        }
    }
}

export async function deleteHistoriaClinica(id: number): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('historia_clinica')
            .delete()
            .eq('id_historia', id)

        if (error) {
            return {
                success: false,
                message: `Error al eliminar el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }
        }

        // No revalidar páginas dinámicas específicas, dejar que se refresquen naturalmente
        return {
            success: true,
            message: 'Registro clínico eliminado exitosamente'
        }
    } catch (error: unknown) {
        console.error('Error en deleteHistoriaClinica:', error)
        return {
            success: false,
            message: `Error al eliminar el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}
