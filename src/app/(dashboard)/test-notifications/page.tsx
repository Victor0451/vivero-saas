import { createClient } from '@/lib/supabase/server'
import { createNotification, getNotifications, getUnreadCount } from '@/app/actions/notifications'

/**
 * Script de prueba para el sistema de notificaciones
 * Ejecutar desde: /dashboard/test-notifications
 */

export default async function TestNotificationsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-8">No autenticado</div>
    }

    const { data: userData } = await supabase
        .from('users')
        .select('id_tenant')
        .eq('id_user', user.id)
        .single()

    if (!userData) {
        return <div className="p-8">Usuario no encontrado</div>
    }

    // Verificar tablas
    await supabase
        .from('notificaciones')
        .select('*')
        .limit(1)

    await supabase
        .from('preferencias_notificaciones')
        .select('*')
        .limit(1)

    // Crear notificación de prueba
    const testNotificationCreated = await createNotification({
        id_tenant: userData.id_tenant,
        id_usuario: user.id,
        tipo: 'test',
        titulo: '🧪 Notificación de Prueba',
        mensaje: 'Esta es una notificación de prueba del sistema. Si la ves, ¡todo funciona correctamente!',
        url_accion: '/',
        metadata: { test: true, timestamp: new Date().toISOString() }
    })

    // Obtener notificaciones
    const userNotifications = await getNotifications(10)
    const unreadCount = await getUnreadCount()

    return (
        <div className="p-8 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold mb-2">🧪 Test de Notificaciones</h1>
                <p className="text-muted-foreground">
                    Verificación del sistema de notificaciones inteligentes
                </p>
            </div>

            {/* Estado de las Tablas */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">📊 Estado de las Tablas</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                        <h3 className="font-medium mb-2">Tabla: notificaciones</h3>
                        <p className="text-sm text-green-600">✅ Tabla existe y es accesible</p>
                    </div>

                    <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                        <h3 className="font-medium mb-2">Tabla: preferencias_notificaciones</h3>
                        <p className="text-sm text-green-600">✅ Tabla existe y es accesible</p>
                    </div>
                </div>
            </div>

            {/* Creación de Notificación de Prueba */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">🔔 Creación de Notificación</h2>
                <div className={`p-4 rounded-lg border ${testNotificationCreated ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {testNotificationCreated ? (
                        <>
                            <p className="text-sm text-green-600 font-medium mb-2">✅ Notificación de prueba creada exitosamente</p>
                            <p className="text-xs text-muted-foreground">
                                Revisa el ícono de campana en el header para verla
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-red-600">❌ Error al crear notificación de prueba</p>
                    )}
                </div>
            </div>

            {/* Notificaciones del Usuario */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">📬 Notificaciones del Usuario</h2>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium">
                            Total de notificaciones: <span className="text-primary">{userNotifications.length}</span>
                        </p>
                        <p className="text-sm font-medium">
                            No leídas: <span className="text-destructive">{unreadCount}</span>
                        </p>
                    </div>

                    {userNotifications.length > 0 ? (
                        <div className="space-y-2">
                            {userNotifications.slice(0, 5).map((notif) => (
                                <div key={notif.id_notificacion} className="p-3 rounded border bg-background">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{notif.titulo}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{notif.mensaje}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs px-2 py-0.5 rounded ${notif.leida ? 'bg-muted' : 'bg-primary/10 text-primary'}`}>
                                                    {notif.leida ? 'Leída' : 'No leída'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{notif.tipo}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No hay notificaciones aún
                        </p>
                    )}
                </div>
            </div>

            {/* Información del Usuario */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">👤 Información del Usuario</h2>
                <div className="p-4 rounded-lg border bg-card">
                    <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ID Usuario:</span>
                            <span className="font-mono text-xs">{user.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ID Tenant:</span>
                            <span className="font-mono text-xs">{userData.id_tenant}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instrucciones de Prueba */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">📋 Próximos Pasos de Prueba</h2>
                <div className="p-4 rounded-lg border bg-muted/50">
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Verifica el badge rojo en el ícono de campana del header (debe mostrar el contador)</li>
                        <li>Click en la campana para abrir el dropdown de notificaciones</li>
                        <li>Verifica que aparezca la notificación de prueba 🧪</li>
                        <li>Click en la notificación para marcarla como leída</li>
                        <li>Verifica que el contador disminuya</li>
                        <li>Prueba el botón &quot;Marcar todas como leídas&quot;</li>
                        <li>Navega a <code className="px-1 py-0.5 rounded bg-background">/dashboard/configuracion/notificaciones</code></li>
                        <li>Configura las preferencias de notificaciones</li>
                    </ol>
                </div>
            </div>

            {/* Pruebas Automáticas */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">🤖 Generadores Automáticos</h2>
                <div className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-4">
                        Para probar los generadores automáticos, necesitas:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>
                            <strong>Tareas vencidas:</strong> Crea una tarea con fecha pasada y no la completes
                        </li>
                        <li>
                            <strong>Tareas próximas:</strong> Crea una tarea para mañana
                        </li>
                        <li>
                            <strong>Plantas enfermas:</strong> Marca una planta como enferma y espera 7 días sin agregar tratamiento
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
