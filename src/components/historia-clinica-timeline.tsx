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
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog"

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
                <Card key={groupIndex} className="overflow-hidden border-none shadow-none bg-transparent">
                    <div className="flex items-center gap-3 mb-6 ml-2">
                        <div className="bg-primary/10 text-primary p-2 rounded-xl">
                            <Sprout className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">{group.plantName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{group.items.length} eventos registrados</p>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <div className="relative pl-6 pb-6">
                            {/* Vertical Line */}
                            <div className="absolute left-9 top-2 bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent" />

                            <div className="space-y-10">
                                {group.items.map((historia, index) => (
                                    <div key={historia.id_historia} className="relative flex gap-6 group">
                                        {/* Icon/Dot */}
                                        <div className={cn(
                                            "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ring-4 ring-background transition-all duration-300 group-hover:scale-110 shadow-sm",
                                            getSeverityColor(historia.severidad, historia.estuvo_enferma)
                                        )}>
                                            {getEventIcon(historia.tipo_evento)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Date Header */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold capitalize">
                                                        {format(new Date(historia.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                                                    </span>
                                                    {historia.estuvo_enferma && (
                                                        <Badge variant="outline" className={cn("h-5 px-2 text-[10px] uppercase tracking-wider", getSeverityBadgeStyle(historia.severidad))}>
                                                            {historia.severidad ? `Severidad ${historia.severidad}` : 'Enferma'}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {onEdit && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-50 hover:opacity-100 transition-opacity">
                                                                <MoreVertical className="h-4 w-4" />
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
                                            <div className="bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h4 className="font-bold text-base mb-1 text-foreground/90">
                                                                {historia.tipo_evento || 'Chequeo General'}
                                                            </h4>
                                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                                {historia.descripcion}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Tratamiento Section */}
                                                    {historia.tratamiento && (
                                                        <div className="flex gap-3 bg-muted/40 p-3 rounded-xl border border-dashed">
                                                            <div className="bg-background p-1.5 rounded-md shadow-sm border shrink-0">
                                                                <Syringe className="h-4 w-4 text-blue-500" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Tratamiento Aplicado</span>
                                                                <p className="text-sm font-medium">{historia.tratamiento}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* PHOTOS Section */}
                                                    {historia.fotos_planta && historia.fotos_planta.length > 0 && (
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                                            {historia.fotos_planta.map((foto) => (
                                                                <Dialog key={foto.id_foto}>
                                                                    <DialogTrigger asChild>
                                                                        <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted group/photo cursor-zoom-in">
                                                                            <img
                                                                                src={foto.url}
                                                                                alt="Evidencia"
                                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/0 group-hover/photo:bg-black/10 transition-colors" />
                                                                        </div>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-black/95 border-none">
                                                                        <DialogTitle className="sr-only">Evidencia Visual</DialogTitle>
                                                                        <div className="relative flex items-center justify-center h-[80vh]">
                                                                            <img
                                                                                src={foto.url}
                                                                                alt="Evidencia detallada"
                                                                                className="max-h-full max-w-full object-contain"
                                                                            />
                                                                            {foto.notas && (
                                                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 backdrop-blur-sm">
                                                                                    <p className="text-white text-sm">{foto.notas}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* TASKS Section */}
                                                    {historia.tareas && historia.tareas.length > 0 && (
                                                        <div className="flex flex-col gap-1 pt-2">
                                                            {historia.tareas.map((tarea) => (
                                                                <div key={tarea.id_tarea} className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-1.5 rounded-md border border-dashed">
                                                                    <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", tarea.completada ? "bg-green-500" : "bg-amber-500")} />
                                                                    <span className="flex-1 truncate">{tarea.titulo}</span>
                                                                    <span className="text-[10px] opacity-70 whitespace-nowrap">{format(new Date(tarea.fecha_programada), "d MMM", { locale: es })}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
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

function getSeverityColor(severity?: string, wasSick?: boolean) {
    if (!wasSick) return "bg-emerald-100 border-emerald-500 text-emerald-600";

    switch (severity) {
        case 'critica': return "bg-red-100 border-red-600 text-red-600";
        case 'alta': return "bg-orange-100 border-orange-500 text-orange-600";
        case 'media': return "bg-yellow-100 border-yellow-500 text-yellow-600";
        case 'baja': return "bg-blue-100 border-blue-500 text-blue-600";
        default: return "bg-gray-100 border-gray-500 text-gray-600";
    }
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

function getEventIcon(type?: string) {
    if (!type) return <Activity className="h-3 w-3" />;

    const t = type.toLowerCase();

    // Diagnóstico y Patología
    if (t.includes('diagnóstico') || t.includes('consult')) return <Stethoscope className="h-3 w-3" />;
    if (t.includes('plaga') || t.includes('enfermedad') || t.includes('deficiencia')) return <Skull className="h-3 w-3" />;

    // Intervenciones
    if (t.includes('poda') || t.includes('decapita') || t.includes('esquej')) return <Scissors className="h-3 w-3" />;
    if (t.includes('raíces')) return <Activity className="h-3 w-3" />;

    // Tratamientos
    if (t.includes('fungicida') || t.includes('insecticida') || t.includes('terapéutico')) return <Syringe className="h-3 w-3" />;
    if (t.includes('limpieza') || t.includes('foliar')) return <Droplets className="h-3 w-3" />;

    // Sustrato
    if (t.includes('transplante') || t.includes('sustrato')) return <MoveRight className="h-3 w-3" />;
    if (t.includes('fertiliz')) return <Sprout className="h-3 w-3" />;

    // Fenología
    if (t.includes('floración') || t.includes('poliniz') || t.includes('semilla')) return <Sprout className="h-3 w-3" />;

    // Otros
    if (t.includes('deceso') || t.includes('muerte')) return <Skull className="h-3 w-3" />;

    return <Activity className="h-3 w-3" />;
}

function getSeverityBadgeStyle(severity?: string) {
    switch (severity) {
        case 'critica': return "bg-red-600 text-white border-red-600 hover:bg-red-700";
        case 'alta': return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
        case 'media': return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
        case 'baja': return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
        default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
}
