'use client'

import { useState, useEffect } from 'react'
import { PlantasTable } from './plantas-table'
import { PlantaSheet } from './planta-sheet'
import { TareaSheet } from './tarea-sheet'
import { HistoriaClinicaSheet } from './historia-clinica-sheet'
import { LoadingIndicator } from './ui/loading-indicator'
import type { PlantaConDetalles } from '@/types'
import { getPlantas } from '../app/actions/plantas'

export function PlantasContent() {
  const [plantas, setPlantas] = useState<PlantaConDetalles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tareaSheetOpen, setTareaSheetOpen] = useState(false)
  const [historiaSheetOpen, setHistoriaSheetOpen] = useState(false)
  const [editingPlanta, setEditingPlanta] = useState<PlantaConDetalles | null>(null)
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

  useEffect(() => {
    loadPlantas()
  }, [])

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
    <>
      {loading ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <LoadingIndicator size="lg" message="Cargando plantas..." />
          </div>
        </div>
      ) : error ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Error al cargar plantas</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={loadPlantas}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <PlantasTable
          plantas={plantas}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onRefresh={loadPlantas}
          onCreate={handleCreate}
          onCreateTarea={handleCreateTarea}
          onCreateHistoria={handleCreateHistoria}
        />
      )}

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

      <HistoriaClinicaSheet
        open={historiaSheetOpen}
        onOpenChange={(open) => {
          setHistoriaSheetOpen(open)
          if (!open) setSelectedPlantaForHistoria(null)
        }}
        historia={null}
        idPlanta={selectedPlantaForHistoria?.id_planta || 0}
        plantas={[]}
        allowPlantaSelection={false}
        onSuccess={handleHistoriaSuccess}
      />

      {/* Hidden form for the "Nueva Planta" button */}
      <form id="planta-form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
        <button type="submit" style={{ display: 'none' }} />
      </form>
    </>
  )
}
