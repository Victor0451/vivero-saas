'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar, Download } from 'lucide-react'
import { subMonths } from "date-fns"

interface DateRangeFilterProps {
    onDateRangeChange: (startDate: Date, endDate: Date, months: number) => void
    onExport: (format: 'excel' | 'pdf') => void
}

export function DateRangeFilter({ onDateRangeChange, onExport }: DateRangeFilterProps) {
    const [selectedRange, setSelectedRange] = useState<number>(6)

    const dateRanges = [
        { label: '3 meses', value: 3 },
        { label: '6 meses', value: 6 },
        { label: '12 meses', value: 12 },
    ]

    const handleRangeChange = (months: number) => {
        setSelectedRange(months)
        const endDate = new Date()
        const startDate = subMonths(endDate, months)
        onDateRangeChange(startDate, endDate, months)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Filtros y Exportación
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date Range Selector */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Rango de Fechas</Label>
                    <div className="flex gap-2">
                        {dateRanges.map((range) => (
                            <Button
                                key={range.value}
                                variant={selectedRange === range.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleRangeChange(range.value)}
                                className="flex-1"
                            >
                                {range.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Export Buttons */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Exportar Reporte</Label>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExport('excel')}
                            className="flex-1"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Excel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onExport('pdf')}
                            className="flex-1"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                    </div>
                </div>

                {/* Current Range Display */}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                    Mostrando datos de los últimos <span className="font-medium">{selectedRange} meses</span>
                </div>
            </CardContent>
        </Card>
    )
}
