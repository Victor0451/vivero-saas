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
    severidad?: 'baja' | 'media' | 'alta' | 'critica'
    id_maceta_nueva?: number
    // Campos virtuales para la UI refactorizada
    selected_photo_ids?: number[]
    recordatorio?: {
        fecha: string
        titulo: string
    }
}

export type UpdateHistoriaClinicaData = {
    fecha?: string
    descripcion?: string
    tratamiento?: string
    tipo_evento?: string
    estuvo_enferma?: boolean
    severidad?: 'baja' | 'media' | 'alta' | 'critica'
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
                ),
                fotos_planta (*),
                tareas (*)
            `)
            .eq('id_planta', idPlanta)
            .order('fecha', { ascending: false })
            .order('id_historia', { ascending: false })

        if (error) {
            throw new Error(`Error al obtener historial clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }

        return (data as unknown as HistoriaClinica[]) || []
    } catch (error) {
        console.error('Error en getHistoriaClinicaByPlanta:', error)
        throw error
    }
}

// ... (getAllHistoriaClinicaWithPlantas remains same) ...

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
            .order('id_historia', { ascending: false })

        if (error) {
            throw new Error(`Error al obtener historial clínico global: ${error instanceof Error ? error.message : 'Error desconocido'}`)
        }

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
            .select(`
                *,
                fotos_planta (*),
                tareas (*)
            `)
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

// ... imports ...

// ... (CreateHistoriaClinicaData and other type definitions) ...

// ... (getHistoriaClinicaByPlanta, getAll, getById implementation) ...

export async function createHistoriaClinica(data: CreateHistoriaClinicaData): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
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

        // 1. Manejo de cambio de maceta (Transplante)
        if (data.id_maceta_nueva) {
            const { data: currentPlanta } = await supabase
                .from('plantas')
                .select('id_maceta, macetas (*)')
                .eq('id_planta', data.id_planta)
                .single()

            if (currentPlanta?.id_maceta !== data.id_maceta_nueva) {
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

                    if (newMaceta) {
                        const oldMacetaLabel = currentPlanta?.macetas ? formatMacetaLabel(currentPlanta.macetas as unknown as Maceta) : 'Sin maceta';
                        const newMacetaLabel = formatMacetaLabel(newMaceta as unknown as Maceta);

                        data.descripcion += `\n\n[Transplante] Cambio de maceta: ${oldMacetaLabel} ➜ ${newMacetaLabel}`;
                    }
                }
            }
        }

        // 2. Crear el registro clínico
        const { data: newHistoria, error } = await supabase
            .from('historia_clinica')
            .insert({
                id_planta: data.id_planta,
                fecha: data.fecha,
                descripcion: data.descripcion,
                tratamiento: data.tratamiento,
                tipo_evento: data.tipo_evento,
                estuvo_enferma: data.estuvo_enferma,
                severidad: data.severidad,
                id_tenant: userData.id_tenant,
            })
            .select()
            .single()

        if (error || !newHistoria) {
            console.error('Error de Supabase al crear registro clínico:', error)
            return {
                success: false,
                message: `Error al crear el registro clínico: ${error ? error.message : 'Error desconocido'}`
            }
        }

        const promises = []

        // 3. Vincular fotos
        if (data.selected_photo_ids && data.selected_photo_ids.length > 0) {
            promises.push(
                supabase
                    .from('fotos_planta')
                    .update({ id_historia: newHistoria.id_historia })
                    .in('id_foto', data.selected_photo_ids)
            )
        }

        // 4. Recordatorio
        if (data.recordatorio) {
            promises.push(
                supabase
                    .from('tareas')
                    .insert({
                        id_planta: data.id_planta,
                        id_historia: newHistoria.id_historia,
                        id_tenant: userData.id_tenant,
                        titulo: data.recordatorio.titulo,
                        descripcion: `Seguimiento generado desde historial clínico: ${data.tipo_evento}`,
                        fecha_programada: data.recordatorio.fecha,
                        completada: false
                    })
            )
            message += ' y recordatorio agendado.'
        }

        if (promises.length > 0) {
            await Promise.all(promises)
        }

        return {
            success: true,
            message: message
        }
    } catch (error: unknown) {
        console.error('Error en createHistoriaClinica:', error)
        return {
            success: false,
            message: `Error al crear el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}

export async function bulkCreateHistoriaClinica(ids: number[], data: CreateHistoriaClinicaData): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData?.user) return { success: false, message: 'Usuario no autenticado' }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id_tenant')
            .eq('id_user', authData.user.id)
            .single()

        if (userError || !userData) return { success: false, message: 'No se pudo obtener el tenant' }

        let successCount = 0
        let transplantCount = 0
        const errors: any[] = []

        // 0. Fetch original photos metadata if present
        let originalPhotos: any[] = []
        if (data.selected_photo_ids && data.selected_photo_ids.length > 0) {
            const { data: photos } = await supabase
                .from('fotos_planta')
                .select('*')
                .in('id_foto', data.selected_photo_ids)

            if (photos) originalPhotos = photos
        }

        const promises = ids.map(async (idPlanta) => {
            // 1. Transplante Check
            if (data.id_maceta_nueva) {
                const { data: currentPlanta } = await supabase
                    .from('plantas')
                    .select('id_maceta')
                    .eq('id_planta', idPlanta)
                    .single()

                if (currentPlanta?.id_maceta !== data.id_maceta_nueva) {
                    await supabase.from('plantas').update({ id_maceta: data.id_maceta_nueva }).eq('id_planta', idPlanta)
                    transplantCount++
                }
            }

            // 2. Insert Record
            const { data: newHistoria, error } = await supabase
                .from('historia_clinica')
                .insert({
                    id_planta: idPlanta,
                    fecha: data.fecha,
                    descripcion: data.descripcion + (data.id_maceta_nueva ? `\n[Transplante Masivo] Cambio de maceta realizado.` : ''),
                    tratamiento: data.tratamiento,
                    tipo_evento: data.tipo_evento,
                    estuvo_enferma: data.estuvo_enferma,
                    severidad: data.severidad,
                    id_tenant: userData.id_tenant,
                })
                .select('id_historia')
                .single()

            if (error || !newHistoria) throw error

            // 3. Link Photos (Update or Clone)
            if (originalPhotos.length > 0) {
                // Determine if this plant is the "primary" owner of the photos (e.g. the first one selected where photos were uploaded)
                // We use data.id_planta (which comes from the form as the photo context) to check ownership.
                // However, comparison might be tricky if data.id_planta changes. 
                // Strategy: Check if the original photos belong to THIS idPlanta.

                const photosBelongToThisPlant = originalPhotos[0].id_planta === idPlanta

                if (photosBelongToThisPlant) {
                    // Update existing rows
                    await supabase
                        .from('fotos_planta')
                        .update({ id_historia: newHistoria.id_historia })
                        .in('id_foto', data.selected_photo_ids!)
                } else {
                    // Clone rows for other plants
                    const newPhotoRows = originalPhotos.map(p => ({
                        id_planta: idPlanta,
                        id_historia: newHistoria.id_historia,
                        url: p.url,
                        storage_path: p.storage_path,
                        notas: p.notas,
                        es_principal: p.es_principal,
                        id_tenant: userData.id_tenant
                    }))

                    await supabase.from('fotos_planta').insert(newPhotoRows)
                }
            }

            // 4. Reminder
            if (data.recordatorio) {
                await supabase.from('tareas').insert({
                    id_planta: idPlanta,
                    id_historia: newHistoria.id_historia,
                    id_tenant: userData.id_tenant,
                    titulo: data.recordatorio.titulo,
                    descripcion: `Seguimiento masivo: ${data.tipo_evento}`,
                    fecha_programada: data.recordatorio.fecha,
                    completada: false
                })
            }
        })

        const results = await Promise.allSettled(promises)

        results.forEach(res => {
            if (res.status === 'fulfilled') successCount++
            else errors.push(res.reason)
        })

        if (successCount === 0 && errors.length > 0) {
            return { success: false, message: 'Error al registrar eventos' }
        }

        let message = `Evento registrado en ${successCount} plantas.`
        if (transplantCount > 0) message += ` ${transplantCount} transplantes realizados.`

        return { success: true, message }

    } catch (error: unknown) {
        console.error('Error en bulkCreateHistoriaClinica:', error)
        return { success: false, message: 'Error interno en acción masiva' }
    }
}

export async function updateHistoriaClinica(id: number, data: UpdateHistoriaClinicaData): Promise<ActionResponse> {
    // ... (same as original)
    const supabase = await createClient()

    try {
        let message = 'Registro clínico actualizado exitosamente'

        // Si hay cambio de maceta, actualizar la planta
        if (data.id_maceta_nueva && data.tipo_evento === 'Transplante') {
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
                estuvo_enferma: data.estuvo_enferma,
                severidad: data.severidad
            })
            .eq('id_historia', id)

        if (error) {
            return {
                success: false,
                message: `Error al actualizar el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
            }
        }

        return {
            success: true,
            message: message
        }
    } catch (error: unknown) {
        console.error('Error en updateHistoriaClinica:', error)
        return {
            success: false,
            message: `Error al actualizar el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
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
