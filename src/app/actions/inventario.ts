'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
    ItemInventario,
    ItemInventarioConDetalles,
    CategoriaInventario,
    CreateItemInventarioData,
    CreateCategoriaInventarioData,
    MovimientoInventario,
    MovimientoConDetalles,
    CreateMovimientoData,
    Proveedor,
    CreateProveedorData,
    ItemProveedor
} from '@/types'

// ============================================
// CATEGORÍAS DE INVENTARIO
// ============================================

/**
 * Obtiene todas las categorías de inventario
 */
export async function getCategorias(): Promise<CategoriaInventario[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('categorias_inventario')
        .select('*')
        .order('nombre')

    if (error) throw error
    return data || []
}

/**
 * Crea una nueva categoría de inventario
 */
export async function createCategoria(
    data: CreateCategoriaInventarioData
): Promise<CategoriaInventario> {
    const supabase = await createClient()

    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', (await supabase.auth.getUser()).data.user?.id)
        .single()

    if (!userData) throw new Error('Usuario no encontrado')

    const { data: categoria, error } = await supabase
        .from('categorias_inventario')
        .insert({
            id_tenant: userData.id_tenant,
            ...data
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/inventario')
    return categoria
}

/**
 * Actualiza una categoría existente
 */
export async function updateCategoria(
    id_categoria: number,
    data: Partial<CreateCategoriaInventarioData>
): Promise<CategoriaInventario> {
    const supabase = await createClient()

    const { data: categoria, error } = await supabase
        .from('categorias_inventario')
        .update(data)
        .eq('id_categoria', id_categoria)
        .select()
        .single()

    if (error) throw error

    revalidatePath('/inventario')
    return categoria
}

/**
 * Elimina una categoría
 */
export async function deleteCategoria(id_categoria: number): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('categorias_inventario')
        .delete()
        .eq('id_categoria', id_categoria)

    if (error) throw error

    revalidatePath('/inventario')
    return true
}

// ============================================
// ITEMS DE INVENTARIO
// ============================================

/**
 * Obtiene todos los items de inventario activos
 */
export async function getItems(): Promise<ItemInventarioConDetalles[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('items_inventario')
        .select(`
      *,
      categorias_inventario (
        id_categoria,
        nombre,
        icono,
        color
      )
    `)
        .eq('activo', true)
        .order('nombre')

    if (error) throw error

    // Agregar indicador de stock bajo y calcular margen
    return (data || []).map(item => {
        let margen_porcentaje: number | undefined

        // Calcular margen solo si ambos precios existen y precio_costo > 0
        if (item.precio_costo && item.precio_venta && item.precio_costo > 0) {
            margen_porcentaje = ((item.precio_venta - item.precio_costo) / item.precio_costo) * 100
        }

        return {
            ...item,
            stock_bajo: item.stock_actual <= item.stock_minimo,
            margen_porcentaje
        }
    })
}

/**
 * Obtiene un item por ID con todos sus detalles
 */
export async function getItemById(id_item: number): Promise<ItemInventarioConDetalles | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('items_inventario')
        .select(`
      *,
      categorias_inventario (
        id_categoria,
        nombre,
        descripcion,
        icono,
        color
      )
    `)
        .eq('id_item', id_item)
        .single()

    if (error) throw error

    if (!data) return null

    return {
        ...data,
        stock_bajo: data.stock_actual <= data.stock_minimo
    }
}

/**
 * Obtiene items con stock bajo (stock_actual <= stock_minimo)
 */
export async function getItemsStockBajo(): Promise<ItemInventarioConDetalles[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('items_inventario')
        .select(`
      *,
      categorias_inventario (
        id_categoria,
        nombre,
        icono,
        color
      )
    `)
        .eq('activo', true)
        .order('stock_actual')

    if (error) throw error

    // Filtrar items con stock bajo
    return (data || [])
        .filter(item => item.stock_actual <= item.stock_minimo)
        .map(item => ({
            ...item,
            stock_bajo: true
        }))
}

/**
 * Crea un nuevo item de inventario
 */
export async function createItem(data: CreateItemInventarioData): Promise<ItemInventario> {
    const supabase = await createClient()

    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', (await supabase.auth.getUser()).data.user?.id)
        .single()

    if (!userData) throw new Error('Usuario no encontrado')

    const { data: item, error } = await supabase
        .from('items_inventario')
        .insert({
            id_tenant: userData.id_tenant,
            stock_actual: 0,
            ...data
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/inventario')
    return item
}

/**
 * Actualiza un item de inventario
 */
export async function updateItem(
    id_item: number,
    data: Partial<CreateItemInventarioData>
): Promise<ItemInventario> {
    const supabase = await createClient()

    const { data: item, error } = await supabase
        .from('items_inventario')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id_item', id_item)
        .select()
        .single()

    if (error) throw error

    revalidatePath('/inventario')
    return item
}

/**
 * Elimina un item (soft delete)
 */
export async function deleteItem(id_item: number): Promise<boolean> {
    const supabase = await createClient()

    // Soft delete - marcar como inactivo
    const { error } = await supabase
        .from('items_inventario')
        .update({ activo: false })
        .eq('id_item', id_item)

    if (error) throw error

    revalidatePath('/inventario')
    return true
}

// ============================================
// MOVIMIENTOS DE INVENTARIO
// ============================================

/**
 * Obtiene movimientos de inventario
 * @param id_item - Opcional, filtrar por item específico
 * @param limit - Límite de resultados (default: 100)
 */
export async function getMovimientos(
    id_item?: number,
    limit: number = 100
): Promise<MovimientoConDetalles[]> {
    const supabase = await createClient()

    let query = supabase
        .from('movimientos_inventario')
        .select(`
      *,
      items_inventario (
        id_item,
        nombre,
        codigo,
        unidad_medida
      ),
      proveedores (
        id_proveedor,
        nombre
      ),
      tareas (
        id_tarea,
        titulo
      ),
      users (
        id_user,
        nombre
      )
    `)
        .order('fecha', { ascending: false })
        .limit(limit)

    if (id_item) {
        query = query.eq('id_item', id_item)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
}

/**
 * Crea un movimiento de inventario (entrada, salida o ajuste)
 * El stock se actualiza automáticamente mediante trigger
 */
export async function createMovimiento(data: CreateMovimientoData): Promise<MovimientoInventario> {
    const supabase = await createClient()

    // Obtener tenant y usuario
    const { data: authData } = await supabase.auth.getUser()
    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', authData.user?.id)
        .single()

    if (!userData) throw new Error('Usuario no encontrado')

    // Obtener stock actual del item
    const { data: item } = await supabase
        .from('items_inventario')
        .select('stock_actual')
        .eq('id_item', data.id_item)
        .single()

    if (!item) throw new Error('Item no encontrado')

    // Calcular nuevo stock según tipo de movimiento
    const stock_anterior = item.stock_actual
    let stock_nuevo = stock_anterior

    switch (data.tipo) {
        case 'entrada':
            stock_nuevo = stock_anterior + data.cantidad
            break
        case 'salida':
            stock_nuevo = stock_anterior - data.cantidad
            if (stock_nuevo < 0) {
                throw new Error('Stock insuficiente para realizar la salida')
            }
            break
        case 'ajuste':
            stock_nuevo = data.cantidad
            break
    }

    // Calcular costo total si hay precio unitario
    const costo_total = data.precio_unitario
        ? data.precio_unitario * data.cantidad
        : undefined

    // Crear movimiento (el trigger actualizará el stock automáticamente)
    const { data: movimiento, error } = await supabase
        .from('movimientos_inventario')
        .insert({
            id_tenant: userData.id_tenant,
            id_usuario: authData.user?.id,
            stock_anterior,
            stock_nuevo,
            costo_total,
            ...data
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/inventario')
    revalidatePath(`/inventario/${data.id_item}`)
    return movimiento
}

// ============================================
// PROVEEDORES
// ============================================

/**
 * Obtiene todos los proveedores activos
 */
export async function getProveedores(): Promise<Proveedor[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('activo', true)
        .order('nombre')

    if (error) throw error
    return data || []
}

/**
 * Obtiene un proveedor por ID
 */
export async function getProveedorById(id_proveedor: number): Promise<Proveedor | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id_proveedor', id_proveedor)
        .single()

    if (error) throw error
    return data
}

/**
 * Crea un nuevo proveedor
 */
export async function createProveedor(data: CreateProveedorData): Promise<Proveedor> {
    const supabase = await createClient()

    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', (await supabase.auth.getUser()).data.user?.id)
        .single()

    if (!userData) throw new Error('Usuario no encontrado')

    const { data: proveedor, error } = await supabase
        .from('proveedores')
        .insert({
            id_tenant: userData.id_tenant,
            ...data
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/inventario/proveedores')
    return proveedor
}

/**
 * Actualiza un proveedor
 */
export async function updateProveedor(
    id_proveedor: number,
    data: Partial<CreateProveedorData>
): Promise<Proveedor> {
    const supabase = await createClient()

    const { data: proveedor, error } = await supabase
        .from('proveedores')
        .update(data)
        .eq('id_proveedor', id_proveedor)
        .select()
        .single()

    if (error) throw error

    revalidatePath('/inventario/proveedores')
    return proveedor
}

/**
 * Elimina un proveedor (soft delete)
 */
export async function deleteProveedor(id_proveedor: number): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('proveedores')
        .update({ activo: false })
        .eq('id_proveedor', id_proveedor)

    if (error) throw error

    revalidatePath('/inventario/proveedores')
    return true
}

// ============================================
// RELACIÓN ITEMS-PROVEEDORES
// ============================================

/**
 * Obtiene proveedores de un item específico
 */
export async function getProveedoresByItem(id_item: number): Promise<ItemProveedor[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('items_proveedores')
        .select(`
      *,
      proveedores (
        id_proveedor,
        nombre,
        contacto,
        telefono,
        email
      )
    `)
        .eq('id_item', id_item)

    if (error) throw error
    return data || []
}

/**
 * Asocia un proveedor a un item
 */
export async function asociarProveedor(data: Omit<ItemProveedor, 'created_at'>): Promise<ItemProveedor> {
    const supabase = await createClient()

    const { data: relacion, error } = await supabase
        .from('items_proveedores')
        .insert(data)
        .select()
        .single()

    if (error) throw error

    revalidatePath(`/inventario/${data.id_item}`)
    return relacion
}

/**
 * Actualiza la relación item-proveedor
 */
export async function updateItemProveedor(
    id_item: number,
    id_proveedor: number,
    data: Partial<Omit<ItemProveedor, 'id_item' | 'id_proveedor' | 'created_at'>>
): Promise<ItemProveedor> {
    const supabase = await createClient()

    const { data: relacion, error } = await supabase
        .from('items_proveedores')
        .update(data)
        .eq('id_item', id_item)
        .eq('id_proveedor', id_proveedor)
        .select()
        .single()

    if (error) throw error

    revalidatePath(`/inventario/${id_item}`)
    return relacion
}

/**
 * Desasocia un proveedor de un item
 */
export async function desasociarProveedor(id_item: number, id_proveedor: number): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('items_proveedores')
        .delete()
        .eq('id_item', id_item)
        .eq('id_proveedor', id_proveedor)

    if (error) throw error

    revalidatePath(`/inventario/${id_item}`)
    return true
}

// ============================================
// ESTADÍSTICAS Y REPORTES
// ============================================

/**
 * Obtiene estadísticas generales del inventario
 */
export async function getEstadisticasInventario() {
    const supabase = await createClient()

    try {
        // Total de items activos
        const { count: totalItems } = await supabase
            .from('items_inventario')
            .select('*', { count: 'exact', head: true })
            .eq('activo', true)

        // Items con stock bajo
        const { data: itemsStockBajo } = await supabase
            .from('items_inventario')
            .select('stock_actual, stock_minimo')
            .eq('activo', true)

        const stockBajoCount = itemsStockBajo?.filter(
            item => item.stock_actual <= item.stock_minimo
        ).length || 0

        // Valor total del inventario (basado en precio de costo)
        const { data: items } = await supabase
            .from('items_inventario')
            .select('stock_actual, precio_costo')
            .eq('activo', true)

        const valorTotal = items?.reduce((sum, item) => {
            return sum + (item.stock_actual * (item.precio_costo || 0))
        }, 0) || 0

        // Total de categorías
        const { count: totalCategorias } = await supabase
            .from('categorias_inventario')
            .select('*', { count: 'exact', head: true })

        return {
            totalItems: totalItems || 0,
            stockBajoCount,
            valorTotal,
            totalCategorias: totalCategorias || 0
        }
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error)
        throw error
    }
}
