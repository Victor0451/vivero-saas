import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import {
    QrCode,
    Rocket,
    Package,
    BarChart3,
    Lightbulb,
    CheckCircle2,
    Smartphone,
    MousePointerClick
} from 'lucide-react'
import Image from 'next/image'

export default function GuiaPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            <PageHeader
                title="Centro de Aprendizaje"
                description="Domina todas las herramientas de Vivero SaaS para llevar tu negocio al siguiente nivel."
            />

            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-l from-primary/50 to-transparent" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">Guía Oficial v1.4</Badge>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Transforma tu vivero con tecnología de campo</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Hemos diseñado Vivero SaaS para que sea tu compañero en el invernadero, no solo una oficina digital. Sigue estos pasos para automatizar tu día a día.
                    </p>
                </div>
            </div>

            {/* Step 1: QR Bridge */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">1. El Puente Físico-Digital (QR)</h3>
                        <p className="text-muted-foreground">Vincula tus plantas reales con sus fichas digitales.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden group hover:shadow-lg transition-all">
                            <CardContent className="p-6">
                                <ul className="space-y-6">
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                                        <p className="text-sm"><span className="font-bold">Genera:</span> Entra en cualquier planta y toca <span className="text-primary font-semibold">&quot;Etiqueta QR&quot;</span>.</p>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                                        <p className="text-sm"><span className="font-bold">Imprime:</span> Usa el layout profesional para imprimir etiquetas resistentes.</p>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">3</span>
                                        <p className="text-sm"><span className="font-bold">Escanea:</span> Usa el scanner lateral desde tu móvil para abrir fichas en segundos.</p>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                        <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800">
                            <Lightbulb className="w-5 h-5 flex-shrink-0" />
                            <p className="text-xs font-medium">Tip: El scanner funciona mejor con buena luz y manteniendo el móvil a 15cm.</p>
                        </div>
                    </div>
                    <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                        <Image
                            src="/images/guide/qr-scanner.png"
                            alt="Escaneo QR"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <p className="text-white text-sm font-medium italic">&quot;Identificación instantánea en el punto de trabajo.&quot;</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 2: Bulk Actions */}
            <section className="space-y-6 py-12">
                <div className="flex items-center gap-4 justify-end md:text-right">
                    <div className="hidden md:block">
                        <h3 className="text-2xl font-bold">2. Acciones Masivas</h3>
                        <p className="text-muted-foreground">Ahorra horas de trabajo manual cada semana.</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <div className="md:hidden">
                        <h3 className="text-2xl font-bold">2. Acciones Masivas</h3>
                        <p className="text-muted-foreground">Ahorra horas.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="order-2 md:order-1 relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white group">
                        <Image
                            src="/images/guide/bulk-actions.png"
                            alt="Acciones Masivas"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="order-1 md:order-2 space-y-4">
                        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm rounded-3xl overflow-hidden group hover:shadow-lg transition-all">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MousePointerClick className="w-5 h-5 text-blue-500 mt-1" />
                                        <p className="text-sm font-medium">Selecciona múltiples plantas desde el inventario principal.</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1" />
                                        <p className="text-sm">Usa la <span className="font-bold">Barra de Acciones</span> para registrar riegos, cambios de estado o tareas en lote.</p>
                                    </div>
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            Ideal para: Riegos generales por estantería o actualizaciones de salud tras una revisión de plagas.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Step 3: Inventory */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">3. Inventario Automatizado</h3>
                        <p className="text-muted-foreground">Control total sobre tus insumos y materiales.</p>
                    </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 md:p-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <h4 className="font-bold text-emerald-900">Registro en Tarea</h4>
                            <p className="text-sm text-emerald-700">Al crear una tarea, selecciona los materiales que usarás (sustrato, fertilizante, maceta).</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-emerald-900">Descuento Real</h4>
                            <p className="text-sm text-emerald-700">El sistema calcula el consumo total y lo descuenta de tu inventario central automáticamente.</p>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-emerald-900">Sin Solapamientos</h4>
                            <p className="text-sm text-emerald-700">La interfaz está optimizada para ser usada en tablets y móviles sin errores de visualización.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 4: Analytics */}
            <section className="space-y-6 pt-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">4. Inteligencia de Negocio</h3>
                            </div>
                        </div>
                        <p className="text-slate-600 text-lg">
                            Toma decisiones basadas en tendencias, no en intuición. Nuestro Dashboard procesa miles de registros para decirte qué está funcionando.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4 border-slate-100 shadow-sm rounded-2xl">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Salud</div>
                                <div className="font-semibold text-sm">Tendencias de mortalidad y recuperación.</div>
                            </Card>
                            <Card className="p-4 border-slate-100 shadow-sm rounded-2xl">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Tareas</div>
                                <div className="font-semibold text-sm">Eficiencia de mantenimiento mensual.</div>
                            </Card>
                        </div>
                    </div>
                    <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-100">
                        <Image
                            src="/images/guide/dashboard.png"
                            alt="Analítica SaaS"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <div className="text-center py-12 border-t border-slate-100">
                <p className="text-slate-400 mb-6 font-medium">¿Necesitas ayuda extra? Nuestro equipo está para apoyarte.</p>
                <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase px-4 py-2 bg-slate-100 rounded-full">
                        <Smartphone className="w-3 h-3" />
                        Vivero SaaS Mobile App
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase px-4 py-2 bg-emerald-50 rounded-full">
                        <Smartphone className="w-3 h-3" />
                        Soporte Premium Activo
                    </div>
                </div>
            </div>
        </div>
    )
}
