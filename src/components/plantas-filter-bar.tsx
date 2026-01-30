'use client'

import { Search, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { GeneroPlanta, SubgeneroConGenero } from '@/types'

interface PlantasFilterBarProps {
    search: string
    onSearchChange: (value: string) => void
    genreId: string
    onGenreIdChange: (value: string) => void
    subgenreId: string
    onSubgenreIdChange: (value: string) => void
    status: string
    onStatusChange: (value: string) => void
    viewMode: 'grid' | 'list'
    onViewModeChange: (mode: 'grid' | 'list') => void
    generos: GeneroPlanta[]
    subgeneros: SubgeneroConGenero[]
}

export function PlantasFilterBar({
    search,
    onSearchChange,
    genreId,
    onGenreIdChange,
    subgenreId,
    onSubgenreIdChange,
    status,
    onStatusChange,
    viewMode,
    onViewModeChange,
    generos,
    subgeneros
}: PlantasFilterBarProps) {
    // Filter subgenres based on selected genre
    const filteredSubgeneros = subgeneros.filter(s =>
        !genreId || genreId === 'all' || s.id_genero.toString() === genreId
    )

    const hasActiveFilters = search || (genreId && genreId !== 'all') || (subgenreId && subgenreId !== 'all') || (status && status !== 'all')

    const clearFilters = () => {
        onSearchChange('')
        onGenreIdChange('all')
        onSubgenreIdChange('all')
        onStatusChange('all')
    }

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border bg-background/50 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm outline-none"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Filters Group */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Genre */}
                    <Select value={genreId} onValueChange={onGenreIdChange}>
                        <SelectTrigger className="w-[160px] rounded-xl border-dashed bg-background/30 backdrop-blur-sm h-10">
                            <SelectValue placeholder="Género" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Géneros</SelectItem>
                            {generos.map((g) => (
                                <SelectItem key={g.id_genero} value={g.id_genero.toString()}>
                                    {g.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Subgenre */}
                    <Select
                        value={subgenreId}
                        onValueChange={onSubgenreIdChange}
                        disabled={!genreId || genreId === 'all'}
                    >
                        <SelectTrigger className="w-[160px] rounded-xl border-dashed bg-background/30 backdrop-blur-sm h-10">
                            <SelectValue placeholder="Subgénero" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Subgéneros</SelectItem>
                            {filteredSubgeneros.map((s) => (
                                <SelectItem key={s.id_subgenero} value={s.id_subgenero.toString()}>
                                    {s.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status */}
                    <Select value={status} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-[140px] rounded-xl border-dashed bg-background/30 backdrop-blur-sm h-10">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Cualquier Estado</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="enferma">Enferma</SelectItem>
                            <SelectItem value="muerta">Muerta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl border bg-background/30 backdrop-blur-sm ml-auto">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => onViewModeChange('grid')}
                        className="h-8 w-8 rounded-lg transition-all"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => onViewModeChange('list')}
                        className="h-8 w-8 rounded-lg transition-all"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <SlidersHorizontal className="h-3 w-3" />
                        Filtros activos:
                    </span>
                    {search && (
                        <Badge variant="secondary" className="rounded-full gap-1 h-6">
                            Búsqueda: {search}
                            <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => onSearchChange('')} />
                        </Badge>
                    )}
                    {genreId !== 'all' && (
                        <Badge variant="secondary" className="rounded-full gap-1 h-6">
                            Género: {generos.find(g => g.id_genero.toString() === genreId)?.nombre}
                            <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => onGenreIdChange('all')} />
                        </Badge>
                    )}
                    {subgenreId !== 'all' && (
                        <Badge variant="secondary" className="rounded-full gap-1 h-6">
                            Subgénero: {subgeneros.find(s => s.id_subgenero.toString() === subgenreId)?.nombre}
                            <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => onSubgenreIdChange('all')} />
                        </Badge>
                    )}
                    {status !== 'all' && (
                        <Badge variant="secondary" className="rounded-full gap-1 h-6">
                            Estado: {status}
                            <X className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => onStatusChange('all')} />
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 text-[10px] px-2 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                        Limpiar todo
                    </Button>
                </div>
            )}
        </div>
    )
}
