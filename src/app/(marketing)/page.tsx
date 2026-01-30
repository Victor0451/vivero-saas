import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sprout, ShieldCheck, Zap, BarChart3, Globe, Users, Check, ArrowRight, Play, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
    return (
        <div className="flex flex-col selection:bg-primary/30">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
                {/* Abstract Background Blobs */}
                <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-[128px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 -right-4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] -z-10" />

                <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 relative z-10 transition-all duration-1000 animate-in fade-in slide-in-from-left-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-primary text-sm font-semibold tracking-wide uppercase">
                            <Star className="w-4 h-4 fill-primary" />
                            SaaS de Próxima Generación
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-gradient">
                            El Cerebro de tu <span className="text-primary italic">Vivero.</span>
                        </h1>

                        <p className="max-w-xl text-xl text-muted-foreground leading-relaxed">
                            No es solo un software de gestión. Es una plataforma inteligente que automatiza el ciclo de vida de tus plantas, desde la semilla hasta la venta final.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 transition-transform group w-full">
                                    Empezar Ahora
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Button variant="outline" size="lg" className="h-16 px-8 text-lg font-semibold rounded-2xl border-2 hover:bg-muted/50 w-full sm:w-auto">
                                <Play className="mr-2 w-5 h-5 fill-current" /> Ver Demo
                            </Button>
                        </div>

                        <div className="flex items-center gap-6 pt-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Utilizado por:</div>
                            <div className="font-bold text-lg">BioFlora</div>
                            <div className="font-bold text-lg">GreenHub</div>
                            <div className="font-bold text-lg">TerraNova</div>
                        </div>
                    </div>

                    <div className="relative lg:h-[600px] flex items-center justify-center animate-in fade-in zoom-in-95 duration-1000 delay-300">
                        <div className="relative w-full aspect-square lg:aspect-auto lg:h-full rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(34,197,94,0.15)] group">
                            <Image
                                src="/marketing/hero_vivero.png"
                                alt="Futuristic Nursery"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />

                            {/* Floating Glass Stats */}
                            <div className="absolute top-8 -left-8 glass p-6 rounded-2xl shadow-2xl animate-float hidden xl:block">
                                <div className="text-3xl font-black text-primary">+12,400</div>
                                <div className="text-xs font-bold uppercase text-muted-foreground">Ejemplares Gestionados</div>
                            </div>

                            <div className="absolute bottom-12 -right-8 glass p-6 rounded-2xl shadow-2xl animate-float [animation-delay:1.5s] hidden xl:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    <div className="text-sm font-bold uppercase tracking-tighter">Inventario en Tiempo Real</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section className="py-20 border-y bg-muted/20">
                <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <StatItem label="Nursery Owners" value="500+" />
                    <StatItem label="Successful Crops" value="1.2M" />
                    <StatItem label="Time Saved" value="40%" />
                    <StatItem label="ROI Average" value="3.5x" />
                </div>
            </section>

            {/* Feature Storytelling Section 1 */}
            <section id="features" className="py-32 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="/marketing/dashboard_preview.png"
                                alt="Dashboard Mockup"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="order-1 lg:order-2 space-y-8">
                            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Claridad total sobre el estado de tu inversión.</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Nuestro dashboard inteligente te da una visión de 360 grados de tu operación. Identifica plantas enfermas, monitorea el inventario de macetas y programa tareas críticas antes de que se conviertan en pérdidas.
                            </p>
                            <div className="space-y-4">
                                <FeatureCheckItem text="Análisis de salud predictiva por especie." />
                                <FeatureCheckItem text="Alertas automáticas de riego y transplante." />
                                <FeatureCheckItem text="Reportes de stock en tiempo real." />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Storytelling Section 2 */}
            <section className="py-32 bg-primary/5 relative">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Tu vivero en tu bolsillo, literalmente.</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Nuestra tecnología PWA (Progressive Web App) permite que tus operarios gestionen el día a día desde el invernadero, incluso sin internet. Escanea QR, toma fotos y actualiza el historial clínico al instante.
                            </p>
                            <div className="flex gap-4">
                                <div className="p-4 rounded-2xl bg-background shadow-lg border">
                                    <div className="font-bold text-xl mb-1">99.9%</div>
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Uptime Offline</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-background shadow-lg border">
                                    <div className="font-bold text-xl mb-1">2s</div>
                                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Sincronización</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border-8 border-background">
                            <Image
                                src="/marketing/mobile_scanning.png"
                                alt="Mobile App Scanning"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section - Premium Card Design */}
            <section id="pricing" className="py-32 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.05),transparent_70%)] pointer-events-none" />
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center mb-20">
                        <h2 className="text-5xl font-bold tracking-tighter mb-6">Planes para cada escala de ambición.</h2>
                        <p className="text-xl text-muted-foreground">Comienza hoy mismo con nuestra prueba gratuita de 14 días. Sin tarjeta de crédito.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
                        <PricingCard
                            title="Semilla"
                            price="0"
                            description="Para iniciarte en la gestión digital."
                            features={["50 plantas máximo", "1 Usuario", "Historial básico", "Web App"]}
                        />
                        <PricingCard
                            title="Brote"
                            price="49"
                            isPopular={true}
                            description="La herramienta de los profesionales."
                            features={["Plantas ilimitadas", "5 Usuarios", "Inventario Avanzado", "Soporte 24/7", "Generación de QR"]}
                        />
                        <PricingCard
                            title="Bosque"
                            price="149"
                            description="Para operaciones de nivel industrial."
                            features={["Multi-sucursal", "Usuarios ilimitados", "API Access", "White Labeling", "Custom Integration"]}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 relative bg-foreground text-background overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[160px]" />
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-5xl lg:text-7xl font-black mb-12 tracking-tighter">
                        Deja de adivinar. <br /> Empieza a cultivar con datos.
                    </h2>
                    <Link href="/register">
                        <Button size="lg" className="h-20 px-12 text-2xl font-black rounded-3xl bg-primary text-primary-foreground hover:scale-110 shadow-2xl transition-all">
                            Crear mi Vivero Digital Gratuitamente
                        </Button>
                    </Link>
                    <p className="mt-8 text-muted-foreground font-medium uppercase tracking-[0.2em] text-sm">Prueba gratuita de 14 días • Setup en 2 minutos</p>
                </div>
            </section>
        </div>
    )
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-black text-primary tracking-tighter">{value}</div>
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        </div>
    )
}

function FeatureCheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3 font-semibold">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Check className="w-4 h-4" />
            </div>
            <span>{text}</span>
        </div>
    )
}

function PricingCard({ title, price, description, features, isPopular = false }: { title: string, price: string, description: string, features: string[], isPopular?: boolean }) {
    return (
        <Card className={`relative flex flex-col p-8 transition-all duration-500 hover:-translate-y-2 ${isPopular ? 'border-primary shadow-2xl glass-dark z-10 scale-[1.02]' : 'border-border glass'}`}>
            {isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap">
                    Más Recomendado
                </div>
            )}
            <div className="space-y-6 flex-1">
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter">${price}</span>
                    <span className="text-muted-foreground font-bold font-mono text-sm">/USD/MO</span>
                </div>
                <div className="space-y-4 pt-8 border-t border-primary/10">
                    {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm font-medium">
                            <Check className={`w-4 h-4 ${isPopular ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span>{f}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-12">
                <Link href="/register">
                    <Button className={`w-full h-14 rounded-2xl font-black text-lg ${isPopular ? 'bg-primary shadow-xl shadow-primary/30' : 'bg-foreground text-background'}`}>
                        Seleccionar Plan
                    </Button>
                </Link>
            </div>
        </Card>
    )
}
