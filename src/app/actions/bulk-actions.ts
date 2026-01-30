'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ActionResponse } from '@/types'

export async function bulkWatering(ids: number[]): Promise<ActionResponse> {
    const supabase = await createClient()

    try {
        // 1. Get current tenant
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

        // 2. Prepare history records
        const today = new Date().toISOString().split('T')[0]
        const historyRecords = ids.map(idPlanta => ({
            id_planta: idPlanta,
            id_tenant: userData.id_tenant,
            fecha: today,
            descripcion: 'Riego masivo detectado.',
            tipo_evento: 'Riego',
            estuvo_enferma: false
        }))

        // 3. Batch insert
        const { error } = await supabase
            .from('historia_clinica')
            .insert(historyRecords)

        if (error) {
            console.error('Error in bulk watering:', error)
            return { success: false, message: `Error al registrar riegos: ${error.message}` }
        }

        revalidatePath('/plantas', 'page')
        return {
            success: true,
            message: `Riego registrado para ${ids.length} plantas`
        }
    } catch (error: unknown) {
        console.error('Exception in bulkWatering:', error)
        return {
            success: false,
            message: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }
    }
}
