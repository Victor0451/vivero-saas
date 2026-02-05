'use client'

import { useState } from 'react'
import { PlantasTable } from './plantas-table'
import { PlantaSheet } from './planta-sheet'
import { TareaSheet } from './tarea-sheet'
import { HistoriaClinicaSheet } from './historia-clinica-sheet'
import { LoadingIndicator } from './ui/loading-indicator'
import { PlantasFilterBar } from './plantas-filter-bar'
import { PlantasGrid } from './plantas-grid'
import { Button } from '@/components/ui/button'
import type { PlantaConDetalles, GeneroPlanta, SubgeneroConGenero } from '@/types'
import { getPlantas } from '../app/actions/plantas'
import { BulkActionToolbar } from './bulk-action-toolbar'

interface PlantasContentProps {
  initialPlantas: PlantaConDetalles[]
  generos: GeneroPlanta[]
  subgeneros: SubgeneroConGenero[]
}

export function PlantasContent({ initialPlantas, generos, subgeneros }: PlantasContentProps) {
  const [plantas, setPlantas] = useState<PlantaConDetalles[]>(initialPlantas)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter States
  const [search, setSearch] = useState('')
  const [genreId, setGenreId] = useState('all')
  const [subgenreId, setSubgenreId] = useState('all')
  const [status, setStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const [sheetOpen, setSheetOpen] = useState(false)
  const [tareaSheetOpen, setTareaSheetOpen] = useState(false)
  const [historiaSheetOpen, setHistoriaSheetOpen] = useState(false)
  const [bulkTareaSheetOpen, setBulkTareaSheetOpen] = useState(false)
  const [bulkHistoriaSheetOpen, setBulkHistoriaSheetOpen] = useState(false) // New State
  const [editingPlanta, setEditingPlanta] = useState<PlantaConDetalles | null>(null)
  // ... (state definitions) ...
  const [selectedPlantaForTarea, setSelectedPlantaForTarea] = useState<PlantaConDetalles | null>(null)
  const [selectedPlantaForHistoria, setSelectedPlantaForHistoria] = useState<PlantaConDetalles | null>(null)

  const loadPlantas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPlantas()
      setPlantas(data)
    } catch (err) {
      console.error('Error loading plantas:', err)
      setError('Error al cargar las plantas')
    } finally {
      setLoading(false)
    }
  }

  // Filtering Logic
  const filteredPlantas = plantas.filter(planta => {
    const matchesSearch = planta.nombre.toLowerCase().includes(search.toLowerCase())
    const matchesGenre = genreId === 'all' || planta.id_genero.toString() === genreId
    const matchesSubgenre = subgenreId === 'all' || planta.id_subgenero?.toString() === subgenreId

    let matchesStatus = true
    if (status === 'enferma') matchesStatus = planta.esta_enferma && !planta.esta_muerta
    else if (status === 'muerta') matchesStatus = planta.esta_muerta
    else if (status === 'normal') matchesStatus = !planta.esta_enferma && !planta.esta_muerta

    return matchesSearch && matchesGenre && matchesSubgenre && matchesStatus
  })

  const handleCreate = () => {
    setEditingPlanta(null)
    setSheetOpen(true)
  }

  const handleEdit = (planta: PlantaConDetalles) => {
    setEditingPlanta(planta)
    setSheetOpen(true)
  }

  const handleSuccess = () => {
    loadPlantas()
  }

  const handleCreateTarea = (planta: PlantaConDetalles) => {
    setSelectedPlantaForTarea(planta)
    setTareaSheetOpen(true)
  }

  const handleCreateHistoria = (planta: PlantaConDetalles) => {
    setSelectedPlantaForHistoria(planta)
    setHistoriaSheetOpen(true)
  }

  const handleTareaSuccess = () => {
    loadPlantas()
  }

  const handleHistoriaSuccess = () => {
    loadPlantas()
  }

  return (
    <div className="space-y-4">
      <PlantasFilterBar
        search={search}
        onSearchChange={setSearch}
        genreId={genreId}
        onGenreIdChange={(val) => { setGenreId(val); setSubgenreId('all'); }}
        subgenreId={subgenreId}
        onSubgenreIdChange={setSubgenreId}
        status={status}
        onStatusChange={setStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        generos={generos}
        subgeneros={subgeneros}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <LoadingIndicator size="lg" message="Sincronizando colección..." />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 bg-destructive/5 rounded-2xl border border-destructive/20 text-center">
          {/* ... Error visuals ... */}
          <h3 className="text-lg font-semibold mb-2">Error de conexión</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
          <Button onClick={loadPlantas} variant="default" className="rounded-xl px-8">
            Reintentar
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <PlantasGrid
          plantas={filteredPlantas}
          onEdit={handleEdit}
          onDelete={() => loadPlantas()}
          onCreateTarea={handleCreateTarea}
          onCreateHistoria={handleCreateHistoria}
          selectedIds={selectedIds}
          onToggleSelection={(id) => {
            setSelectedIds(prev =>
              prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            )
          }}
        />
      ) : (
        <PlantasTable
          plantas={filteredPlantas}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onRefresh={loadPlantas}
          onCreate={handleCreate}
          onCreateTarea={handleCreateTarea}
          onCreateHistoria={handleCreateHistoria}
          selectedIds={selectedIds}
          onToggleSelection={(id) => {
            setSelectedIds(prev =>
              prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            )
          }}
          onToggleAllSelect={(ids) => {
            setSelectedIds(ids)
          }}
        />
      )}

      <BulkActionToolbar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onOpenBulkTask={() => setBulkTareaSheetOpen(true)}
        onOpenBulkHistory={() => setBulkHistoriaSheetOpen(true)} // Connected
        onSuccess={() => {
          setSelectedIds([])
          loadPlantas()
        }}
      />

      <PlantaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        planta={editingPlanta}
        onSuccess={handleSuccess}
      />

      <TareaSheet
        open={tareaSheetOpen}
        onOpenChange={(open) => {
          setTareaSheetOpen(open)
          if (!open) setSelectedPlantaForTarea(null)
        }}
        defaultPlantaId={selectedPlantaForTarea?.id_planta}
        onSuccess={handleTareaSuccess}
      />

      <TareaSheet
        open={bulkTareaSheetOpen}
        onOpenChange={setBulkTareaSheetOpen}
        plantaIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([])
          loadPlantas()
          setBulkTareaSheetOpen(false)
        }}
      />

      {/* Single History Sheet */}
      <HistoriaClinicaSheet
        open={historiaSheetOpen}
        onOpenChange={(open) => {
          setHistoriaSheetOpen(open)
          if (!open) setSelectedPlantaForHistoria(null)
        }}
        historia={null}
        defaultPlantaId={selectedPlantaForHistoria?.id_planta || 0}
        onSuccess={handleHistoriaSuccess}
      />

      {/* Bulk History Sheet */}
      <HistoriaClinicaSheet
        open={bulkHistoriaSheetOpen}
        onOpenChange={setBulkHistoriaSheetOpen}
        plantaIds={selectedIds}
        onSuccess={() => {
          setSelectedIds([])
          loadPlantas()
          setBulkHistoriaSheetOpen(false)
        }}
      />

      {/* Hidden form for the "Nueva Planta" button */}
      <form id="planta-form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </div>
  )
}
