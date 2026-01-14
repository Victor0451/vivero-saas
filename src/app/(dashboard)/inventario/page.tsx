'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/page-header'
import { Plus, Package, AlertTriangle, DollarSign, FolderOpen, ArrowDownCircle, Pencil, Trash2, Search, X } from 'lucide-react'
import { getItems, getEstadisticasInventario, getCategorias, getProveedores, deleteItem } from '@/app/actions/inventario'
import { seedCategoriasInventario } from '@/app/actions/inventario-seed'
import { InventoryItemSheet } from '@/components/inventory-item-sheet'
import { MovementDialog } from '@/components/movement-dialog'
import { showToast } from '@/lib/toast'
import type { ItemInventarioConDetalles, CategoriaInventario, Proveedor, ItemInventario } from '@/types'

export default function InventarioPage() {
    const [items, setItems] = useState<ItemInventarioConDetalles[]>([])
    const [categorias, setCategorias] = useState<CategoriaInventario[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [stats, setStats] = useState({
        totalItems: 0,
        stockBajoCount: 0,
        valorTotal: 0,
        totalCategorias: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const [itemSheetOpen, setItemSheetOpen] = useState(false)
    const [movementDialogOpen, setMovementDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<ItemInventario | null>(null)

    // Estados de filtros
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategoria, setSelectedCategoria] = useState<string>('all')
    const [stockFilter, setStockFilter] = useState<'all' | 'bajo' | 'ok'>('all')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setIsLoading(true)

            const [itemsData, statsData, categoriasData, proveedoresData] = await Promise.all([
                getItems(),
                getEstadisticasInventario(),
                getCategorias(),
                getProveedores()
            ])

            setItems(itemsData)
            setStats(statsData)
            setCategorias(categoriasData)
            setProveedores(proveedoresData)
        } catch (error) {
            console.error('Error cargando inventario:', error)
            showToast.error('Error al cargar el inventario')
        } finally {
            setIsLoading(false)
        }
    }

    // Filtrar items según los criterios seleccionados
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Filtro de búsqueda por texto
            const matchesSearch = searchTerm === '' ||
                item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())

            // Filtro por categoría
            const matchesCategoria = selectedCategoria === 'all' ||
                item.id_categoria?.toString() === selectedCategoria

            // Filtro por estado de stock
            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'bajo' && item.stock_bajo) ||
                (stockFilter === 'ok' && !item.stock_bajo)

            return matchesSearch && matchesCategoria && matchesStock
        })
    }, [items, searchTerm, selectedCategoria, stockFilter])

    const handleClearFilters = () => {
        setSearchTerm('')
        setSelectedCategoria('all')
        setStockFilter('all')
    }

    const hasActiveFilters = searchTerm !== '' || selectedCategoria !== 'all' || stockFilter !== 'all'

    const handleSeedCategorias = async () => {
        try {
            const result = await seedCategoriasInventario()
            if (result.success) {
                showToast.success(result.message)
                loadData()
            } else {
                showToast.error(result.message)
            }
        } catch (error) {
            console.error('Error seeding categorías:', error)
            showToast.error('Error al crear categorías')
        }
    }

    const handleCreateItem = () => {
        setSelectedItem(null)
        setItemSheetOpen(true)
    }

    const handleEditItem = (item: ItemInventario) => {
        setSelectedItem(item)
        setItemSheetOpen(true)
    }

    const handleDeleteItem = async (item: ItemInventario) => {
        if (!confirm(`¿Estás seguro de eliminar "${item.nombre}"?`)) return

        try {
            await deleteItem(item.id_item)
            showToast.success('Item eliminado correctamente')
            loadData()
        } catch (error) {
            console.error('Error eliminando item:', error)
            showToast.error('Error al eliminar el item')
        }
    }

    const handleMovement = (item: ItemInventario) => {
        setSelectedItem(item)
        setMovementDialogOpen(true)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(value)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión de Inventario"
                description="Control de stock, materiales y suministros"
            >
                <div className="flex gap-2">
                    {categorias.length === 0 && (
                        <Button variant="outline" onClick={handleSeedCategorias}>
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Crear Categorías
                        </Button>
                    )}
                    <Button onClick={handleCreateItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Item
                    </Button>
                </div>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Items activos en inventario
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {stats.stockBajoCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Items requieren reabastecimiento
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats.valorTotal)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Valor del inventario actual
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCategorias}</div>
                        <p className="text-xs text-muted-foreground">
                            Categorías configuradas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Items de Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filtros */}
                    <div className="space-y-4 mb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            {/* Búsqueda */}
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, código o descripción..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Filtro por categoría */}
                            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las categorías" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas las categorías</SelectItem>
                                    {categorias.map((cat) => (
                                        <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                                            {cat.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Filtro por estado de stock */}
                            <Select value={stockFilter} onValueChange={(value) => setStockFilter(value as 'all' | 'bajo' | 'ok')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Estado de stock" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="bajo">Stock Bajo</SelectItem>
                                    <SelectItem value="ok">Stock OK</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Indicador de filtros activos y botón limpiar */}
                        {hasActiveFilters && (
                            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando <span className="font-medium text-foreground">{filteredItems.length}</span> de {items.length} items
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="h-8"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Limpiar filtros
                                </Button>
                            </div>
                        )}
                    </div>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Cargando inventario...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                No hay items en el inventario
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Comienza agregando tu primer item de inventario
                            </p>
                            <Button onClick={handleCreateItem}>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Item
                            </Button>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-12">
                            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                No se encontraron items
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                No hay items que coincidan con los filtros seleccionados
                            </p>
                            <Button variant="outline" onClick={handleClearFilters}>
                                <X className="h-4 w-4 mr-2" />
                                Limpiar filtros
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left text-sm font-medium">Código</th>
                                            <th className="p-3 text-left text-sm font-medium">Nombre</th>
                                            <th className="p-3 text-left text-sm font-medium">Categoría</th>
                                            <th className="p-3 text-right text-sm font-medium">Stock</th>
                                            <th className="p-3 text-right text-sm font-medium">Mínimo</th>
                                            <th className="p-3 text-right text-sm font-medium">P. Costo</th>
                                            <th className="p-3 text-right text-sm font-medium">P. Venta</th>
                                            <th className="p-3 text-right text-sm font-medium">Margen %</th>
                                            <th className="p-3 text-center text-sm font-medium">Estado</th>
                                            <th className="p-3 text-center text-sm font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map((item) => (
                                            <tr key={item.id_item} className="border-b hover:bg-muted/50">
                                                <td className="p-3 text-sm text-muted-foreground">
                                                    {item.codigo || '-'}
                                                </td>
                                                <td className="p-3 text-sm font-medium">{item.nombre}</td>
                                                <td className="p-3 text-sm">
                                                    {item.categorias_inventario?.nombre || '-'}
                                                </td>
                                                <td className="p-3 text-sm text-right">
                                                    {item.stock_actual} {item.unidad_medida}
                                                </td>
                                                <td className="p-3 text-sm text-right text-muted-foreground">
                                                    {item.stock_minimo}
                                                </td>
                                                <td className="p-3 text-sm text-right">
                                                    {item.precio_costo
                                                        ? formatCurrency(item.precio_costo)
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="p-3 text-sm text-right">
                                                    {item.precio_venta
                                                        ? formatCurrency(item.precio_venta)
                                                        : '-'
                                                    }
                                                </td>
                                                <td className="p-3 text-sm text-right">
                                                    {item.margen_porcentaje !== undefined ? (
                                                        <span className={`font-medium ${item.margen_porcentaje >= 30 ? 'text-green-600' :
                                                                item.margen_porcentaje >= 15 ? 'text-blue-600' :
                                                                    item.margen_porcentaje >= 0 ? 'text-orange-600' :
                                                                        'text-red-600'
                                                            }`}>
                                                            {item.margen_porcentaje.toFixed(1)}%
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {item.stock_bajo ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            Stock Bajo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                                            OK
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleMovement(item)}
                                                            title="Registrar movimiento"
                                                        >
                                                            <ArrowDownCircle className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditItem(item)}
                                                            title="Editar"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteItem(item)}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <InventoryItemSheet
                open={itemSheetOpen}
                onOpenChange={setItemSheetOpen}
                item={selectedItem}
                categorias={categorias}
                onSuccess={loadData}
            />

            {selectedItem && (
                <MovementDialog
                    open={movementDialogOpen}
                    onOpenChange={setMovementDialogOpen}
                    item={selectedItem}
                    proveedores={proveedores}
                    onSuccess={loadData}
                />
            )}
        </div>
    )
}
