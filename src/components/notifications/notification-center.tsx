'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationBadge } from './notification-badge'
import { NotificationItem } from './notification-item'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    type Notification
} from '@/app/actions/notifications'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const loadNotifications = useCallback(async () => {
        // isLoading ya empieza en true para el primer render
        const [notifs, count] = await Promise.all([
            getNotifications(20),
            getUnreadCount()
        ])
        setNotifications(notifs)
        setUnreadCount(count)
        setIsLoading(false)
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadNotifications()

        // Actualizar cada 30 segundos
        const interval = setInterval(loadNotifications, 30000)
        return () => clearInterval(interval)
    }, [loadNotifications])

    const handleMarkAsRead = async (id: number) => {
        const success = await markAsRead(id)
        if (success) {
            setNotifications(prev =>
                prev.map(n => n.id_notificacion === id ? { ...n, leida: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    const handleMarkAllAsRead = async () => {
        const success = await markAllAsRead()
        if (success) {
            setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
            setUnreadCount(0)
            toast.success('Todas las notificaciones marcadas como leídas')
        }
    }

    const handleDelete = async (id: number) => {
        const success = await deleteNotification(id)
        if (success) {
            const notification = notifications.find(n => n.id_notificacion === id)
            setNotifications(prev => prev.filter(n => n.id_notificacion !== id))
            if (notification && !notification.leida) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
            toast.success('Notificación eliminada')
        }
    }

    const handleNotificationClick = (url: string | null) => {
        if (url) {
            router.push(url)
            setIsOpen(false)
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <NotificationBadge count={unreadCount} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-8 text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar todas como leídas
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No tienes notificaciones
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id_notificacion}
                                    notification={notification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onDelete={handleDelete}
                                    onClick={handleNotificationClick}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <>
                        <Separator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center text-xs"
                                onClick={() => {
                                    router.push('/configuracion/notificaciones')
                                    setIsOpen(false)
                                }}
                            >
                                Ver configuración
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
