import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile-form'
import { PageHeader } from '@/components/page-header'

async function getUserProfile() {
  const supabase = await createClient()

  // Obtener datos del usuario autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Obtener datos adicionales del perfil desde public.users
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('nombre, avatar_url, rol, id_tenant')
    .eq('id_user', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  return {
    id: user.id,
    email: user.email || '',
    nombre: profile?.nombre || '',
    avatar_url: profile?.avatar_url || '',
    rol: profile?.rol || 'usuario'
  }
}

export default async function ProfilePage() {
  const userProfile = await getUserProfile()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Perfil de Usuario"
        description="Administra tu información personal y preferencias"
      />

      <div className="max-w-2xl">
        <ProfileForm initialData={userProfile} />
      </div>
    </div>
  )
}
