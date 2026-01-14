'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Plus, Calendar, User } from 'lucide-react'
import { getMaterialesConsumidosPorTarea } from '@/app/actions/inventario-tareas'
import { getItems } from '@/app/actions/inventario'
import { MaterialConsumoDialog } from './material-consumo-dialog'
import type { MovimientoConDetalles, ItemInventarioConDetalles } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type MaterialesConsumidosCardProps = {
    idTarea: number
    tituloTarea: string
}

export function MaterialesConsumidosCard({
    idTarea,
    tituloTarea
}: MaterialesConsumidosCardProps) {
    const [materiales, setMateriales] = useState<MovimientoConDetalles[]>([])
    const [items, setItems] = useState<ItemInventarioConDetalles[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true)
            const [materialesData, itemsData] = await Promise.all([
                getMaterialesConsumidosPorTarea(idTarea),
                getItems()
            ])
            setMateriales(materialesData)
            setItems(itemsData)
        } catch (error) {
            console.error('Error cargando materiales:', error)
        } finally {
            setIsLoading(false)
        }
    }, [idTarea])

    useEffect(() => {
        loadData()
    }, [loadData])

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
        } catch {
            return dateString
        }
    }

    const getTotalCantidad = () => {
        return materiales.reduce((sum, m) => sum + m.cantidad, 0)
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Materiales Consumidos
                    </CardTitle>
                    <Button onClick={() => setDialogOpen(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Materiales
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Cargando materiales...
                        </div>
                    ) : materiales.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                No hay materiales registrados
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Registra los materiales que se consumieron en esta tarea
                            </p>
                            <Button onClick={() => setDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Registrar Materiales
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Resumen */}
                            <div className="bg-muted/50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total de Items</p>
                                        <p className="text-2xl font-bold">{materiales.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cantidad Total</p>
                                        <p className="text-2xl font-bold">{getTotalCantidad().toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de materiales */}
                            <div className="space-y-3">
                                {materiales.map((material) => (
                                    <div
                                        key={material.id_movimiento}
                                        className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <h4 className="font-medium">
                                                        {material.items_inventario?.nombre || 'Item desconocido'}
                                                    </h4>
                                                </div>

                                                <div className="grid gap-2 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <span className="font-medium">Cantidad:</span>
                                                        <span>
                                                            {material.cantidad} {material.items_inventario?.unidad_medida}
                                                        </span>
                                                    </div>

                                                    {material.motivo && (
                                                        <div className="flex items-start gap-2 text-muted-foreground">
                                                            <span className="font-medium">Motivo:</span>
                                                            <span>{material.motivo}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(material.fecha)}
                                                        </div>
                                                        {material.users && (
                                                            <div className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {material.users.nombre}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stock anterior/nuevo */}
                                            <div className="text-right text-sm">
                                                <div className="text-muted-foreground">Stock</div>
                                                <div className="font-mono">
                                                    <span className="text-red-600">{material.stock_anterior}</span>
                                                    {' → '}
                                                    <span className="text-green-600">{material.stock_nuevo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog para registrar materiales */}
            <MaterialConsumoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                idTarea={idTarea}
                tituloTarea={tituloTarea}
                items={items}
                onSuccess={loadData}
            />
        </>
    )
}
