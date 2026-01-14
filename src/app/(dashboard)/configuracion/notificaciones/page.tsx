import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { NotificationPreferences } from '@/components/notifications/notification-preferences'
import { Bell } from 'lucide-react'

export default async function NotificationsConfigPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Configuración de Notificaciones"
                description="Gestiona cómo y cuándo recibes notificaciones"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Preferencias de Notificaciones
                    </CardTitle>
                    <CardDescription>
                        Configura qué tipos de notificaciones deseas recibir y con qué frecuencia
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <NotificationPreferences />
                </CardContent>
            </Card>
        </div>
    )
}
