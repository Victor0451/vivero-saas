'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Share2, Copy, Check, Globe, Loader2 } from 'lucide-react'
import { createSharedLink } from '@/app/actions/telemedicina'
import { showToast } from '@/lib/toast'

interface ShareCaseDialogProps {
    idPlanta: number
    plantName: string
}

export function ShareCaseDialog({ idPlanta, plantName }: ShareCaseDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [generatedLink, setGeneratedLink] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleGenerateLink = async () => {
        setLoading(true)
        try {
            const result = await createSharedLink(idPlanta, `Interconsulta: ${plantName}`)
            if (result.success && result.data) {
                // Construct full URL
                const origin = window.location.origin
                const link = `${origin}/consultas/${result.data}`
                setGeneratedLink(link)
                showToast.success('Enlace de interconsulta generado')
            } else {
                showToast.error(result.message || 'Error al generar enlace')
            }
        } catch (error) {
            showToast.error('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async () => {
        if (!generatedLink) return

        try {
            // Priority 1: Modern API
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(generatedLink)
                setCopied(true)
                showToast.success('Enlace copiado al portapapeles')
            } else {
                // Priority 2: Fallback using the visible input
                if (inputRef.current) {
                    inputRef.current.select()
                    inputRef.current.setSelectionRange(0, 99999) // For mobile devices

                    const successful = document.execCommand('copy')
                    if (successful) {
                        setCopied(true)
                        showToast.success('Enlace copiado al portapapeles')
                    } else {
                        throw new Error('execCommand returned false')
                    }

                    // Deselect to avoid visual clutter
                    // window.getSelection()?.removeAllRanges()
                } else {
                    throw new Error('No input ref available')
                }
            }
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            // console.error('Failed to copy:', err)
            showToast.error('Por favor selecciona y copia el enlace manualmente')
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Telemedicina</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-indigo-700">
                        <Globe className="w-5 h-5" />
                        Interconsulta Digital
                    </DialogTitle>
                    <DialogDescription>
                        Genera un enlace seguro y temporal para compartir el historial clínico de <strong>{plantName}</strong> con un experto o colega.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!generatedLink ? (
                        <div className="flex flex-col items-center justify-center space-y-4 py-6 bg-muted/20 rounded-xl border border-dashed">
                            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-2">
                                <Share2 className="w-6 h-6" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium">Listo para generar enlace</p>
                                <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
                                    El experto podrá ver fotos y tratamientos sin necesidad de instalar la app.
                                </p>
                            </div>
                            <Button onClick={handleGenerateLink} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Generar Enlace de Acceso
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="space-y-2">
                                <Label>Enlace Permanente del Caso</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        ref={inputRef}
                                        value={generatedLink}
                                        readOnly
                                        className="font-mono text-xs bg-muted"
                                    />
                                    <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-xs text-green-800">
                                <strong>¡Enlace Activo!</strong> Cualquiera con este link podrá ver el informe clínico. Puedes generar uno nuevo en cualquier momento.
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
