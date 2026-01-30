'use client'

import Link from 'next/link'
import {
    Sprout,
    MoreHorizontal,
    Pencil,
    Trash2,
    CheckSquare,
    Stethoscope,
    Calendar,
    Flower,
    Image as ImageIcon,
    CheckCircle2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PlantaConDetalles } from '@/types'

interface PlantasGridProps {
    plantas: PlantaConDetalles[]
    onEdit?: (planta: PlantaConDetalles) => void
    onDelete?: (id: number, nombre: string) => void
    onCreateTarea?: (planta: PlantaConDetalles) => void
    onCreateHistoria?: (planta: PlantaConDetalles) => void
    selectedIds?: number[]
    onToggleSelection?: (id: number) => void
}

export function PlantasGrid({
    plantas,
    onEdit,
    onDelete,
    onCreateTarea,
    onCreateHistoria,
    selectedIds = [],
    onToggleSelection
}: PlantasGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plantas.map((planta) => (
                <PlantaCard
                    key={planta.id_planta}
                    planta={planta}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCreateTarea={onCreateTarea}
                    onCreateHistoria={onCreateHistoria}
                    isSelected={selectedIds.includes(planta.id_planta)}
                    onToggleSelect={() => onToggleSelection?.(planta.id_planta)}
                />
            ))}
        </div>
    )
}

function PlantaCard({
    planta,
    onEdit,
    onDelete,
    onCreateTarea,
    onCreateHistoria,
    isSelected,
    onToggleSelect
}: {
    planta: PlantaConDetalles
    onEdit?: (planta: PlantaConDetalles) => void
    onDelete?: (id: number, nombre: string) => void
    onCreateTarea?: (planta: PlantaConDetalles) => void
    onCreateHistoria?: (planta: PlantaConDetalles) => void
    isSelected: boolean
    onToggleSelect: () => void
}) {
    const getStatusConfig = (planta: PlantaConDetalles) => {
        if (planta.esta_muerta) {
            return {
                label: 'Muerta',
                color: 'bg-destructive/10 text-destructive border-destructive/20',
                glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            }
        }
        if (planta.esta_enferma) {
            return {
                label: 'Enferma',
                color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
                glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]'
            }
        }
        return {
            label: 'Normal',
            color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        }
    }

    const status = getStatusConfig(planta)

    return (
        <Card className={`group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-md transition-all hover:shadow-2xl hover:-translate-y-1 ${isSelected ? 'ring-2 ring-primary border-primary shadow-lg scale-[1.02]' : status.glow}`}>
            <CardContent className="p-0">
                {/* Header / Image Area */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {planta.image_url ? (
                        <div className="relative h-full w-full">
                            <img
                                src={planta.image_url}
                                alt={planta.nombre}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    // Fallback if image fails to load
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.parentElement?.querySelector('.fallback')?.classList.remove('hidden')
                                }}
                            />
                            <div className="fallback hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground/30">
                                <ImageIcon className="h-12 w-12" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50 text-muted-foreground/30">
                            <ImageIcon className="h-12 w-12" />
                        </div>
                    )}

                    {/* Checkbox (Multi-selection) */}
                    <div className={`absolute top-3 left-3 z-20 transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90'}`}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleSelect();
                            }}
                            className={`h-6 w-6 rounded-lg flex items-center justify-center border-2 transition-all shadow-lg ${isSelected
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'bg-background/80 border-white/50 text-primary hover:border-primary'
                                }`}
                        >
                            {isSelected && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Status Badge Over Image - Shifted if not selected */}
                    <div className={`absolute top-3 left-12 transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 -translate-x-9 group-hover:translate-x-0'}`}>
                        <Badge variant="outline" className={`rounded-full backdrop-blur-md ${status.color}`}>
                            {status.label}
                        </Badge>
                    </div>

                    {/* Action Button Over Image */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-md">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem onClick={() => onEdit?.(planta)} className="rounded-lg">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onCreateTarea?.(planta)} className="rounded-lg">
                                    <CheckSquare className="mr-2 h-4 w-4" />
                                    Nueva tarea
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onCreateHistoria?.(planta)} className="rounded-lg">
                                    <Stethoscope className="mr-2 h-4 w-4" />
                                    Registro médico
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete?.(planta.id_planta, planta.nombre)}
                                    className="rounded-lg text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Flowering indicator */}
                    {planta.floracion && (
                        <div className="absolute bottom-3 right-3">
                            <Badge variant="secondary" className="rounded-full bg-pink-500/10 text-pink-500 border-pink-500/20 backdrop-blur-md">
                                <Flower className="h-3 w-3 mr-1" />
                                Floración
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="p-4 space-y-3">
                    <div>
                        <Link
                            href={`/plantas/${planta.id_planta}`}
                            className="text-lg font-bold hover:text-primary transition-colors line-clamp-1 after:absolute after:inset-0 after:z-0"
                        >
                            {planta.nombre}
                        </Link>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Sprout className="h-3 w-3" />
                            {planta.generos_planta?.nombre} {planta.subgeneros_planta?.nombre && `• ${planta.subgeneros_planta.nombre}`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-1 border-t">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{planta.fecha_compra ? new Date(planta.fecha_compra).toLocaleDateString('es-ES') : 'N/A'}</span>
                            </div>
                            <span className="font-medium px-2 py-0.5 rounded-full bg-muted/50">
                                {planta.tipos_planta?.nombre || 'General'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
