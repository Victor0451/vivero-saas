'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import sharp from 'sharp'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const nombre = formData.get('nombre') as string

  // Validar datos
  if (!nombre || nombre.trim().length === 0) {
    return { success: false, error: 'El nombre es obligatorio' }
  }

  if (nombre.length > 100) {
    return { success: false, error: 'El nombre no puede tener más de 100 caracteres' }
  }

  // Obtener el id_tenant del usuario
  const { data: userData, error: tenantError } = await supabase
    .from('users')
    .select('id_tenant')
    .eq('id_user', user.id)
    .single()

  if (tenantError || !userData) {
    console.error('Error getting tenant:', tenantError)
    return { success: false, error: 'Error al obtener información del usuario' }
  }

  // Actualizar perfil en la tabla users
  const { error } = await supabase
    .from('users')
    .upsert({
      id_user: user.id,
      id_tenant: userData.id_tenant,
      nombre: nombre.trim()
    })

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Error al actualizar el perfil' }
  }

  revalidatePath('/perfil')
  return { success: true, message: 'Perfil actualizado correctamente' }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const file = formData.get('avatar') as File

  if (!file || file.size === 0) {
    return { success: false, error: 'No se proporcionó ningún archivo' }
  }

  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP.' }
  }

  // Validar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { success: false, error: 'El archivo es demasiado grande. Máximo 5MB.' }
  }

  try {
    // Convertir imagen a WebP y optimizar con Sharp
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)

    // Procesar imagen con Sharp
    const processedBuffer = await sharp(uint8Array)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 85,
        effort: 6
      })
      .toBuffer()

    const processedFile = new File([new Uint8Array(processedBuffer)], 'avatar.webp', { type: 'image/webp' })

    // Generar nombre del archivo
    const fileName = `${user.id}/avatar.webp`

    // Subir archivo al bucket user-avatars
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(fileName, processedFile, {
        cacheControl: '3600',
        upsert: true // Sobrescribir si ya existe
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return { success: false, error: 'Error al subir la imagen' }
    }

    // Obtener URL firmada (signed URL) porque el bucket es privado
    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from('user-avatars')
      .createSignedUrl(fileName, 31536000) // 1 año en segundos

    if (signedError || !signedUrlData?.signedUrl) {
      console.error('Error creating signed URL:', signedError)
      return { success: false, error: 'Error al obtener la URL de la imagen' }
    }

    // Obtener el id_tenant del usuario
    const { data: userData, error: tenantError } = await supabase
      .from('users')
      .select('id_tenant')
      .eq('id_user', user.id)
      .single()

    if (tenantError || !userData) {
      console.error('Error getting tenant:', tenantError)
      return { success: false, error: 'Error al obtener información del usuario' }
    }

    // Actualizar avatar_url en la base de datos
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: signedUrlData.signedUrl
      })
      .eq('id_user', user.id)
      .eq('id_tenant', userData.id_tenant)

    if (updateError) {
      console.error('Error updating avatar URL:', updateError)
      // Intentar eliminar el archivo subido si falla la actualización
      await supabase.storage
        .from('user-avatars')
        .remove([fileName])

      return { success: false, error: 'Error al actualizar la información del avatar' }
    }

    revalidatePath('/perfil')
    return {
      success: true,
      message: 'Avatar actualizado correctamente',
      avatarUrl: signedUrlData.signedUrl
    }

  } catch (error) {
    console.error('Error processing avatar:', error)
    return { success: false, error: 'Error al procesar la imagen' }
  }
}
