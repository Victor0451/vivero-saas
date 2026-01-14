import { NextResponse } from 'next/server'
import { runNotificationChecksForAllTenants } from '@/app/actions/notification-generator-multi-tenant'

/**
 * API Route para ejecutar verificaciones de notificaciones para TODOS los tenants
 * Se puede llamar manualmente o mediante cron jobs
 * 
 * Uso:
 * - Manual: GET /api/notifications/check
 * - Cron: Configurar en Vercel/Railway/cron-job.org para llamar cada X horas
 * 
 * Esta ruta NO requiere autenticación y procesa todos los tenants automáticamente
 */
export async function GET() {
    try {
        const result = await runNotificationChecksForAllTenants()

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Notification checks completed successfully',
                tenantsProcessed: result.tenantsProcessed,
                results: result.results,
                timestamp: new Date().toISOString()
            })
        } else {
            return NextResponse.json({
                success: false,
                error: result.error,
                timestamp: new Date().toISOString()
            }, { status: 500 })
        }
    } catch (error) {
        console.error('Error running notification checks:', error)

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 })
    }
}
