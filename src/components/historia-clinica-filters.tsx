'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Filter } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

export interface FilterState {
    search: string
    tipoEvento: string
    estado: string
    fechaStart: string
    fechaEnd: string
}

const initialFilters: FilterState = {
    search: '',
    tipoEvento: 'all',
    estado: 'all',
    fechaStart: '',
    fechaEnd: ''
}

interface HistoriaClinicaFiltersProps {
    onFilterChange: (filters: FilterState) => void
    activeFiltersCount: number
}

export function HistoriaClinicaFilters({ onFilterChange, activeFiltersCount }: HistoriaClinicaFiltersProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters)

    useEffect(() => {
        onFilterChange(filters)
    }, [filters, onFilterChange])

    const handleReset = () => {
        setFilters(initialFilters)
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Buscar diagnostico, tratamiento..."
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="flex gap-2 relative">
                        <Filter className="h-4 w-4" />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] ml-1">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                        <h4 className="font-medium leading-none mb-2">Filtros Avanzados</h4>

                        <div className="space-y-2">
                            <Label>Tipo de Evento</Label>
                            <Select
                                value={filters.tipoEvento}
                                onValueChange={(value) => setFilters({ ...filters, tipoEvento: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="Diagnóstico">Diagnóstico</SelectItem>
                                    <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                                    <SelectItem value="Riego">Riego</SelectItem>
                                    <SelectItem value="Poda">Poda</SelectItem>
                                    <SelectItem value="Transplante">Transplante</SelectItem>
                                    <SelectItem value="Fertilización">Fertilización</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado de Salud</Label>
                            <Select
                                value={filters.estado}
                                onValueChange={(value) => setFilters({ ...filters, estado: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="enferma">Enferma</SelectItem>
                                    <SelectItem value="sana">Sana</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                                <Label className="text-xs">Desde</Label>
                                <Input
                                    type="date"
                                    value={filters.fechaStart}
                                    onChange={(e) => setFilters({ ...filters, fechaStart: e.target.value })}
                                    className="h-8 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Hasta</Label>
                                <Input
                                    type="date"
                                    value={filters.fechaEnd}
                                    onChange={(e) => setFilters({ ...filters, fechaEnd: e.target.value })}
                                    className="h-8 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="text-muted-foreground h-8 px-2"
                            >
                                Limpiar
                            </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
