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
import { getAllHistoriaClinicaWithPlantas } from '@/app/actions/historia-clinica'
import { getGeneros } from '@/app/actions/generos'
import { getMacetas } from '@/app/actions/macetas'
import { getPlantas } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'
import { HistoriaClinicaSheet } from '@/components/historia-clinica-sheet'
import { HistoriaClinicaTimeline } from '@/components/historia-clinica-timeline'
import { HistoriaClinicaFilters, type FilterState } from '@/components/historia-clinica-filters'
import type { HistoriaClinica, Planta, GeneroPlanta, Maceta } from '@/types'

type FilterType = 'all' | 'healthy' | 'sick'

export default function HistorialClinicoPage() {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([])
  const [plantas, setPlantas] = useState<Planta[]>([])
  const [generos, setGeneros] = useState<GeneroPlanta[]>([])
  const [macetas, setMacetas] = useState<Maceta[]>([])

  const [historyFilters, setHistoryFilters] = useState<FilterState>({
    search: '',
    tipoEvento: 'all',
    estado: 'all',
    fechaStart: '',
    fechaEnd: ''
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedPlantaId, setSelectedPlantaId] = useState<number | null>(null)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [plantasData, generosData, macetasData, historiasData] = await Promise.all([
        getPlantas(),
        getGeneros(),
        getMacetas(),
        getAllHistoriaClinicaWithPlantas()
      ])

      setPlantas(plantasData)
      setGeneros(generosData)
      setMacetas(macetasData)
      setHistorias(historiasData)

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

  const filteredHistorias = historias.filter(item => {
    // Filter by Search
    if (historyFilters.search && !item.descripcion.toLowerCase().includes(historyFilters.search.toLowerCase()) &&
      (!item.tratamiento || !item.tratamiento.toLowerCase().includes(historyFilters.search.toLowerCase())) &&
      (!item.plantas?.nombre || !item.plantas.nombre.toLowerCase().includes(historyFilters.search.toLowerCase()))) {
      return false;
    }

    // Filter by Type
    if (historyFilters.tipoEvento !== 'all' && item.tipo_evento !== historyFilters.tipoEvento) {
      return false;
    }

    // Filter by State
    if (historyFilters.estado !== 'all') {
      if (historyFilters.estado === 'enferma' && !item.estuvo_enferma) return false;
      if (historyFilters.estado === 'sana' && item.estuvo_enferma) return false;
    }

    // Filter by Date
    if (historyFilters.fechaStart && new Date(item.fecha) < new Date(historyFilters.fechaStart)) return false;
    if (historyFilters.fechaEnd && new Date(item.fecha) > new Date(historyFilters.fechaEnd)) return false;

    return true;
  });

  const activeFiltersCount = [
    historyFilters.search !== '',
    historyFilters.tipoEvento !== 'all',
    historyFilters.estado !== 'all',
    historyFilters.fechaStart !== '',
    historyFilters.fechaEnd !== ''
  ].filter(Boolean).length;

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
      <HistoriaClinicaFilters
        onFilterChange={setHistoryFilters}
        activeFiltersCount={activeFiltersCount}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Historial Clínico ({filteredHistorias.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <HistoriaClinicaTimeline
              historias={filteredHistorias}
            />
          )}
        </CardContent>
      </Card>

      <HistoriaClinicaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        defaultPlantaId={selectedPlantaId || plantas[0]?.id_planta || 0}
        plantas={plantas}
        generos={generos}
        macetas={macetas}

        onSuccess={handleSuccess}
      />
    </div >
  )
}
