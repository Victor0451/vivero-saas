'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Calendar,
    Stethoscope,
    Droplets,
    Scissors,
    Sprout,
    Skull,
    Activity,
    Syringe,
    MoveRight,
    ChevronDown,
    MoreVertical,
    Pencil,
    Trash2
} from 'lucide-react'
import type { HistoriaClinica } from '@/types'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HistoriaClinicaTimelineProps {
    historias: HistoriaClinica[]
    onEdit?: (historia: HistoriaClinica) => void
}

export function HistoriaClinicaTimeline({ historias, onEdit }: HistoriaClinicaTimelineProps) {
    // Group by Plant
    const groupedHistory = useMemo(() => {
        const groups: Record<number, { plantName: string, items: HistoriaClinica[] }> = {}

        historias.forEach(historia => {
            const plantId = historia.id_planta
            const plantName = historia.plantas?.nombre || `Planta #${plantId}`

            if (!groups[plantId]) {
                groups[plantId] = { plantName, items: [] }
            }
            groups[plantId].items.push(historia)
        })

        return Object.values(groups)
    }, [historias])

    if (historias.length === 0) {
        return null
    }

    return (
        <div className="space-y-8">
            {groupedHistory.map((group, groupIndex) => (
                <Card key={groupIndex} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex items-center gap-2">
                            <Sprout className="h-5 w-5 text-green-600" />
                            <CardTitle className="text-lg">{group.plantName}</CardTitle>
                            <Badge variant="secondary" className="ml-auto">
                                {group.items.length} eventos
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative p-6">
                            {/* Vertical Line */}
                            <div className="absolute left-9 top-6 bottom-6 w-px bg-border" />

                            <div className="space-y-8">
                                {group.items.map((historia, index) => (
                                    <div key={historia.id_historia} className="relative flex gap-6 group">
                                        {/* Icon/Dot */}
                                        <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ring-4 ring-background ${historia.estuvo_enferma ? 'bg-orange-100 border-orange-200 text-orange-600' : 'bg-green-100 border-green-200 text-green-600'
                                            }`}>
                                            {getEventIcon(historia.tipo_evento)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 space-y-2">
                                            {/* Date Header outside the card bubble */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {format(new Date(historia.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                                                    </span>
                                                    {historia.estuvo_enferma && (
                                                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                                                            Enferma
                                                        </Badge>
                                                    )}
                                                </div>
                                                {onEdit && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreVertical className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => onEdit(historia)}>
                                                                <Pencil className="mr-2 h-3 w-3" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>

                                            {/* Bubble Card */}
                                            <div className={`rounded-lg border text-sm transition-colors ${historia.estuvo_enferma ? 'bg-orange-50/30' : 'bg-card'
                                                }`}>
                                                <div className="p-3 pb-2">
                                                    <h4 className="font-semibold mb-1">
                                                        {historia.tipo_evento || 'Registro General'}
                                                    </h4>
                                                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                        {historia.descripcion}
                                                    </p>
                                                </div>
                                                {historia.tratamiento && (
                                                    <div className="border-t bg-muted/20 p-2 px-3 mt-1 rounded-b-lg flex gap-2 text-xs text-muted-foreground items-start">
                                                        <Syringe className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                                        <span>
                                                            <strong className="text-foreground">Tratamiento:</strong> {historia.tratamiento}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function getEventIcon(type?: string) {
    switch (type?.toLowerCase()) {
        case 'diagnóstico': return <Stethoscope className="h-3 w-3" />
        case 'tratamiento': return <Syringe className="h-3 w-3" />
        case 'riego': return <Droplets className="h-3 w-3" />
        case 'poda': return <Scissors className="h-3 w-3" />
        case 'transplante': return <MoveRight className="h-3 w-3" />
        case 'fertilización': return <Sprout className="h-3 w-3" />
        default: return <Activity className="h-3 w-3" />
    }
}
