'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PlantaConDetalles, Tarea, HistoriaClinica, GeneroPlanta, Maceta } from '@/types'

/* eslint-disable @typescript-eslint/no-explicit-any */

// Tipos para las funciones
export type CreatePlantaData = {
  nombre: string
  id_tipo: number
  id_genero: number
  id_maceta?: number
  fecha_compra?: string
  fecha_transplante?: string
  iluminacion?: string
  esta_enferma: boolean
  esta_muerta: boolean
  observaciones?: string
  image_url?: string
}

export type UpdatePlantaData = Partial<CreatePlantaData>

export type ActionResponse<T = void> = {
  success: boolean
  data?: T
  message: string
}

export async function getPlantas(): Promise<PlantaConDetalles[]> {
  const supabase = await createClient()

  try {
    // Primero probar query básica
    const { error: basicError } = await supabase
      .from('plantas')
      .select('*')
      .limit(1)

    if (basicError) {
      console.warn('Advertencia en diagnóstico inicial de plantas:', basicError.message)
    }

    // Query con joins
    const { data, error } = await supabase
      .from('plantas')
      .select(`
        *,
        tipos_planta(id_tipo, nombre),
        generos_planta(id_genero, nombre),
        macetas(id_maceta, tipo, material)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      // Si falla el join, intentar sin joins
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('plantas')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (fallbackError) {
        throw new Error(`Error incluso sin joins: ${fallbackError.message}`)
      }

      return (fallbackData || []).map(planta => ({
        ...planta,
        tipos_planta: null,
        generos_planta: null,
        macetas: null
      }))
    }

    return data || []
  } catch (error) {
    throw error
  }
}

export async function getPlantaById(id: number): Promise<PlantaConDetalles | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('plantas')
      .select(`
        *,
        tipos_planta(id_tipo, nombre),
        generos_planta(id_genero, nombre),
        macetas(id_maceta, tipo, material)
      `)
      .eq('id_planta', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching planta by id:', error)
      throw new Error('Error al obtener la planta')
    }

    return data
  } catch (error) {
    console.error('Exception in getPlantaById:', error)
    throw new Error('Error al obtener la planta')
  }
}

export async function getPlantaByIdWithResponse(id: number): Promise<ActionResponse<PlantaConDetalles>> {
  try {
    const data = await getPlantaById(id)

    if (!data) {
      return {
        success: false,
        message: 'Planta no encontrada'
      }
    }

    return {
      success: true,
      data,
      message: 'Planta obtenida correctamente'
    }
  } catch (error) {
    console.error('Error getting planta by id:', error)
    return {
      success: false,
      message: 'Error al obtener la planta'
    }
  }
}

export async function createPlanta(data: CreatePlantaData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    // Obtener el tenant del usuario autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      }
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id_tenant')
      .eq('id_user', authData.user.id)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: 'No se pudo obtener el tenant del usuario'
      }
    }

    const { error } = await supabase
      .from('plantas')
      .insert({
        nombre: data.nombre,
        id_tipo: data.id_tipo,
        id_genero: data.id_genero,
        id_maceta: data.id_maceta,
        id_tenant: userData.id_tenant, // Agregar el tenant requerido por RLS
        fecha_compra: data.fecha_compra,
        fecha_transplante: data.fecha_transplante,
        iluminacion: data.iluminacion,
        esta_enferma: data.esta_enferma,
        esta_muerta: data.esta_muerta,
        observaciones: data.observaciones,
        image_url: data.image_url,
      })

    if (error) {
      console.error('Error de Supabase al crear planta:', error)
      return {
        success: false,
        message: `Error al crear la planta: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
      }
    }

    revalidatePath('/plantas', 'page')
    return {
      success: true,
      message: 'Planta creada exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en createPlanta:', error)
    return {
      success: false,
      message: `Error al crear la planta: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function updatePlanta(id: number, data: UpdatePlantaData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('plantas')
      .update({
        nombre: data.nombre,
        id_tipo: data.id_tipo,
        id_genero: data.id_genero,
        id_maceta: data.id_maceta,
        fecha_compra: data.fecha_compra,
        fecha_transplante: data.fecha_transplante,
        iluminacion: data.iluminacion,
        esta_enferma: data.esta_enferma,
        esta_muerta: data.esta_muerta,
        observaciones: data.observaciones,
        image_url: data.image_url,
      })
      .eq('id_planta', id)

    if (error) {
      return {
        success: false,
        message: `Error al actualizar la planta: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    revalidatePath('/plantas', 'page')
    return {
      success: true,
      message: 'Planta actualizada exitosamente'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error al actualizar la planta: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function softDeletePlanta(id: number): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('plantas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id_planta', id)

    if (error) {
      return {
        success: false,
        message: `Error al eliminar la planta: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    revalidatePath('/plantas', 'page')
    return {
      success: true,
      message: 'Planta eliminada exitosamente'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error al eliminar la planta: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

// Funciones auxiliares para obtener datos de los selects
export async function getTiposPlanta() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('tipos_planta')
      .select('id_tipo, nombre')
      .order('nombre')

    if (error) {
      throw new Error(`Error al obtener los tipos de planta: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }

    return data || []
  } catch (error) {
    throw error
  }
}

// Función para poblar tipos de planta de ejemplo (solo para desarrollo)
export async function seedTiposPlanta() {
  const supabase = await createClient()

  const tiposEjemplo = [
    { id_tipo: 1, nombre: 'Interior' },
    { id_tipo: 2, nombre: 'Exterior' },
  ]

  try {
    // Verificar si ya existen tipos
    const { data: existing, error: checkError } = await supabase
      .from('tipos_planta')
      .select('id_tipo, nombre')

    if (checkError) {
      // Si hay error de permisos, asumir que ya existen datos
      return { success: true, message: 'Tipos de planta ya configurados' }
    }

    if (existing && existing.length > 0) {
      return { success: true, message: 'Los tipos ya están poblados' }
    }

    // Insertar tipos de ejemplo uno por uno para evitar conflictos
    const results = []
    for (const tipo of tiposEjemplo) {
      try {
        const { data, error } = await supabase
          .from('tipos_planta')
          .upsert(tipo, { onConflict: 'id_tipo' })
          .select()

        if (error) {
        } else if (data) {
          results.push(data[0])
        }
      } catch (err) {
        console.error('Error seeding tipo:', err)
      }
    }

    return { success: true, message: `Se procesaron ${results.length} tipos de planta de ejemplo` }
  } catch {
    // No lanzar error, solo loggear - los tipos pueden ya existir
    return { success: true, message: 'Tipos de planta ya configurados' }
  }
}

export async function getGenerosPlanta() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('generos_planta')
      .select('id_genero, nombre, descripcion')
      .order('nombre')

    if (error) {
      // No lanzar error, devolver array vacío para que la app siga funcionando
      return []
    }

    return data || []
  } catch {
    // No lanzar error, devolver array vacío
    return []
  }
}


// Función para poblar datos de prueba completos
export async function poblarDatosPrueba() {
  try {
    const supabase = await createClient()

    // 1. Verificar autenticación
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return { success: false, message: 'Usuario no autenticado' }
    }

    // 2. Obtener tenant del usuario
    // Ver todos los usuarios primero
    const { data: allUsers } = await supabase
      .from('users')
      .select('id_user, id_tenant')

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id_tenant')
      .eq('id_user', authData.user.id)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: `Usuario no registrado. Total usuarios: ${allUsers?.length || 0}. Error: ${userError?.message || 'Usuario no encontrado'}`
      }
    }

    const tenantId = userData.id_tenant

    // 2. Poblar tipos (globales)
    await seedTiposPlanta()

    // 3. Poblar géneros (por tenant)
    await seedGenerosPlanta()

    // 4. Poblar macetas (por tenant)
    const macetasData = [
      { tipo: 'Plástico', material: 'Plástico reciclado', diametro_cm: 15, altura_cm: 10, volumen_lts: 1 },
      { tipo: 'Cerámica', material: 'Cerámica esmaltada', diametro_cm: 20, altura_cm: 15, volumen_lts: 2 },
      { tipo: 'Tierra cocida', material: 'Arcilla natural', diametro_cm: 25, altura_cm: 20, volumen_lts: 3 },
    ]

    const macetasConTenant = macetasData.map(maceta => ({
      ...maceta,
      id_tenant: tenantId
    }))

    const { data: macetasInsert } = await supabase
      .from('macetas')
      .upsert(macetasConTenant, { onConflict: 'id_maceta' })
      .select()

    // 5. Poblar plantas de ejemplo
    // Obtener IDs de las relaciones
    const tipos = await getTiposPlanta()
    const generos = await getGenerosPlanta()
    const macetas = await getMacetas()

    if (tipos.length === 0 || generos.length === 0) {
      return {
        success: false,
        message: 'No se pudieron poblar las plantas: faltan tipos o géneros'
      }
    }

    const plantasData = [
      {
        nombre: 'Monstera deliciosa',
        id_tipo: tipos[0]?.id_tipo || 1,
        id_genero: generos.find(g => g.nombre === 'Monstera')?.id_genero || generos[0]?.id_genero,
        id_maceta: macetas[0]?.id_maceta,
        fecha_compra: '2024-01-15',
        iluminacion: 'sol-indirecto',
        esta_enferma: false,
        esta_muerta: false,
        observaciones: 'Planta tropical, requiere humedad'
      },
      {
        nombre: 'Sansevieria trifasciata',
        id_tipo: tipos[0]?.id_tipo || 1,
        id_genero: generos.find(g => g.nombre === 'Snake Plant')?.id_genero || generos[1]?.id_genero,
        id_maceta: macetas[1]?.id_maceta,
        fecha_compra: '2024-02-01',
        iluminacion: 'sombra',
        esta_enferma: false,
        esta_muerta: false,
        observaciones: 'Planta de bajo mantenimiento'
      }
    ]

    const plantasConTenant = plantasData.map(planta => ({
      ...planta,
      id_tenant: tenantId
    }))

    const { data: plantasInsert } = await supabase
      .from('plantas')
      .insert(plantasConTenant)
      .select()

    const resultado = {
      success: true,
      message: `Datos poblados: ${tipos.length} tipos, ${generos.length} géneros, ${macetasInsert?.length || 0} macetas, ${plantasInsert?.length || 0} plantas`,
      detalles: {
        tipos: tipos.length,
        generos: generos.length,
        macetas: macetasInsert?.length || 0,
        plantas: plantasInsert?.length || 0
      }
    }

    return resultado

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'
    return { success: false, message: `Error: ${errorMessage}` }
  }
}

// Función de prueba simple para verificar consultas básicas
export async function probarConsultasBasicas() {
  const supabase = await createClient()

  try {
    // 1. Probar conexión básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from('generos_planta')
      .select('count')
      .limit(1)

    // 2. Probar consulta sin filtros
    const { data: sinFiltros, error: sinFiltrosError } = await supabase
      .from('generos_planta')
      .select('*')

    // 3. Probar la consulta exacta que usa getGenerosPlanta
    const { data: consultaNormal, error: consultaNormalError } = await supabase
      .from('generos_planta')
      .select('id_genero, nombre, descripcion')
      .order('nombre')

    return {
      connection: { data: connectionTest, error: connectionError },
      sinFiltros: { data: sinFiltros?.length || 0, error: sinFiltrosError },
      consultaNormal: { data: consultaNormal?.length || 0, error: consultaNormalError }
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'
    return { error: errorMessage }
  }
}

export async function poblarGenerosManual() {
  const result = await seedGenerosPlanta()

  // Recargar géneros después del seed
  await getGenerosPlanta()

  return result
}

// Función de diagnóstico completa para todas las queries
export async function diagnosticarQueries() {
  const supabase = await createClient()
  const results: {
    usuario: any;
    plantas: any;
    tipos: any;
    generos: any;
    macetas: any;
    joins: any;
    errores: any[];
  } = {
    usuario: null,
    plantas: null,
    tipos: null,
    generos: null,
    macetas: null,
    joins: null,
    errores: []
  }

  try {
    // 1. Verificar usuario autenticado
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      results.usuario = { data: userData, error: userError }
    } catch (err) {
      results.errores.push({ query: 'auth', error: err })
    }

    // 2. Query básica de plantas (sin joins)
    try {
      const { data, error } = await supabase
        .from('plantas')
        .select('*')
        .limit(5)

      results.plantas = { data, error, count: data?.length || 0 }
    } catch (err) {
      results.errores.push({ query: 'plantas', error: err })
    }

    // 3. Query de tipos_planta
    try {
      const { data, error } = await supabase
        .from('tipos_planta')
        .select('*')

      results.tipos = { data, error, count: data?.length || 0 }
    } catch (err) {
      results.errores.push({ query: 'tipos', error: err })
    }

    // 4. Query de generos_planta
    try {
      const { data, error } = await supabase
        .from('generos_planta')
        .select('*')

      results.generos = { data, error, count: data?.length || 0 }
    } catch (err) {
      results.errores.push({ query: 'generos', error: err })
    }

    // 5. Query de macetas
    try {
      const { data, error } = await supabase
        .from('macetas')
        .select('*')

      results.macetas = { data, error, count: data?.length || 0 }
    } catch (err) {
      results.errores.push({ query: 'macetas', error: err })
    }

    // 6. Query con joins (la que está fallando)
    try {
      const { data, error } = await supabase
        .from('plantas')
        .select(`
          *,
          tipos_planta(id_tipo, nombre),
          generos_planta(id_genero, nombre),
          macetas(id_maceta, tipo, material)
        `)
        .is('deleted_at', null)
        .limit(3)

      results.joins = { data, error, count: data?.length || 0 }
    } catch (err) {
      results.errores.push({ query: 'joins', error: err })
    }

    return results

  } catch (error) {
    return { ...results, errorGeneral: error }
  }
}

// Función de debug para verificar estado de géneros
export async function debugGenerosPlanta() {
  const supabase = await createClient()

  try {
    // Verificar usuario y tenant
    await supabase
      .from('users')
      .select('id_user, id_tenant')
      .single()

    // Verificar géneros sin filtro
    await supabase
      .from('generos_planta')
      .select('*')

    // Verificar géneros con filtro específico
    const { data: userData } = await supabase
      .from('users')
      .select('id_tenant')
      .single()

    if (userData?.id_tenant) {
      await supabase
        .from('generos_planta')
        .select('*')
        .eq('id_tenant', userData.id_tenant)
    }

    return { success: true, message: 'Operación completada' }
  } catch {
    return { success: false, message: 'Error en la operación' }
  }
}

// Función para poblar géneros de ejemplo (solo para desarrollo)
export async function seedGenerosPlanta() {
  const supabase = await createClient()

  const generosEjemplo = [
    { nombre: 'Ficus', descripcion: 'Familia de las moráceas' },
    { nombre: 'Monstera', descripcion: 'Plantas tropicales con hojas grandes' },
    { nombre: 'Pothos', descripcion: 'Plantas trepadoras resistentes' },
    { nombre: 'Snake Plant', descripcion: 'Sansevieria, muy resistentes' },
    { nombre: 'Peace Lily', descripcion: 'Spathiphyllum, plantas de interior' },
    { nombre: 'Rubber Tree', descripcion: 'Ficus elastica, hojas brillantes' },
    { nombre: 'ZZ Plant', descripcion: 'Zamioculcas zamiifolia, muy resistente' },
    { nombre: 'Spider Plant', descripcion: 'Chlorophytum, fácil de cuidar' },
  ]

  try {
    // Verificar autenticación primero
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData?.user) {
      return { success: false, message: 'Usuario no autenticado' }
    }

    // Verificar si existe la tabla users
    const { error: usersTableError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersTableError) {
      return { success: false, message: `Error en tabla users: ${usersTableError.message}` }
    }

    // Buscar el registro del usuario actual
    // Primero intentar sin filtro para ver todos los usuarios
    const { data: allUsers } = await supabase
      .from('users')
      .select('id_user, id_tenant')

    // Ahora buscar específicamente el usuario actual
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id_user, id_tenant')
      .eq('id_user', authData.user.id)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: `Usuario no registrado. Total usuarios en tabla: ${allUsers?.length || 0}. Error: ${userError?.message || 'Usuario no encontrado'}`
      }
    }

    // Verificar si ya existen géneros para este tenant
    const { data: existing } = await supabase
      .from('generos_planta')
      .select('id_genero, nombre')
      .eq('id_tenant', userData.id_tenant)
      .limit(5)

    if (existing && existing.length > 0) {
      return { success: true, message: 'Los géneros ya están poblados' }
    }

    // Agregar id_tenant a los géneros de ejemplo
    const generosConTenant = generosEjemplo.map(genero => ({
      ...genero,
      id_tenant: userData.id_tenant
    }))

    // Insertar géneros de ejemplo
    const { data, error } = await supabase
      .from('generos_planta')
      .insert(generosConTenant)
      .select()

    if (error) {
      return { success: false, message: `Error al poblar géneros: ${error instanceof Error ? error.message : 'Error desconocido'}` }
    }

    return { success: true, message: `Se insertaron ${data?.length || 0} géneros de ejemplo` }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'
    return { success: false, message: `Error inesperado: ${errorMessage}` }
  }
}

// === TAREAS ===

// Tipos para tareas
export type CreateTareaData = {
  titulo: string
  descripcion?: string
  fecha_programada: string
  id_planta?: number
}

export type UpdateTareaData = {
  titulo?: string
  descripcion?: string
  fecha_programada?: string
  completada?: boolean
}

export async function getTareas(): Promise<Tarea[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('tareas')
      .select(`
        *,
        plantas(id_planta, nombre)
      `)
      .order('fecha_programada', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener tareas: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }

    return data || []
  } catch (error) {
    console.error('Error en getTareas:', error)
    throw error
  }
}

export async function getTareaById(id: number): Promise<Tarea | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('id_tarea', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error('Error al obtener la tarea')
    }

    return data
  } catch (error) {
    console.error('Error getting tarea by id:', error)
    throw error
  }
}

export async function createTarea(data: CreateTareaData): Promise<ActionResponse<Tarea>> {
  const supabase = await createClient()

  try {
    // Obtener el tenant del usuario autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      }
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id_tenant')
      .eq('id_user', authData.user.id)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: 'No se pudo obtener el tenant del usuario'
      }
    }

    const { data: tarea, error } = await supabase
      .from('tareas')
      .insert({
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha_programada: data.fecha_programada,
        id_planta: data.id_planta,
        id_tenant: userData.id_tenant,
        completada: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error de Supabase al crear tarea:', error)
      return {
        success: false,
        message: `Error al crear la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    revalidatePath('/tareas')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Tarea creada exitosamente',
      data: tarea
    }
  } catch (error: unknown) {
    console.error('Error en createTarea:', error)
    return {
      success: false,
      message: `Error al crear la tarea: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function updateTarea(id: number, data: UpdateTareaData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('tareas')
      .update(data)
      .eq('id_tarea', id)

    if (error) {
      return {
        success: false,
        message: `Error al actualizar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    revalidatePath('/tareas', 'page')
    revalidatePath('/dashboard', 'page')
    return {
      success: true,
      message: 'Tarea actualizada exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en updateTarea:', error)
    return {
      success: false,
      message: `Error al actualizar la tarea: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function deleteTarea(id: number): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id_tarea', id)

    if (error) {
      return {
        success: false,
        message: `Error al eliminar la tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    revalidatePath('/tareas', 'page')
    revalidatePath('/dashboard', 'page')
    return {
      success: true,
      message: 'Tarea eliminada exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en deleteTarea:', error)
    return {
      success: false,
      message: `Error al eliminar la tarea: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function toggleTareaCompletada(id: number): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    // Primero obtener el estado actual
    const { data: tarea, error: getError } = await supabase
      .from('tareas')
      .select('completada')
      .eq('id_tarea', id)
      .single()

    if (getError) {
      return {
        success: false,
        message: `Error al obtener la tarea: ${getError.message}`
      }
    }

    // Actualizar el estado opuesto
    const { error } = await supabase
      .from('tareas')
      .update({ completada: !tarea.completada })
      .eq('id_tarea', id)

    if (error) {
      return {
        success: false,
        message: `Error al actualizar el estado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    revalidatePath('/tareas', 'page')
    revalidatePath('/dashboard', 'page')
    return {
      success: true,
      message: `Tarea ${!tarea.completada ? 'marcada como completada' : 'marcada como pendiente'}`
    }
  } catch (error: unknown) {
    console.error('Error en toggleTareaCompletada:', error)
    return {
      success: false,
      message: `Error al cambiar el estado: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

// === HISTORIAL CLÍNICO ===

// Tipos para historial clínico
export type CreateHistoriaClinicaData = {
  id_planta: number
  fecha: string
  descripcion: string
  tratamiento?: string
  estuvo_enferma: boolean
}

export type UpdateHistoriaClinicaData = {
  fecha?: string
  descripcion?: string
  tratamiento?: string
  estuvo_enferma?: boolean
}

export async function getHistoriaClinicaByPlanta(idPlanta: number): Promise<HistoriaClinica[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('historia_clinica')
      .select('*')
      .eq('id_planta', idPlanta)
      .order('fecha', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener historial clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }

    return data || []
  } catch (error) {
    console.error('Error en getHistoriaClinicaByPlanta:', error)
    throw error
  }
}

export async function getHistoriaClinicaById(id: number): Promise<HistoriaClinica | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('historia_clinica')
      .select('*')
      .eq('id_historia', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error('Error al obtener el registro del historial clínico')
    }

    return data
  } catch (error) {
    console.error('Error getting historia clinica by id:', error)
    throw error
  }
}

export async function createHistoriaClinica(data: CreateHistoriaClinicaData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    // Obtener el tenant del usuario autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      }
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id_tenant')
      .eq('id_user', authData.user.id)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: 'No se pudo obtener el tenant del usuario'
      }
    }

    const { error } = await supabase
      .from('historia_clinica')
      .insert({
        id_planta: data.id_planta,
        fecha: data.fecha,
        descripcion: data.descripcion,
        tratamiento: data.tratamiento,
        estuvo_enferma: data.estuvo_enferma,
        id_tenant: userData.id_tenant,
      })

    if (error) {
      console.error('Error de Supabase al crear registro clínico:', error)
      return {
        success: false,
        message: `Error al crear el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    // No revalidar páginas dinámicas específicas, dejar que se refresquen naturalmente
    return {
      success: true,
      message: 'Registro clínico creado exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en createHistoriaClinica:', error)
    return {
      success: false,
      message: `Error al crear el registro clínico: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function updateHistoriaClinica(id: number, data: UpdateHistoriaClinicaData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('historia_clinica')
      .update(data)
      .eq('id_historia', id)

    if (error) {
      return {
        success: false,
        message: `Error al actualizar el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    // No revalidar páginas dinámicas específicas, dejar que se refresquen naturalmente
    return {
      success: true,
      message: 'Registro clínico actualizado exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en updateHistoriaClinica:', error)
    return {
      success: false,
      message: `Error al actualizar el registro clínico: ${error instanceof Error ? error instanceof Error ? error.message : 'Error desconocido' : 'Error desconocido'}`
    }
  }
}

export async function deleteHistoriaClinica(id: number): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('historia_clinica')
      .delete()
      .eq('id_historia', id)

    if (error) {
      return {
        success: false,
        message: `Error al eliminar el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }
    }

    // No revalidar páginas dinámicas específicas, dejar que se refresquen naturalmente
    return {
      success: true,
      message: 'Registro clínico eliminado exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en deleteHistoriaClinica:', error)
    return {
      success: false,
      message: `Error al eliminar el registro clínico: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

// === GÉNEROS DE PLANTAS ===

// Tipos para géneros
export type CreateGeneroData = {
  nombre: string
  descripcion?: string
}

export type UpdateGeneroData = {
  nombre?: string
  descripcion?: string
}

export async function getGeneros(): Promise<GeneroPlanta[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('generos_planta')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener géneros: ${error.message}`)
    }

    return data || []
  } catch (error: unknown) {
    console.error('Error en getGeneros:', error)
    throw error
  }
}

export async function getGeneroById(id: number): Promise<GeneroPlanta | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('generos_planta')
      .select('*')
      .eq('id_genero', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error('Error al obtener el género')
    }

    return data
  } catch (error: unknown) {
    console.error('Error getting genero by id:', error)
    throw error
  }
}

export async function createGenero(data: CreateGeneroData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    // Obtener el tenant del usuario autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      }
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id_tenant')
      .eq('id_user', authData.user.id)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: 'No se pudo obtener el tenant del usuario'
      }
    }

    const { error } = await supabase
      .from('generos_planta')
      .insert({
        nombre: data.nombre,
        descripcion: data.descripcion,
        id_tenant: userData.id_tenant,
      })

    if (error) {
      console.error('Error de Supabase al crear género:', error)
      return {
        success: false,
        message: `Error al crear el género: ${error.message}`
      }
    }

    revalidatePath('/catalogos/generos')
    return {
      success: true,
      message: 'Género creado exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en createGenero:', error)
    return {
      success: false,
      message: `Error al crear el género: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

export async function updateGenero(id: number, data: UpdateGeneroData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('generos_planta')
      .update(data)
      .eq('id_genero', id)

    if (error) {
      return {
        success: false,
        message: `Error al actualizar el género: ${error.message}`
      }
    }

    revalidatePath('/catalogos/generos')
    return {
      success: true,
      message: 'Género actualizado exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en updateGenero:', error)
    return {
      success: false,
      message: `Error al actualizar el género: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

export async function deleteGenero(id: number): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('generos_planta')
      .delete()
      .eq('id_genero', id)

    if (error) {
      return {
        success: false,
        message: `Error al eliminar el género: ${error.message}`
      }
    }

    revalidatePath('/catalogos/generos')
    return {
      success: true,
      message: 'Género eliminado exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en deleteGenero:', error)
    return {
      success: false,
      message: `Error al eliminar el género: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

// === MACETAS ===

// Tipos para macetas
export type CreateMacetaData = {
  tipo: string
  material?: string
  diametro_cm?: number
  altura_cm?: number
  volumen_lts?: number
}

export type UpdateMacetaData = {
  tipo?: string
  material?: string
  diametro_cm?: number
  altura_cm?: number
  volumen_lts?: number
}

export async function getMacetas(): Promise<Maceta[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('macetas')
      .select('*')
      .order('tipo', { ascending: true })

    if (error) {
      throw new Error(`Error al obtener macetas: ${error.message}`)
    }

    return data || []
  } catch (error: unknown) {
    console.error('Error en getMacetas:', error)
    throw error
  }
}

export async function getMacetaById(id: number): Promise<Maceta | null> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('macetas')
      .select('*')
      .eq('id_maceta', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error('Error al obtener la maceta')
    }

    return data
  } catch (error: unknown) {
    console.error('Error getting maceta by id:', error)
    throw error
  }
}

export async function createMaceta(data: CreateMacetaData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    // Obtener el tenant del usuario autenticado
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData?.user) {
      return {
        success: false,
        message: 'Usuario no autenticado'
      }
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id_tenant')
      .eq('id_user', authData.user.id)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        message: 'No se pudo obtener el tenant del usuario'
      }
    }

    const { error } = await supabase
      .from('macetas')
      .insert({
        tipo: data.tipo,
        material: data.material,
        diametro_cm: data.diametro_cm,
        altura_cm: data.altura_cm,
        volumen_lts: data.volumen_lts,
        id_tenant: userData.id_tenant,
      })

    if (error) {
      console.error('Error de Supabase al crear maceta:', error)
      return {
        success: false,
        message: `Error al crear la maceta: ${error.message}`
      }
    }

    revalidatePath('/catalogos/macetas')
    return {
      success: true,
      message: 'Maceta creada exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en createMaceta:', error)
    return {
      success: false,
      message: `Error al crear la maceta: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

export async function updateMaceta(id: number, data: UpdateMacetaData): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('macetas')
      .update(data)
      .eq('id_maceta', id)

    if (error) {
      return {
        success: false,
        message: `Error al actualizar la maceta: ${error.message}`
      }
    }

    revalidatePath('/catalogos/macetas')
    return {
      success: true,
      message: 'Maceta actualizada exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en updateMaceta:', error)
    return {
      success: false,
      message: `Error al actualizar la maceta: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}

export async function deleteMaceta(id: number): Promise<ActionResponse> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('macetas')
      .delete()
      .eq('id_maceta', id)

    if (error) {
      return {
        success: false,
        message: `Error al eliminar la maceta: ${error.message}`
      }
    }

    revalidatePath('/catalogos/macetas')
    return {
      success: true,
      message: 'Maceta eliminada exitosamente'
    }
  } catch (error: unknown) {
    console.error('Error en deleteMaceta:', error)
    return {
      success: false,
      message: `Error al eliminar la maceta: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }
  }
}