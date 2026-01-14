'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Package, Plus, Trash2, Loader2 } from 'lucide-react'
import { registrarConsumoTarea, type ConsumoMaterial } from '@/app/actions/inventario-tareas'
import { showToast } from '@/lib/toast'
import type { ItemInventarioConDetalles } from '@/types'

type MaterialConsumoDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    idTarea: number
    tituloTarea: string
    items: ItemInventarioConDetalles[]
    onSuccess: () => void
}

type MaterialFormItem = {
    id: string
    id_item: string
    cantidad: string
    motivo: string
}

export function MaterialConsumoDialog({
    open,
    onOpenChange,
    idTarea,
    tituloTarea,
    items,
    onSuccess
}: MaterialConsumoDialogProps) {
    const [materiales, setMateriales] = useState<MaterialFormItem[]>([
        { id: '1', id_item: '', cantidad: '', motivo: '' }
    ])
    const [isLoading, setIsLoading] = useState(false)

    const handleAddMaterial = () => {
        const newId = (Math.max(...materiales.map(m => parseInt(m.id))) + 1).toString()
        setMateriales([
            ...materiales,
            { id: newId, id_item: '', cantidad: '', motivo: '' }
        ])
    }

    const handleRemoveMaterial = (id: string) => {
        if (materiales.length > 1) {
            setMateriales(materiales.filter(m => m.id !== id))
        }
    }

    const handleMaterialChange = (id: string, field: keyof MaterialFormItem, value: string) => {
        setMateriales(materiales.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar que todos los materiales tengan item y cantidad
        const materialesValidos = materiales.filter(m => m.id_item && m.cantidad)

        if (materialesValidos.length === 0) {
            showToast.error('Debes agregar al menos un material con cantidad')
            return
        }

        // Convertir a formato esperado
        const consumos: ConsumoMaterial[] = materialesValidos.map(m => ({
            id_item: parseInt(m.id_item),
            cantidad: parseFloat(m.cantidad),
            motivo: m.motivo || undefined
        }))

        try {
            setIsLoading(true)
            await registrarConsumoTarea(idTarea, consumos)

            showToast.success(`${consumos.length} material(es) registrado(s) correctamente`)

            // Resetear formulario
            setMateriales([{ id: '1', id_item: '', cantidad: '', motivo: '' }])

            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error registrando materiales:', error)
            showToast.error(error instanceof Error ? error.message : 'Error al registrar materiales')
        } finally {
            setIsLoading(false)
        }
    }

    const getItemStock = (id_item: string) => {
        const item = items.find(i => i.id_item.toString() === id_item)
        return item?.stock_actual || 0
    }

    const getItemUnidad = (id_item: string) => {
        const item = items.find(i => i.id_item.toString() === id_item)
        return item?.unidad_medida || ''
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Registrar Materiales Consumidos
                    </DialogTitle>
                    <DialogDescription>
                        Tarea: <span className="font-medium">{tituloTarea}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        {materiales.map((material, index) => (
                            <div key={material.id} className="grid gap-4 p-4 border rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">
                                        Material #{index + 1}
                                    </Label>
                                    {materiales.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMaterial(material.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Selector de Item */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`item-${material.id}`}>Item *</Label>
                                        <Select
                                            value={material.id_item}
                                            onValueChange={(value) => handleMaterialChange(material.id, 'id_item', value)}
                                        >
                                            <SelectTrigger id={`item-${material.id}`}>
                                                <SelectValue placeholder="Seleccionar item" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {items.map((item) => (
                                                    <SelectItem key={item.id_item} value={item.id_item.toString()}>
                                                        {item.nombre}
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            (Stock: {item.stock_actual} {item.unidad_medida})
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Cantidad */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`cantidad-${material.id}`}>
                                            Cantidad *
                                            {material.id_item && (
                                                <span className="text-xs text-muted-foreground ml-2">
                                                    (Disponible: {getItemStock(material.id_item)} {getItemUnidad(material.id_item)})
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            id={`cantidad-${material.id}`}
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            placeholder="0.00"
                                            value={material.cantidad}
                                            onChange={(e) => handleMaterialChange(material.id, 'cantidad', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Motivo (opcional) */}
                                <div className="space-y-2">
                                    <Label htmlFor={`motivo-${material.id}`}>Motivo (opcional)</Label>
                                    <Input
                                        id={`motivo-${material.id}`}
                                        placeholder="Ej: Fertilización de rosas"
                                        value={material.motivo}
                                        onChange={(e) => handleMaterialChange(material.id, 'motivo', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Botón agregar material */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddMaterial}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar otro material
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <Package className="h-4 w-4 mr-2" />
                                    Registrar Materiales
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
