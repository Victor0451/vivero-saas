import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeatureLocked } from '@/components/feature-locked'
import { PLANS, PlanType } from '@/config/plans'
import TareasClient from './tareas-client'

export default async function TareasPage() {
    const supabase = await createClient()

    // 1. Obtener usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Obtener tenant y plan
    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) redirect('/login')

    const { data: tenantData } = await supabase
        .from('tenants')
        .select('plan')
        .eq('id_tenant', userData.id_tenant)
        .single()

    const userPlan = (tenantData?.plan as PlanType) || 'semilla'

    // 3. Verificar acceso (Bloquear si es Semilla)
    if (userPlan === 'semilla') {
        return (
            <FeatureLocked
                title="Gestión de Tareas"
                description="La programación de tareas, alertas de riego y seguimiento de actividades están reservadas para planes profesionales."
                minPlan="Brote"
            />
        )
    }

    return <TareasClient />
}
