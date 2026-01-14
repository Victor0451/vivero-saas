'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bell, AlertTriangle, Sprout, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Notification } from '@/app/actions/notifications'

interface NotificationItemProps {
    notification: Notification
    onMarkAsRead: (id: number) => void
    onDelete: (id: number) => void
    onClick: (url: string | null) => void
}

const notificationIcons = {
    tarea_vencida: AlertTriangle,
    tarea_proxima: Clock,
    planta_enferma: Sprout,
    nueva_planta: Sprout,
    resumen_diario: Bell,
}

const notificationColors = {
    tarea_vencida: 'text-red-500',
    tarea_proxima: 'text-orange-500',
    planta_enferma: 'text-yellow-500',
    nueva_planta: 'text-green-500',
    resumen_diario: 'text-blue-500',
}

export function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    onClick
}: NotificationItemProps) {
    const Icon = notificationIcons[notification.tipo as keyof typeof notificationIcons] || Bell
    const iconColor = notificationColors[notification.tipo as keyof typeof notificationColors] || 'text-gray-500'

    const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
        addSuffix: true,
        locale: es
    })

    const handleClick = () => {
        if (!notification.leida) {
            onMarkAsRead(notification.id_notificacion)
        }
        if (notification.url_accion) {
            onClick(notification.url_accion)
        }
    }

    return (
        <div
            className={cn(
                'group relative flex gap-3 p-3 rounded-lg transition-colors cursor-pointer',
                !notification.leida && 'bg-accent/50',
                'hover:bg-accent'
            )}
            onClick={handleClick}
        >
            {/* Icono */}
            <div className={cn('flex-shrink-0 mt-0.5', iconColor)}>
                <Icon className="h-5 w-5" />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <p className={cn(
                        'text-sm font-medium',
                        !notification.leida && 'font-semibold'
                    )}>
                        {notification.titulo}
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(notification.id_notificacion)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.mensaje}
                </p>

                <p className="text-xs text-muted-foreground">
                    {timeAgo}
                </p>
            </div>

            {/* Indicador de no leída */}
            {!notification.leida && (
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
            )}
        </div>
    )
}
