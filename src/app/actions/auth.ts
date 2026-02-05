'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validar que los campos no estén vacíos
  if (!email || !password) {
    redirect('/login?error=missing_fields')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    redirect('/login?error=invalid_credentials')
  }

  // Verificar que la sesión se haya creado correctamente
  if (!data.session) {
    console.error('No session created after login')
    redirect('/login?error=session_error')
  }
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'
  redirect(redirectTo)
}

export async function registerAction(formData: FormData) {
  // ⛔ REGISTRO DESHABILITADO TEMPORALMENTE
  redirect('/login?error=registration_closed')

  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre = formData.get('nombre') as string

  if (!email || !password || !nombre) {
    redirect('/register?error=missing_fields')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: nombre,
      }
    }
  })

  if (error) {
    console.error('Registration error:', error?.message)
    redirect('/register?error=registration_failed')
  }

  // Si el usuario se creó exitosamente (y no hay confirmación de email pendiente que bloquee el ID)
  // intentamos crear el perfil básico. Nota: Supabase puede estar configurado para auto-confirmar.
  if (data.user) {
    // Intentamos crear un tenant por defecto si es el primer usuario, 
    // o simplemente crear el perfil. En este SaaS, el onboarding se encarga de configurar el tenant.
    // Pero necesitamos un id_tenant para que RLS funcione.

    // Primero, creamos un tenant vacío para este nuevo usuario
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        nombre: 'Mi Vivero',
        plan: 'free',
        activo: true
      })
      .select()
      .single()

    if (!tenantError && tenant) {
      // Creamos el registro en public.users
      await supabase
        .from('users')
        .insert({
          id_user: data.user!.id,
          id_tenant: tenant.id_tenant,
          nombre: nombre,
          rol: 'admin',
          activo: true
        })
    }
  }

  redirect('/login?message=check_email')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function loginDemoAction(formData: FormData) {
  const supabase = await createClient()

  // Credenciales Hardcodeadas para la Demo (En producción usar ENV vars)
  const email = 'demo@vivero.com'
  const password = 'demo12345678' // Contraseña de muestra

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.session) {
    console.error('Demo login error:', error?.message)
    redirect('/login?error=demo_unavailable')
  }

  // Verificar si ya está expirado o algo así? No, Supabase maneja eso.
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'
  redirect(redirectTo)
}