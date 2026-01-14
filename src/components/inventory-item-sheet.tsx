'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createItem, updateItem } from '@/app/actions/inventario'
import { showToast } from '@/lib/toast'
import type { ItemInventario, CategoriaInventario } from '@/types'

type InventoryItemSheetProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    item?: ItemInventario | null
    categorias: CategoriaInventario[]
    onSuccess: () => void
}

const unidadesMedida = [
    'unidades',
    'kg',
    'gramos',
    'litros',
    'ml',
    'metros',
    'cm',
    'paquetes',
    'cajas'
]

export function InventoryItemSheet({
    open,
    onOpenChange,
    item,
    categorias,
    onSuccess
}: InventoryItemSheetProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        codigo: '',
        nombre: '',
        descripcion: '',
        id_categoria: '',
        unidad_medida: 'unidades',
        stock_minimo: '0',
        stock_maximo: '',
        precio_costo: '',
        precio_venta: '',
        ubicacion: ''
    })

    // Actualizar formData cuando cambia el item o cuando se abre el sheet
    useEffect(() => {
        if (open) {
            if (item) {
                // Modo edición: cargar datos del item
                setFormData({
                    codigo: item.codigo || '',
                    nombre: item.nombre || '',
                    descripcion: item.descripcion || '',
                    id_categoria: item.id_categoria?.toString() || '',
                    unidad_medida: item.unidad_medida || 'unidades',
                    stock_minimo: item.stock_minimo?.toString() || '0',
                    stock_maximo: item.stock_maximo?.toString() || '',
                    precio_costo: item.precio_costo?.toString() || '',
                    precio_venta: item.precio_venta?.toString() || '',
                    ubicacion: item.ubicacion || ''
                })
            } else {
                // Modo creación: resetear formulario
                setFormData({
                    codigo: '',
                    nombre: '',
                    descripcion: '',
                    id_categoria: '',
                    unidad_medida: 'unidades',
                    stock_minimo: '0',
                    stock_maximo: '',
                    precio_costo: '',
                    precio_venta: '',
                    ubicacion: ''
                })
            }
        }
    }, [item, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.nombre.trim()) {
            showToast.error('El nombre es obligatorio')
            return
        }

        if (!formData.unidad_medida) {
            showToast.error('La unidad de medida es obligatoria')
            return
        }

        try {
            setIsLoading(true)

            const data = {
                codigo: formData.codigo || undefined,
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion || undefined,
                id_categoria: formData.id_categoria ? parseInt(formData.id_categoria) : undefined,
                unidad_medida: formData.unidad_medida,
                stock_minimo: parseFloat(formData.stock_minimo) || 0,
                stock_maximo: formData.stock_maximo ? parseFloat(formData.stock_maximo) : undefined,
                precio_costo: formData.precio_costo ? parseFloat(formData.precio_costo) : undefined,
                precio_venta: formData.precio_venta ? parseFloat(formData.precio_venta) : undefined,
                ubicacion: formData.ubicacion || undefined,
                activo: true
            }

            if (item) {
                await updateItem(item.id_item, data)
                showToast.success('Item actualizado correctamente')
            } else {
                await createItem(data)
                showToast.success('Item creado correctamente')
            }

            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error guardando item:', error)
            showToast.error(error instanceof Error ? error.message : 'Error al guardar el item')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{item ? 'Editar Item' : 'Nuevo Item de Inventario'}</SheetTitle>
                    <SheetDescription>
                        {item
                            ? 'Modifica la información del item de inventario'
                            : 'Agrega un nuevo item al inventario'
                        }
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código/SKU</Label>
                            <Input
                                id="codigo"
                                placeholder="Ej: MAC-001"
                                value={formData.codigo}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoria">Categoría</Label>
                            <Select
                                value={formData.id_categoria}
                                onValueChange={(value) => setFormData({ ...formData, id_categoria: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categorias.map((cat) => (
                                        <SelectItem key={cat.id_categoria} value={cat.id_categoria.toString()}>
                                            {cat.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej: Maceta de plástico 20cm"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea
                            id="descripcion"
                            placeholder="Descripción detallada del item..."
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unidad_medida">Unidad de Medida *</Label>
                            <Select
                                value={formData.unidad_medida}
                                onValueChange={(value) => setFormData({ ...formData, unidad_medida: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {unidadesMedida.map((unidad) => (
                                        <SelectItem key={unidad} value={unidad}>
                                            {unidad}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ubicacion">Ubicación</Label>
                            <Input
                                id="ubicacion"
                                placeholder="Ej: Estante A-3"
                                value={formData.ubicacion}
                                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                            <Input
                                id="stock_minimo"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.stock_minimo}
                                onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock_maximo">Stock Máximo</Label>
                            <Input
                                id="stock_maximo"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Opcional"
                                value={formData.stock_maximo}
                                onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="precio_costo">Precio de Costo</Label>
                            <Input
                                id="precio_costo"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="$0.00"
                                value={formData.precio_costo}
                                onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="precio_venta">Precio de Venta</Label>
                            <Input
                                id="precio_venta"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="$0.00"
                                value={formData.precio_venta}
                                onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : item ? 'Actualizar' : 'Crear Item'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
