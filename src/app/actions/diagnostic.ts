'use server'

import { createClient } from '@/lib/supabase/server'

export async function diagnoseOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, message: 'No autenticado en Supabase Auth' }

    const results: Record<string, unknown> = {
        auth: { ok: true, email: user.email, id: user.id },
        userTable: { ok: false },
        tenantTable: { ok: false },
        columns: { ok: false },
        rls: { ok: false }
    }

    // 1. Verificar tabla users
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (userError) {
        results.userTable = { ok: false, error: userError }
    } else if (userData) {
        results.userTable = { ok: true, id_tenant: userData.id_tenant }
    }

    if (!userData?.id_tenant) return { success: false, results, message: 'El usuario no tiene un Tenant asociado en la tabla public.users' }

    // 2. Verificar existencia de columnas en tenants
    const { data: tenantData, error: tenantFetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id_tenant', userData.id_tenant)
        .single()

    if (tenantFetchError) {
        results.tenantTable = { ok: false, error: tenantFetchError }
    } else {
        results.tenantTable = { ok: true }
        results.columns = {
            setup_completed: 'setup_completed' in tenantData,
            nursery_name: 'nursery_name' in tenantData
        }
    }

    // 3. Probar actualización (simulada o real corta)
    const { error: updateError } = await supabase
        .from('tenants')
        .update({ nombre: tenantData?.nombre }) // Update trivial para probar RLS
        .eq('id_tenant', userData.id_tenant)

    if (updateError) {
        results.rls = { ok: false, error: updateError }
    } else {
        results.rls = { ok: true }
    }

    return { success: true, results }
}
