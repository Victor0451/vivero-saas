'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(() =>
        typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)').matches : false
    )

    useEffect(() => {
        if (typeof window === 'undefined') return

        // Check if dismissed before
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) {
            const dismissedDate = new Date(dismissed)
            const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
            if (daysSinceDismissed < 7) {
                return // Don't show again for 7 days
            }
        }

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowPrompt(false)
            setIsInstalled(true)
        }

        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
    }

    if (isInstalled || !showPrompt) return null

    return (
        <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 shadow-lg border-2 border-primary/20 z-50 animate-in slide-in-from-bottom-5">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">
                        Instalar Vivero SaaS
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                        Instala la app para acceso rápido y funcionalidad offline
                    </p>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={handleInstall}
                            className="flex-1"
                        >
                            Instalar
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDismiss}
                        >
                            Ahora no
                        </Button>
                    </div>
                </div>

                <Button
                    size="icon"
                    variant="ghost"
                    className="flex-shrink-0 h-6 w-6"
                    onClick={handleDismiss}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    )
}
