'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Camera, X, RefreshCw, Smartphone } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { showToast } from '@/lib/toast'

interface QRScannerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function QRScannerDialog({ open, onOpenChange }: QRScannerDialogProps) {
    const router = useRouter()
    const [isScanning, setIsScanning] = useState(false)
    const [hasCamera, setHasCamera] = useState<boolean | null>(null)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const scannerId = 'qr-reader'

    const stopScanner = useCallback(async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop()
                setIsScanning(false)
            } catch (err) {
                console.error('Error stopping scanner:', err)
            }
        }
    }, [])

    const startScanner = useCallback(async () => {
        try {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(scannerId)
            }

            await scannerRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // Detectar si es una URL de nuestra app
                    try {
                        const url = new URL(decodedText)
                        if (url.pathname.includes('/plantas/')) {
                            stopScanner()
                            onOpenChange(false)
                            router.push(url.pathname)
                            showToast.success('Planta identificada')
                        } else {
                            showToast.error('Código QR no válido para esta aplicación')
                        }
                    } catch (_e) {
                        // Si no es una URL, quizás es solo el ID
                        const id = parseInt(decodedText)
                        if (!isNaN(id)) {
                            stopScanner()
                            onOpenChange(false)
                            router.push(`/plantas/${id}`)
                            showToast.success('Planta identificada')
                        } else {
                            showToast.error('El código escaneado no es reconocido')
                        }
                    }
                },
                () => {
                    // Error de escaneo (silencioso por cada frame)
                }
            )
            setIsScanning(true)
            setHasCamera(true)
        } catch (err) {
            console.error('Error starting scanner:', err)
            setHasCamera(false)
            showToast.error('No se pudo acceder a la cámara. Verifica los permisos.')
        }
    }, [onOpenChange, router, stopScanner])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (open) {
            // Pequeño delay para asegurar que el elemento DOM está listo
            timer = setTimeout(() => {
                startScanner()
            }, 500)
        }
        return () => {
            if (timer) clearTimeout(timer)
            stopScanner()
        }
    }, [open, startScanner, stopScanner])

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) stopScanner()
            onOpenChange(val)
        }}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none bg-slate-950/90 backdrop-blur-xl text-white rounded-[2rem]">
                <div className="p-6 md:p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <Camera className="w-5 h-5 text-primary" />
                                </div>
                                <DialogTitle className="text-xl text-white">Escáner Móvil</DialogTitle>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <DialogDescription className="text-slate-400">
                            Apunta con la cámara al código QR de la planta.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
                        {/* El Scanner se monta aquí */}
                        <div id={scannerId} className="w-full h-full" />

                        {/* Overlay de Guía */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />

                                {/* Línea de escaneo animada */}
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-scan-line" />
                            </div>
                        </div>

                        {hasCamera === false && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900">
                                <div className="p-4 bg-red-500/10 rounded-full mb-4">
                                    <Smartphone className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Cámara Bloqueada</h3>
                                <p className="text-sm text-slate-400">
                                    Necesitamos acceso a tu cámara para escanear los códigos QR. Por favor, habilita los permisos en tu navegador.
                                </p>
                                <Button
                                    onClick={startScanner}
                                    variant="outline"
                                    className="mt-6 border-slate-700 text-white"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reintentar
                                </Button>
                            </div>
                        )}

                        {!isScanning && hasCamera !== false && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-900">
                                <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                                <p className="text-sm text-slate-400 font-medium">Iniciando cámara...</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex items-center gap-4 text-xs text-slate-500 justify-center">
                        <div className="flex items-center gap-1.5 font-medium">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Sincronizado
                        </div>
                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                        <div className="font-medium">Vivero Pro Bridge v1.0</div>
                    </div>
                </div>
            </DialogContent>

            <style jsx global>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
        #qr-reader {
            border: none !important;
        }
        #qr-reader video {
            object-fit: cover !important;
            border-radius: 2rem;
        }
      `}</style>
        </Dialog>
    )
}
