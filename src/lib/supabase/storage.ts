import { createClient } from './client'

export const BUCKET_NAME = 'plant-images'

export async function uploadPlantImage(file: File, tenantId: string, plantId?: number): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient()

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = plantId
      ? `${tenantId}/${plantId}.${fileExt}`
      : `${tenantId}/temp_${Date.now()}.${fileExt}`

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { success: false, error: error.message }
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error desconocido al subir imagen' }
  }
}

export async function deletePlantImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Extraer el path del archivo de la URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts.slice(-2).join('/') // tenantId/filename

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Error desconocido al eliminar imagen' }
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido. Solo se permiten JPG, PNG y WebP.' }
  }

  // Verificar tamaño (5MB máximo)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es demasiado grande. Máximo 5MB.' }
  }

  return { valid: true }
}
