'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateTenantSetup(formData: FormData) {
    const supabase = await createClient()

    const nurseryName = formData.get('nurseryName') as string
    const setupCompleted = formData.get('setupCompleted') === 'true'

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    // Obtener el id_tenant del usuario
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (userError || !userData) {
        throw new Error('No se pudo encontrar el tenant del usuario')
    }

    const { error } = await supabase
        .from('tenants')
        .update({
            nombre: nurseryName || undefined,
            nursery_name: nurseryName || undefined,
            setup_completed: setupCompleted
        })
        .eq('id_tenant', userData.id_tenant)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
    revalidatePath('/dashboard')

    if (setupCompleted) {
        redirect('/dashboard')
    }
}

export async function getTenantStatus() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Intento 1: Todo el conjunto de campos
    const query = supabase
        .from('users')
        .select('tenants(nombre, setup_completed, nursery_name)')
        .eq('id_user', user.id)
        .single()

    const { data, error } = await query

    if (error) {
        console.warn('Error fetching detailed tenant status (possibly missing columns):', error.message)

        // Intento 2: Solo campos básicos si el anterior falló (probablemente PGRST204)
        const { data: basicData, error: basicError } = await supabase
            .from('users')
            .select('tenants(nombre)')
            .eq('id_user', user.id)
            .single()

        if (basicError || !basicData) return null

        const tenants = basicData.tenants as unknown as { nombre: string }
        return {
            nombre: tenants?.nombre,
            setup_completed: false, // Asumimos false si la columna no existe
            nursery_name: tenants?.nombre
        }
    }

    return data.tenants as unknown as { nombre: string, setup_completed: boolean, nursery_name: string }
}

export async function getUserProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('users')
        .select('nombre')
        .eq('id_user', user.id)
        .single()

    if (error || !data) return null

    return data
}

export async function bulkSetupCategories(data: {
    nurseryName: string,
    userName?: string,
    generos: string[],
    macetas: {
        tipo: string,
        material: string,
        diametro_cm?: number,
        altura_cm?: number,
        volumen_lts?: number,
        diametro_unidad?: string,
        altura_unidad?: string,
        volumen_unidad?: string
    }[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) throw new Error('Tenant no encontrado')
    const tenant_id = userData.id_tenant

    // 0. Actualizar nombre del usuario si se proporcionó (fallback)
    if (data.userName) {
        const { error: userError } = await supabase
            .from('users')
            .update({ nombre: data.userName })
            .eq('id_user', user.id)

        if (userError) {
            console.error('Error updating user name during onboarding:', userError)
        }
    }

    // 1. Actualizar nombre del tenant
    const { error: tenantError } = await supabase
        .from('tenants')
        .update({
            nombre: data.nurseryName,
            nursery_name: data.nurseryName,
            setup_completed: true
        })
        .eq('id_tenant', tenant_id)

    if (tenantError) {
        console.error('CRITICAL: Error updating tenant during onboarding:', tenantError)
        // Si el error es PGRST204, es falta de columnas
        if (tenantError.code === 'PGRST204') {
            throw new Error('Faltan columnas en la tabla tenants (nursery_name o setup_completed). Por favor ejecuta el SQL de migración.')
        }
        throw new Error(`Error en el servidor (Tenant): ${tenantError.message} (Código: ${tenantError.code})`)
    }

    // 2. Crear géneros seleccionados (con ON CONFLICT para evitar errores si ya existen)
    if (data.generos.length > 0) {
        const generosToInsert = data.generos.map(nombre => ({
            nombre,
            id_tenant: tenant_id
        }))
        const { error: genError } = await supabase
            .from('generos_planta')
            .upsert(generosToInsert, { onConflict: 'id_tenant,nombre' })

        if (genError) {
            console.error('Error inserting generos (upsert):', genError)
        }
    }

    // 3. Crear macetas seleccionadas
    if (data.macetas.length > 0) {
        const macetasToInsert = data.macetas.map(m => ({
            ...m,
            id_tenant: tenant_id
        }))
        const { error: macError } = await supabase
            .from('macetas')
            .insert(macetasToInsert)

        if (macError) {
            console.error('Error inserting macetas:', macError)
        }
    }

    revalidatePath('/')
    revalidatePath('/dashboard')

    return { success: true }
}
