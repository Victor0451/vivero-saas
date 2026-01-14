'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { PieChart } from '@/components/charts/pie-chart'
import { DateRangeFilter } from '@/components/dashboard/date-range-filter'
import { TrendingUp, Activity, PieChartIcon } from 'lucide-react'
import { exportToExcel, exportToPDF } from '@/lib/export-utils'
import { toast } from 'sonner'
import type { PlantHealthTrend, TaskCompletionData, PlantDistribution } from '@/app/actions/analytics'
import { getPlantHealthTrends, getTaskCompletionRate } from '@/app/actions/analytics'

interface AnalyticsSectionProps {
    initialHealthTrends: PlantHealthTrend[]
    initialTaskCompletion: TaskCompletionData[]
    initialPlantDistribution: PlantDistribution[]
}

export function AnalyticsSection({
    initialHealthTrends,
    initialTaskCompletion,
    initialPlantDistribution
}: AnalyticsSectionProps) {
    const [healthTrends, setHealthTrends] = useState(initialHealthTrends)
    const [taskCompletion, setTaskCompletion] = useState(initialTaskCompletion)
    const [plantDistribution] = useState(initialPlantDistribution)
    const [isPending, startTransition] = useTransition()

    const handleDateRangeChange = async (startDate: Date, endDate: Date, months: number) => {
        startTransition(async () => {
            try {
                const [newHealthTrends, newTaskCompletion] = await Promise.all([
                    getPlantHealthTrends(months),
                    getTaskCompletionRate(months)
                ])

                setHealthTrends(newHealthTrends)
                setTaskCompletion(newTaskCompletion)

                toast.success(`Datos actualizados para los últimos ${months} meses`)
            } catch (error) {
                console.error('Error updating date range:', error)
                toast.error('Error al actualizar los datos')
            }
        })
    }

    const handleExport = (format: 'excel' | 'pdf') => {
        try {
            const exportData = {
                healthTrends,
                taskCompletion,
                plantDistribution
            }

            if (format === 'excel') {
                exportToExcel(exportData)
                toast.success('Reporte Excel descargado exitosamente')
            } else {
                exportToPDF(exportData)
                toast.success('Reporte PDF descargado exitosamente')
            }
        } catch (error) {
            console.error('Error exporting:', error)
            toast.error(`Error al exportar a ${format.toUpperCase()}`)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Analytics</h2>
                </div>
                {isPending && (
                    <div className="text-sm text-muted-foreground animate-pulse">
                        Actualizando datos...
                    </div>
                )}
            </div>

            {/* Date Range Filter and Export */}
            <DateRangeFilter
                onDateRangeChange={handleDateRangeChange}
                onExport={handleExport}
            />

            <div className="grid gap-4 md:grid-cols-2">
                {/* Tendencias de Salud de Plantas */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Tendencias de Salud de Plantas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LineChart
                            data={healthTrends}
                            xKey="mes"
                            lines={[
                                { dataKey: 'saludables', name: 'Saludables', color: '#22c55e' },
                                { dataKey: 'enfermas', name: 'Enfermas', color: '#eab308' },
                                { dataKey: 'muertas', name: 'Muertas', color: '#ef4444' }
                            ]}
                        />
                    </CardContent>
                </Card>

                {/* Distribución por Género */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            Distribución por Género
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChart
                            data={plantDistribution}
                            colors={[
                                '#22c55e',
                                '#3b82f6',
                                '#a855f7',
                                '#f59e0b',
                                '#ec4899',
                                '#14b8a6',
                                '#f97316',
                                '#8b5cf6'
                            ]}
                        />
                    </CardContent>
                </Card>

                {/* Tasa de Completado de Tareas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Completado de Tareas por Mes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={taskCompletion}
                            xKey="mes"
                            bars={[
                                { dataKey: 'completadas', name: 'Completadas', color: '#22c55e' },
                                { dataKey: 'pendientes', name: 'Pendientes', color: '#f59e0b' }
                            ]}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
