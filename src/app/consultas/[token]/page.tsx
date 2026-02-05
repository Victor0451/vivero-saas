import { notFound } from 'next/navigation'
import { getSharedCaseData } from '@/app/actions/telemedicina'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sprout, Calendar, Activity, AlertTriangle, Skull, ShieldCheck } from 'lucide-react'
import { HistoriaClinicaTimeline } from '@/components/historia-clinica-timeline' // Reusing timeline!
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function SharedCasePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const result = await getSharedCaseData(token)

    if (!result.success || !result.data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Acceso No Disponible</h1>
                    <p className="text-gray-500">{result.message || 'El enlace no es válido o ha expirado.'}</p>
                </div>
            </div>
        )
    }

    const { planta, historia, link_info } = result.data

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* PROFESSIONAL HEADER for External Expert */}
            <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 leading-none">Vivero SaaS</h1>
                            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Interconsulta Digital</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Caso Activo
                    </Badge>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">

                {/* CASE SUMMARY CARD */}
                <Card className="border-none shadow-md overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <CardHeader className="pb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{planta.nombre}</h2>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                                        <Sprout className="w-3.5 h-3.5" />
                                        {planta.generos_planta?.nombre}
                                    </span>
                                    <span>•</span>
                                    <span>{planta.tipos_planta?.nombre}</span>
                                </div>
                            </div>

                            {/* Current Status Badge */}
                            <div className="flex gap-2">
                                {planta.esta_enferma ? (
                                    <Badge variant="destructive" className="h-8 px-3 text-sm gap-1.5 shadow-sm">
                                        <AlertTriangle className="w-4 h-4" />
                                        Paciente Enfermo
                                    </Badge>
                                ) : (
                                    <Badge className="h-8 px-3 text-sm gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                                        <Activity className="w-4 h-4" />
                                        Paciente Estable
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Edad/Ingreso</p>
                                <p className="font-semibold text-sm">
                                    {planta.fecha_compra ? format(new Date(planta.fecha_compra), 'MMM yyyy', { locale: es }) : 'N/D'}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Maceta</p>
                                <p className="font-semibold text-sm">{planta.macetas?.tipo || 'N/D'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Ubicación</p>
                                <p className="font-semibold text-sm capitalize">{planta.iluminacion?.replace('-', ' ') || 'N/D'}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Registros</p>
                                <p className="font-semibold text-sm">{historia.length} eventos</p>
                            </div>
                        </div>

                        {planta.image_url && (
                            <div className="aspect-video w-full rounded-xl overflow-hidden border bg-gray-100">
                                <img src={planta.image_url} alt="Portada" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* CLINICAL HISTORY TIMELINE */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        Historial de Evolución
                    </h3>
                    <p className="text-sm text-gray-500">
                        Registro cronológico de eventos, tratamientos y evidencia visual.
                    </p>

                    {/* Reuse the timeline component but in "Read Only" mode (no edit props passed) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <HistoriaClinicaTimeline historias={historia} />
                    </div>
                </div>

            </main>
        </div>
    )
}
