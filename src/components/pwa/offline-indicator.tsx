'use client'

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { toast } from 'sonner'

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(() =>
        typeof window !== 'undefined' ? navigator.onLine : true
    )

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            toast.success('Conexión restaurada', {
                description: 'Ahora estás en línea',
                icon: <Wifi className="h-4 w-4" />
            })
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast.error('Sin conexión', {
                description: 'Estás trabajando en modo offline',
                icon: <WifiOff className="h-4 w-4" />,
                duration: Infinity
            })
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (isOnline) return null

    return (
        <div className="fixed top-16 left-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium z-50 shadow-lg">
            <div className="flex items-center justify-center gap-2">
                <WifiOff className="h-4 w-4" />
                <span>Sin conexión - Modo offline</span>
            </div>
        </div>
    )
}
