'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Plus, Stethoscope, Calendar, Filter, AlertTriangle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getHistoriaClinicaByPlanta, getPlantas } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'
import { HistoriaClinicaList } from '@/components/historia-clinica-list'
import { HistoriaClinicaSheet } from '@/components/historia-clinica-sheet'
import type { HistoriaClinica, Planta } from '@/types'

type FilterType = 'all' | 'healthy' | 'sick'

export default function HistorialClinicoPage() {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([])
  const [plantas, setPlantas] = useState<Planta[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedPlantaId, setSelectedPlantaId] = useState<number | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [plantasData] = await Promise.all([
        getPlantas()
      ])

      setPlantas(plantasData)

      // Cargar historial clínico de todas las plantas
      const allHistorias: HistoriaClinica[] = []
      for (const planta of plantasData) {
        try {
          const historiasPlanta = await getHistoriaClinicaByPlanta(planta.id_planta)
          allHistorias.push(...historiasPlanta)
        } catch (err) {
          console.error(`Error loading historia for planta ${planta.id_planta}:`, err)
        }
      }

      setHistorias(allHistorias)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error al cargar el historial clínico')
      showToast.error('Error al cargar el historial clínico')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredHistorias = historias.filter(historia => {
    switch (filter) {
      case 'healthy':
        return !historia.estuvo_enferma
      case 'sick':
        return historia.estuvo_enferma
      default:
        return true
    }
  })

  const handleAddRegistro = () => {
    if (plantas.length === 0) {
      showToast.error('No hay plantas disponibles')
      return
    }
    setSelectedPlantaId(null) // Permitir selección en el formulario
    setSheetOpen(true)
  }

  const handleSuccess = () => {
    loadData()
  }

  const stats = {
    total: historias.length,
    healthy: historias.filter(h => !h.estuvo_enferma).length,
    sick: historias.filter(h => h.estuvo_enferma).length
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Historial Clínico"
          description="Registro de estado de salud de tus plantas"
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar datos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadData} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial Clínico"
        description="Registro y seguimiento del estado de salud de tus plantas"
      >
        <Button className="gap-2" onClick={handleAddRegistro} disabled={plantas.length === 0}>
          <Plus className="h-4 w-4" />
          Nuevo Registro
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados Saludables</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estados Enfermos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.sick}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Historial Clínico
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos ({stats.total})
              </Button>
              <Button
                variant={filter === 'healthy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('healthy')}
              >
                Saludables ({stats.healthy})
              </Button>
              <Button
                variant={filter === 'sick' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('sick')}
              >
                Enfermos ({stats.sick})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : filteredHistorias.length === 0 ? (
            <EmptyState
              icon={<Stethoscope className="h-12 w-12 text-muted-foreground" />}
              title="No hay registros clínicos"
              description={
                filter === 'healthy'
                  ? "No hay registros de estados saludables en este filtro."
                  : filter === 'sick'
                    ? "No hay registros de enfermedades en este filtro."
                    : "No hay registros clínicos registrados aún."
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredHistorias
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                .map((historia) => {
                  const planta = plantas.find(p => p.id_planta === historia.id_planta)
                  return (
                    <div
                      key={historia.id_historia}
                      className={`border rounded-lg p-4 transition-all hover:shadow-sm ${historia.estuvo_enferma
                        ? 'border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20'
                        : 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(historia.fecha), 'PPP', { locale: es })}
                          </span>
                          <Badge variant={historia.estuvo_enferma ? "destructive" : "secondary"}>
                            {historia.estuvo_enferma ? 'Enferma' : 'Saludable'}
                          </Badge>
                        </div>
                        {planta && (
                          <Badge variant="outline">
                            {planta.nombre}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            Descripción
                          </h4>
                          <p className="text-sm">{historia.descripcion}</p>
                        </div>

                        {historia.tratamiento && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Tratamiento
                            </h4>
                            <p className="text-sm">{historia.tratamiento}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <HistoriaClinicaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        idPlanta={selectedPlantaId || plantas[0]?.id_planta || 0}
        plantas={plantas}
        allowPlantaSelection={true}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
