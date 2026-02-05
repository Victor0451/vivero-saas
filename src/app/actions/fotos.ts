'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ActionResponse, FotoPlanta } from '@/types'

export async function uploadFotoPlanta(
    idPlanta: number,
    formData: FormData
): Promise<ActionResponse<FotoPlanta>> {
    try {
        const supabase = await createClient()

        // 1. Get current tenant
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: 'No autenticado' }
        }

        const { data: tenantData } = await supabase
            .from('users')
            .select('id_tenant')
            .eq('id_user', user.id)
            .single()

        if (!tenantData?.id_tenant) {
            return { success: false, message: 'Usuario no asociado a un tenant' }
        }

        const file = formData.get('file') as File
        const fecha = formData.get('fecha') as string || new Date().toISOString()
        const notas = formData.get('notas') as string
        const esPrincipal = formData.get('es_principal') === 'true'

        if (!file) {
            return { success: false, message: 'No se ha seleccionado ningún archivo' }
        }

        // 2. Upload to Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${tenantData.id_tenant}/${idPlanta}/${Date.now()}.${fileExt}`
        const bucketName = 'plantas'

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file)

        if (uploadError) {
            console.error('Error uploading file:', uploadError)
            return { success: false, message: 'Error al subir la imagen' }
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName)

        // 3. Insert into Database
        const { data, error: dbError } = await supabase
            .from('fotos_planta')
            .insert({
                id_planta: idPlanta,
                id_tenant: tenantData.id_tenant,
                url: publicUrl,
                storage_path: fileName,
                fecha: fecha,
                notas: notas,
                es_principal: esPrincipal
            })
            .select()
            .single()

        if (dbError) {
            console.error('Error saving photo metadata:', dbError)
            // Attempt cleanup (optional but good practice)
            await supabase.storage.from(bucketName).remove([fileName])
            return { success: false, message: 'Error al guardar información de la foto' }
        }

        revalidatePath(`/plantas/${idPlanta}`)
        revalidatePath('/plantas')

        return {
            success: true,
            data: data as FotoPlanta,
            message: 'Foto subida correctamente'
        }

    } catch (error) {
        console.error('Error in uploadFotoPlanta:', error)
        return { success: false, message: 'Error interno del servidor' }
    }
}

export async function getFotosPlanta(idPlanta: number): Promise<FotoPlanta[]> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('fotos_planta')
            .select('*')
            .eq('id_planta', idPlanta)
            .order('fecha', { ascending: false })

        if (error) {
            console.error('Error fetching plant photos:', error)
            return []
        }

        return data as FotoPlanta[]
    } catch (error) {
        console.error('Error in getFotosPlanta:', error)
        return []
    }
}

export async function deleteFotoPlanta(idFoto: number, storagePath: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient()

        // 1. Delete from Storage
        const { error: storageError } = await supabase.storage
            .from('plantas')
            .remove([storagePath])

        if (storageError) {
            console.error('Error removing file from storage:', storageError)
            // We continue even if storage delete fails to keep DB clean
        }

        // 2. Delete from Database
        const { error: dbError } = await supabase
            .from('fotos_planta')
            .delete()
            .eq('id_foto', idFoto)

        if (dbError) {
            console.error('Error deleting photo record:', dbError)
            return { success: false, message: 'Error al eliminar el registro de la foto' }
        }

        revalidatePath('/plantas')
        return { success: true, message: 'Foto eliminada correctamente' }
    } catch (error) {
        console.error('Error in deleteFotoPlanta:', error)
        return { success: false, message: 'Error interno del servidor' }
    }
}

export async function setFotoPrincipal(idFoto: number, idPlanta: number): Promise<ActionResponse> {
    try {
        const supabase = await createClient()

        // The trigger in the database handles unsetting other flags and updating the cache
        const { error } = await supabase
            .from('fotos_planta')
            .update({ es_principal: true })
            .eq('id_foto', idFoto)

        if (error) {
            console.error('Error setting main photo:', error)
            return { success: false, message: 'Error al actualizar foto principal' }
        }

        revalidatePath(`/plantas/${idPlanta}`)
        revalidatePath('/plantas')

        return { success: true, message: 'Foto principal actualizada' }
    } catch (error) {
        console.error('Error in setFotoPrincipal:', error)
        return { success: false, message: 'Error interno del servidor' }
    }
}
