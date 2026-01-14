import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getItemsStockBajo, getEstadisticasInventario } from '@/app/actions/inventario'

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

export async function InventoryWidget() {
    let itemsStockBajo
    let stats
    let hasError = false

    try {
        [itemsStockBajo, stats] = await Promise.all([
            getItemsStockBajo(),
            getEstadisticasInventario()
        ])
    } catch (error) {
        console.error('Error loading inventory widget:', error)
        hasError = true
    }

    // Error state
    if (hasError) {
        return (
            <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inventario</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Error al cargar inventario</p>
                </CardContent>
            </Card>
        )
    }

    // Guard clause
    if (!stats || !itemsStockBajo) {
        return null
    }

    return (
        <Card className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventario</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Total Items</p>
                        <p className="text-2xl font-bold">{stats.totalItems}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                        <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <p className="text-lg font-bold">{formatCurrency(stats.valorTotal)}</p>
                        </div>
                    </div>
                </div>

                {/* Stock Bajo Alert */}
                {stats.stockBajoCount > 0 && (
                    <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 p-3 border border-orange-200 dark:border-orange-900">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                    {stats.stockBajoCount} {stats.stockBajoCount === 1 ? 'item' : 'items'} con stock bajo
                                </p>
                                {itemsStockBajo.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {itemsStockBajo.slice(0, 3).map((item) => (
                                            <div key={item.id_item} className="text-xs text-orange-800 dark:text-orange-200">
                                                • {item.nombre} ({item.stock_actual}/{item.stock_minimo} {item.unidad_medida})
                                            </div>
                                        ))}
                                        {itemsStockBajo.length > 3 && (
                                            <p className="text-xs text-orange-700 dark:text-orange-300 italic">
                                                +{itemsStockBajo.length - 3} más...
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* No Stock Issues */}
                {stats.stockBajoCount === 0 && stats.totalItems > 0 && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-600" />
                            <p className="text-sm text-green-900 dark:text-green-100">
                                Todo el inventario está en niveles óptimos
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {stats.totalItems === 0 && (
                    <div className="text-center py-4">
                        <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No hay items en el inventario
                        </p>
                    </div>
                )}

                {/* Action Button */}
                <Link href="/inventario" className="block">
                    <Button variant="outline" className="w-full" size="sm">
                        Ver Inventario Completo
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
