'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Sprout, Box, Store, ChevronRight, ChevronLeft, CheckCircle2, PartyPopper, Info, AlertCircle } from 'lucide-react'
import { bulkSetupCategories, getUserProfile } from '@/app/actions/tenants'
import { LoadingSpinner } from '@/components/loading-spinner'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const STEPS = [
    { id: 'welcome', title: 'Bienvenido', icon: Store },
    { id: 'genres', title: 'Géneros', icon: Sprout },
    { id: 'pots', title: 'Macetas', icon: Box },
    { id: 'finish', title: 'Finalizar', icon: CheckCircle2 },
]

const DEFAULT_GENRES = [
    'Suculentas', 'Orquídeas', 'Cactus', 'Interior', 'Exterior', 'Frutales', 'Aromáticas'
]

const DEFAULT_POTS = [
    { tipo: 'Sopladita Mini', material: 'Plástico', diametro_cm: 6, altura_cm: 5, volumen_lts: 0.1, diametro_unidad: 'cm', altura_unidad: 'cm', volumen_unidad: 'L' },
    { tipo: 'Premium Mediana', material: 'Plástico Rígido', diametro_cm: 12, altura_cm: 10, volumen_lts: 1, diametro_unidad: 'cm', altura_unidad: 'cm', volumen_unidad: 'L' },
    { tipo: 'Barro Clásica', material: 'Barro Cocido', diametro_cm: 15, altura_cm: 14, volumen_lts: 1.5, diametro_unidad: 'cm', altura_unidad: 'cm', volumen_unidad: 'L' },
    { tipo: 'Contenedor Grande', material: 'Polietileno', diametro_cm: 25, altura_cm: 22, volumen_lts: 7, diametro_unidad: 'cm', altura_unidad: 'cm', volumen_unidad: 'L' },
]

export default function OnboardingWizard() {
    const [step, setStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [nurseryName, setNurseryName] = useState('')
    const [userName, setUserName] = useState('')
    const [isNameInitialyEmpty, setIsNameInitialyEmpty] = useState(false)
    const [selectedGenres, setSelectedGenres] = useState<string[]>([...DEFAULT_GENRES])
    const [selectedPots, setSelectedPots] = useState<typeof DEFAULT_POTS>([...DEFAULT_POTS])
    const [errorDialog, setErrorDialog] = useState<{ open: boolean, title: string, message: string }>({
        open: false,
        title: '',
        message: ''
    })
    const [successOpen, setSuccessOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            const profile = await getUserProfile()
            if (profile?.nombre) {
                setUserName(profile.nombre)
                setIsNameInitialyEmpty(false)
            } else {
                setIsNameInitialyEmpty(true)
            }
        }
        fetchUser()
    }, [])

    const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
    const prevStep = () => setStep(s => Math.max(s - 1, 0))

    const handleFinish = async () => {
        setLoading(true)
        try {
            const res = await bulkSetupCategories({
                nurseryName,
                userName,
                generos: selectedGenres,
                macetas: selectedPots
            })
            if (res.success) {
                setSuccessOpen(true)
            }
        } catch (error: unknown) {
            const err = error as { message?: string, digest?: string }
            if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
                return
            }

            console.error('Error in setup:', err)
            const errorMsg = err.message || 'Hubo un error al guardar tu configuración.'

            setErrorDialog({
                open: true,
                title: 'Error del Servidor',
                message: `${errorMsg}\n\nSi el error persiste, asegúrate de haber ejecutado el SQL de migración en Supabase.`
            })
        } finally {
            setLoading(false)
        }
    }

    const current = STEPS[step]
    const Icon = current.icon

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/95 backdrop-blur overflow-hidden">
                <div className="h-1.5 w-full bg-muted flex">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-full transition-all duration-500 ease-in-out ${i <= step ? 'bg-primary' : 'bg-transparent'}`}
                            style={{ width: `${100 / STEPS.length}%` }}
                        />
                    ))}
                </div>

                <CardHeader className="text-center pt-10 pb-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 animate-in zoom-in duration-500">
                        <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-3xl font-bold">
                        {step === 0 && userName ? `¡Qué bueno verte, ${userName}!` : current.title}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {step === 0 && (userName
                            ? 'Estamos felices de recibirte en nuestra familia. Comencemos por darle identidad a tu sueño.'
                            : 'Comencemos por darle identidad a tu vivero.')}
                        {step === 1 && 'Selecciona los géneros de plantas que sueles trabajar.'}
                        {step === 2 && 'Define los tipos de macetas que tienes en stock.'}
                        {step === 3 && 'Revisa tu configuración y comienza a gestionar.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-10 pb-10">
                    <div className="min-h-[300px] flex flex-col justify-center">
                        {step === 0 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    {isNameInitialyEmpty && (
                                        <div className="space-y-2">
                                            <Label htmlFor="userName" className="text-base font-semibold">Tu Nombre</Label>
                                            <Input
                                                id="userName"
                                                placeholder="Ej: Victor"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className="h-14 text-lg border-primary/20 focus:border-primary shadow-sm"
                                            />
                                            <p className="text-sm text-muted-foreground">Queremos saludarte como te mereces.</p>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="name" className="text-base font-semibold">Nombre de tu Vivero</Label>
                                        <Input
                                            id="name"
                                            placeholder="Ej: El Jardín Secreto"
                                            value={nurseryName}
                                            onChange={(e) => setNurseryName(e.target.value)}
                                            className="h-14 text-lg border-primary/20 focus:border-primary shadow-sm"
                                        />
                                        <p className="text-sm text-muted-foreground">Este es el nombre que verán tus clientes y equipo.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {DEFAULT_GENRES.map((genre) => (
                                    <div key={genre} className="flex items-center space-x-3 p-4 rounded-xl border bg-card hover:bg-accent transition-colors cursor-pointer" onClick={() => {
                                        setSelectedGenres(prev =>
                                            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
                                        )
                                    }}>
                                        <Checkbox checked={selectedGenres.includes(genre)} id={genre} />
                                        <Label htmlFor={genre} className="text-base font-medium grow cursor-pointer">{genre}</Label>
                                    </div>
                                ))}
                                <div className="col-span-2 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3 text-sm text-blue-800">
                                    <Info className="w-5 h-5 shrink-0" />
                                    <p>
                                        <strong>Tip:</strong> No te preocupes por ser exhaustivo ahora. Podrás agregar <strong>subgéneros</strong> y más variedades una vez que estés en el sistema.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {DEFAULT_POTS.map((pot, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card">
                                        <div className="flex items-center gap-4">
                                            <Box className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">{pot.tipo}</p>
                                                <p className="text-sm text-muted-foreground">{pot.material}</p>
                                            </div>
                                        </div>
                                        <Checkbox checked={selectedPots.some(p => p.tipo === pot.tipo)} onCheckedChange={(checked) => {
                                            if (checked) setSelectedPots([...selectedPots, pot])
                                            else setSelectedPots(selectedPots.filter(p => p.tipo !== pot.tipo))
                                        }} />
                                    </div>
                                ))}
                                <p className="text-center text-sm text-muted-foreground pt-4">Hemos pre-configurado medidas estándar para ayudarte a empezar más rápido.</p>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Vivero:</span>
                                        <span className="font-bold">{nurseryName || 'Sin nombre'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Géneros iniciales:</span>
                                        <span className="font-bold">{selectedGenres.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Macetas iniciales:</span>
                                        <span className="font-bold">{selectedPots.length}</span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground">¡Todo listo! Haz clic en finalizar para entrar a tu panel de control.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-10 pt-6 border-t">
                        <Button
                            variant="ghost"
                            onClick={prevStep}
                            disabled={step === 0 || loading}
                            className="h-12 px-6"
                        >
                            <ChevronLeft className="mr-2 w-4 h-4" /> Atrás
                        </Button>

                        {step < STEPS.length - 1 ? (
                            <Button
                                onClick={nextStep}
                                disabled={step === 0 && !nurseryName}
                                className="h-12 px-8 text-base font-semibold"
                            >
                                Siguiente <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinish}
                                disabled={loading}
                                className="h-12 px-10 text-base font-semibold shadow-xl shadow-primary/20"
                            >
                                {loading ? <LoadingSpinner size="sm" className="mr-2" /> : <CheckCircle2 className="mr-2 w-4 h-4" />}
                                Finalizar Configuración
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}>
                <AlertDialogContent className="border-red-100 bg-red-50/50 backdrop-blur-xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            {errorDialog.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-red-900/80 whitespace-pre-wrap">
                            {errorDialog.message}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white border-0">
                            Entendido
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={successOpen}>
                <AlertDialogContent className="max-w-md border-0 bg-white/90 backdrop-blur-2xl shadow-2xl text-center p-10">
                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                        <PartyPopper className="w-12 h-12" />
                    </div>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-3xl font-extrabold text-gray-900 mb-2">
                            ¡Felicitaciones, {userName || 'Viverista'}!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-lg text-gray-600 leading-relaxed">
                            Tu vivero <strong>{nurseryName}</strong> ya está configurado y listo para prosperar. Estamos emocionados de acompañarte en el crecimiento de tu negocio.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 sm:justify-center">
                        <AlertDialogAction
                            onClick={() => router.push('/dashboard')}
                            className="w-full sm:w-auto h-14 px-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 transition-all hover:scale-105 active:scale-95"
                        >
                            ¡Empezar ahora!
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
