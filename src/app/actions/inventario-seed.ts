'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Ejecuta el seed de categorías de inventario predefinidas
 * Solo crea categorías si no existen para el tenant
 */
export async function seedCategoriasInventario() {
    const supabase = await createClient()

    try {
        // Obtener tenant del usuario actual
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: 'Usuario no autenticado' }
        }

        const { data: userData } = await supabase
            .from('users')
            .select('id_tenant')
            .eq('id_user', user.id)
            .single()

        if (!userData) {
            return { success: false, message: 'Usuario no encontrado' }
        }

        const tenantId = userData.id_tenant

        // Categorías predefinidas
        const categorias = [
            {
                nombre: 'Macetas y Contenedores',
                descripcion: 'Macetas de diferentes tamaños y materiales',
                icono: 'flower-pot',
                color: '#8B4513'
            },
            {
                nombre: 'Sustratos y Tierras',
                descripcion: 'Diferentes tipos de sustratos y mezclas de tierra',
                icono: 'mountain',
                color: '#654321'
            },
            {
                nombre: 'Fertilizantes y Nutrientes',
                descripcion: 'Fertilizantes orgánicos e inorgánicos, nutrientes',
                icono: 'droplet',
                color: '#228B22'
            },
            {
                nombre: 'Herramientas',
                descripcion: 'Herramientas de jardinería y mantenimiento',
                icono: 'wrench',
                color: '#696969'
            },
            {
                nombre: 'Semillas y Plantas',
                descripcion: 'Semillas, esquejes y plantas nuevas',
                icono: 'sprout',
                color: '#32CD32'
            },
            {
                nombre: 'Productos Fitosanitarios',
                descripcion: 'Insecticidas, fungicidas y otros productos de protección',
                icono: 'shield',
                color: '#DC143C'
            }
        ]

        // Verificar cuáles ya existen
        const { data: existentes } = await supabase
            .from('categorias_inventario')
            .select('nombre')
            .eq('id_tenant', tenantId)

        const nombresExistentes = new Set(existentes?.map(c => c.nombre) || [])

        // Filtrar solo las que no existen
        const categoriasNuevas = categorias
            .filter(c => !nombresExistentes.has(c.nombre))
            .map(c => ({
                ...c,
                id_tenant: tenantId
            }))

        if (categoriasNuevas.length === 0) {
            return {
                success: true,
                message: 'Las categorías ya están configuradas',
                created: 0
            }
        }

        // Insertar categorías nuevas
        const { error } = await supabase
            .from('categorias_inventario')
            .insert(categoriasNuevas)

        if (error) {
            console.error('Error seeding categorías:', error)
            return {
                success: false,
                message: `Error al crear categorías: ${error.message}`
            }
        }

        return {
            success: true,
            message: `Se crearon ${categoriasNuevas.length} categorías de inventario`,
            created: categoriasNuevas.length
        }

    } catch (error) {
        console.error('Error en seedCategoriasInventario:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}

/**
 * Verifica el estado del sistema de inventario
 */
export async function verificarInventario() {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, message: 'Usuario no autenticado' }
        }

        // Verificar tablas
        const tablas = [
            'categorias_inventario',
            'items_inventario',
            'proveedores',
            'items_proveedores',
            'movimientos_inventario'
        ]

        const resultados = []

        for (const tabla of tablas) {
            const { count, error } = await supabase
                .from(tabla)
                .select('*', { count: 'exact', head: true })

            resultados.push({
                tabla,
                existe: !error,
                registros: count || 0,
                error: error?.message
            })
        }

        return {
            success: true,
            tablas: resultados
        }

    } catch (error) {
        console.error('Error verificando inventario:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        }
    }
}
