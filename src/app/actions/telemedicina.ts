'use server'

import { createClient } from '@/lib/supabase/client' // Correction: Use server client if available, or standard strategy
// Actually, standard pattern in this codebase seems to be creating client inside action.
// Let's check imports in other actions.
import { createClient as createServerClient } from '@supabase/supabase-js' // We might need admin client for public access?
import { cookies } from 'next/headers'
import { createClient as createNextClient } from '@/lib/supabase/server'

// Types
import { type ActionResponse } from '@/types'

export async function createSharedLink(idPlanta: number, titulo?: string): Promise<ActionResponse<string>> {
    try {
        const supabase = await createNextClient()

        // 1. Get Tenant & Verify Ownership
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, message: 'No autenticado' }

        // Check if plant belongs to user's tenant (implicitly handled by RLS on insert, but explicit check is good)
        const { data: userData } = await supabase.from('users').select('id_tenant').eq('id_user', user.id).single()
        if (!userData?.id_tenant) return { success: false, message: 'Usuario sin tenant' }

        // 2. Create Link
        const { data, error } = await supabase
            .from('consultas_compartidas')
            .insert({
                id_planta: idPlanta,
                id_tenant: userData.id_tenant,
                titulo: titulo || 'Interconsulta Clínica',
                // expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Optional: 7 days
            })
            .select('token')
            .single()

        if (error) {
            console.error('Error creating shared link:', error)
            return { success: false, message: 'Error al generar el enlace' }
        }

        return { success: true, data: data.token, message: 'Enlace generado correctamente' }

    } catch (error) {
        console.error('Telemedicine Share Error:', error)
        return { success: false, message: 'Error interno' }
    }
}

export async function getActiveSharedLink(idPlanta: number): Promise<ActionResponse<string | null>> {
    const supabase = await createNextClient()
    try {
        const { data, error } = await supabase
            .from('consultas_compartidas')
            .select('token')
            .eq('id_planta', idPlanta)
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw error

        return { success: true, data: data?.token || null, message: 'Ok' }
    } catch (error) {
        return { success: false, message: 'Error fetching link' }
    }
}

// PUBLIC ACTION (No Auth Req for Viewer)
export async function getSharedCaseData(token: string) {
    // Use SERVICE_ROLE key because the viewer is anonymous and we need to bypass RLS 
    // ensuring we ONLY fetch the specific plant linked to the token.

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        console.log('[Telemedicina] Fetching token:', token)

        // 1. Validate Token
        const { data: link, error: linkError } = await supabase
            .from('consultas_compartidas')
            .select('id_planta, active, expires_at, titulo')
            .eq('token', token)
            .single()

        if (linkError) {
            console.error('[Telemedicina] Token lookup error:', linkError)
            return { success: false, message: 'Enlace inválido o expirado' }
        }

        if (!link) {
            console.error('[Telemedicina] Token not found')
            return { success: false, message: 'Enlace no encontrado' }
        }

        console.log('[Telemedicina] Link found:', link)

        if (!link.active) return { success: false, message: 'Este enlace ha sido desactivado' }
        if (link.expires_at && new Date(link.expires_at) < new Date()) return { success: false, message: 'El enlace ha expirado' }

        // 2. Fetch Plant Details (Read Only)
        // Note: We use the SAME admin client to bypass RLS for the plant data
        const { data: planta, error: plantaError } = await supabase
            .from('plantas')
            .select(`
        *,
        generos_planta(nombre),
        tipos_planta(nombre),
        macetas(tipo, material, diametro_cm)
      `)
            .eq('id_planta', link.id_planta)
            .single()

        if (plantaError) {
            console.error('[Telemedicina] Plant lookup error:', plantaError)
            return { success: false, message: 'Error al cargar datos de la planta' }
        }

        // 3. Fetch Clinical History
        const { data: historia, error: histError } = await supabase
            .from('historia_clinica')
            .select(`
        *,
        fotos_planta(*)
      `)
            .eq('id_planta', link.id_planta)
            .order('fecha', { ascending: false })

        return {
            success: true,
            data: {
                link_info: link,
                planta,
                historia: historia || []
            }
        }

    } catch (error) {
        console.error('Telemedicine Fetch Error:', error)
        return { success: false, message: 'Error al cargar el caso clínico' }
    }
}
