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

  redirect('/dashboard')
}

export async function registerAction(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    redirect('/register?error=registration_failed')
  }

  redirect('/login?message=check_email')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}