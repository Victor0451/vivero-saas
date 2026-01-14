'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'

export function NotificationCheckButton() {
    const [isChecking, setIsChecking] = useState(false)

    const handleCheck = async () => {
        try {
            setIsChecking(true)

            const response = await fetch('/api/notifications/check')
            const data = await response.json()

            if (data.success) {
                showToast.success('Verificación de notificaciones completada')
            } else {
                showToast.error('Error al verificar notificaciones')
            }
        } catch (error) {
            console.error('Error checking notifications:', error)
            showToast.error('Error al verificar notificaciones')
        } finally {
            setIsChecking(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleCheck}
            disabled={isChecking}
        >
            {isChecking ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verificando...
                </>
            ) : (
                <>
                    <Bell className="h-4 w-4 mr-2" />
                    Verificar Notificaciones
                </>
            )}
        </Button>
    )
}
