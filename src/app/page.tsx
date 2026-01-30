import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from './(marketing)/page'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Verificar si el setup está completado
    const { data: userData, error: setupError } = await supabase
      .from('users')
      .select('tenants(setup_completed)')
      .eq('id_user', user.id)
      .single()

    if (setupError) {
      console.warn('Error checking setup status:', setupError.message)
      // Si hay error (columna no existe), mandamos a onboarding para que el wizard guíe al usuario
      redirect('/onboarding')
    }

    const tenants = userData?.tenants as unknown as { setup_completed: boolean }
    const setupCompleted = tenants?.setup_completed

    if (!setupCompleted) {
      redirect('/onboarding')
    }

    redirect('/dashboard')
  }

  return <LandingPage />
}
