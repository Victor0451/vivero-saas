import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Sprout, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'


async function getDashboardStats() {
  const supabase = await createClient()

  // Get plant stats
  const { data: plantas, error: plantasError } = await supabase
    .from('plantas')
    .select('estado')

  if (plantasError) {
    console.error('Error fetching plantas:', plantasError)
  }

  // Get tasks stats
  const { data: tareas, error: tareasError } = await supabase
    .from('tareas')
    .select('completada')

  if (tareasError) {
    console.error('Error fetching tareas:', tareasError)
  }

  const plantasStats = plantas?.reduce((acc, planta) => {
    acc.total++
    if (planta.estado === 'enferma') acc.enfermas++
    if (planta.estado === 'muerta') acc.muertas++
    return acc
  }, { total: 0, enfermas: 0, muertas: 0 }) || { total: 0, enfermas: 0, muertas: 0 }

  const tareasStats = tareas?.reduce((acc, tarea) => {
    acc.total++
    if (!tarea.completada) acc.pendientes++
    return acc
  }, { total: 0, pendientes: 0 }) || { total: 0, pendientes: 0 }

  return { plantasStats, tareasStats }
}

export default async function DashboardPage() {
  const { plantasStats, tareasStats } = await getDashboardStats()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Resumen general de tu vivero"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plantas</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plantasStats.total}</div>
            <p className="text-xs text-muted-foreground">
              plantas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantas Enfermas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{plantasStats.enfermas}</div>
            <p className="text-xs text-muted-foreground">
              requieren atención
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{tareasStats.pendientes}</div>
            <p className="text-xs text-muted-foreground">
              por completar
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{tareasStats.total - tareasStats.pendientes}</div>
            <p className="text-xs text-muted-foreground">
              este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Gestión de Plantas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Administra tu colección de plantas, registra nuevas especies y mantén un seguimiento de su estado de salud.
            </p>
            <div className="flex gap-2">
              <Link href="/dashboard/plantas">
                <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                  <div className="text-sm font-medium">Ver Plantas</div>
                  <div className="text-xs text-muted-foreground">Gestionar colección</div>
                </Card>
              </Link>
              <Link href="/dashboard/plantas/new">
                <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                  <div className="text-sm font-medium">Nueva Planta</div>
                  <div className="text-xs text-muted-foreground">Agregar especie</div>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Gestión de Tareas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Organiza y sigue el progreso de las tareas de mantenimiento, riego y cuidado de tus plantas.
            </p>
            <Link href="/dashboard/tareas">
              <Card className="p-3 cursor-pointer hover:bg-accent transition-colors">
                <div className="text-sm font-medium">Ver Tareas</div>
                <div className="text-xs text-muted-foreground">Gestionar actividades</div>
              </Card>
            </Link>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}