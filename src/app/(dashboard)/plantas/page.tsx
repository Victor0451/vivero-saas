import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeatureLocked } from '@/components/feature-locked'
import { PLANS, PlanType } from '@/config/plans'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { Plus } from 'lucide-react'
import { PlantasContent } from '../../../components/plantas-content'
import { getPlantas } from '@/app/actions/plantas'
import { getGeneros } from '@/app/actions/generos'
import { getSubgeneros } from '@/app/actions/subgeneros'

export default async function PlantasPage() {
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
        title="Inventario Avanzado"
        description="La gestión visual del inventario, filtros avanzados y exportación están reservados para planes profesionales."
        minPlan="Brote"
      />
    )
  }

  const [initialPlantas, generos, subgeneros] = await Promise.all([
    getPlantas(),
    getGeneros(),
    getSubgeneros(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plantas"
        description="Gestiona tu colección de plantas"
      >
        <Button className="gap-2" form="planta-form">
          <Plus className="h-4 w-4" />
          Nueva Planta
        </Button>
      </PageHeader>

      <Suspense fallback={<div>Cargando plantas...</div>}>
        <PlantasContent
          initialPlantas={initialPlantas}
          generos={generos}
          subgeneros={subgeneros}
        />
      </Suspense>
    </div>
  )
}