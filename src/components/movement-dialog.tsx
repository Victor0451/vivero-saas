'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { createMovimiento } from '@/app/actions/inventario'
import { showToast } from '@/lib/toast'
import type { ItemInventario, Proveedor } from '@/types'
import { ArrowDownCircle, ArrowUpCircle, Settings } from 'lucide-react'

type MovementDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    item: ItemInventario
    proveedores: Proveedor[]
    onSuccess: () => void
}

export function MovementDialog({
    open,
    onOpenChange,
    item,
    proveedores,
    onSuccess
}: MovementDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [tipo, setTipo] = useState<'entrada' | 'salida' | 'ajuste'>('entrada')
    const [formData, setFormData] = useState({
        cantidad: '',
        precio_unitario: '',
        motivo: '',
        referencia: '',
        id_proveedor: '',
        notas: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const cantidad = parseFloat(formData.cantidad)
        if (!cantidad || cantidad <= 0) {
            showToast.error('La cantidad debe ser mayor a 0')
            return
        }

        try {
            setIsLoading(true)

            await createMovimiento({
                id_item: item.id_item,
                tipo,
                cantidad,
                precio_unitario: formData.precio_unitario ? parseFloat(formData.precio_unitario) : undefined,
                motivo: formData.motivo || undefined,
                referencia: formData.referencia || undefined,
                id_proveedor: formData.id_proveedor ? parseInt(formData.id_proveedor) : undefined,
                notas: formData.notas || undefined
            })

            showToast.success(`${tipo === 'entrada' ? 'Entrada' : tipo === 'salida' ? 'Salida' : 'Ajuste'} registrado correctamente`)
            onSuccess()
            onOpenChange(false)

            // Reset form
            setFormData({
                cantidad: '',
                precio_unitario: '',
                motivo: '',
                referencia: '',
                id_proveedor: '',
                notas: ''
            })
        } catch (error) {
            console.error('Error registrando movimiento:', error)
            showToast.error(error instanceof Error ? error.message : 'Error al registrar el movimiento')
        } finally {
            setIsLoading(false)
        }
    }

    const getTipoIcon = () => {
        switch (tipo) {
            case 'entrada':
                return <ArrowDownCircle className="h-5 w-5 text-green-600" />
            case 'salida':
                return <ArrowUpCircle className="h-5 w-5 text-red-600" />
            case 'ajuste':
                return <Settings className="h-5 w-5 text-blue-600" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getTipoIcon()}
                        Registrar Movimiento
                    </DialogTitle>
                    <DialogDescription>
                        Item: <span className="font-medium">{item.nombre}</span>
                        <br />
                        Stock actual: <span className="font-medium">{item.stock_actual} {item.unidad_medida}</span>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tipo de Movimiento</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                type="button"
                                variant={tipo === 'entrada' ? 'default' : 'outline'}
                                className="w-full"
                                onClick={() => setTipo('entrada')}
                            >
                                <ArrowDownCircle className="h-4 w-4 mr-2" />
                                Entrada
                            </Button>
                            <Button
                                type="button"
                                variant={tipo === 'salida' ? 'default' : 'outline'}
                                className="w-full"
                                onClick={() => setTipo('salida')}
                            >
                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                                Salida
                            </Button>
                            <Button
                                type="button"
                                variant={tipo === 'ajuste' ? 'default' : 'outline'}
                                className="w-full"
                                onClick={() => setTipo('ajuste')}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Ajuste
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cantidad">
                                {tipo === 'ajuste' ? 'Nuevo Stock *' : 'Cantidad *'}
                            </Label>
                            <Input
                                id="cantidad"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={tipo === 'ajuste' ? 'Stock final' : '0'}
                                value={formData.cantidad}
                                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="precio_unitario">Precio Unitario</Label>
                            <Input
                                id="precio_unitario"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="$0.00"
                                value={formData.precio_unitario}
                                onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                            />
                        </div>
                    </div>

                    {tipo === 'entrada' && proveedores.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="proveedor">Proveedor</Label>
                            <Select
                                value={formData.id_proveedor}
                                onValueChange={(value) => setFormData({ ...formData, id_proveedor: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {proveedores.map((prov) => (
                                        <SelectItem key={prov.id_proveedor} value={prov.id_proveedor.toString()}>
                                            {prov.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="motivo">Motivo</Label>
                            <Input
                                id="motivo"
                                placeholder="Ej: Compra, Consumo, Corrección"
                                value={formData.motivo}
                                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="referencia">Referencia</Label>
                            <Input
                                id="referencia"
                                placeholder="Ej: Factura #123"
                                value={formData.referencia}
                                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notas">Notas</Label>
                        <Textarea
                            id="notas"
                            placeholder="Notas adicionales..."
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                            rows={2}
                        />
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
                            {isLoading ? 'Registrando...' : 'Registrar Movimiento'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
