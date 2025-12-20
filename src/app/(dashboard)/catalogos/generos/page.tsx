'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { GenerosTable } from '@/components/generos-table'
import { GeneroSheet } from '@/components/genero-sheet'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import { Plus, Sprout } from 'lucide-react'
import { getGeneros } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'
import type { GeneroPlanta } from '@/types'

export default function GenerosPage() {
  const [generos, setGeneros] = useState<GeneroPlanta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingGenero, setEditingGenero] = useState<GeneroPlanta | null>(null)

  const loadGeneros = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getGeneros()
      setGeneros(data)
    } catch (err) {
      console.error('Error loading generos:', err)
      setError('Error al cargar los géneros')
      showToast.error('Error al cargar los géneros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGeneros()
  }, [])

  const handleCreate = () => {
    setEditingGenero(null)
    setSheetOpen(true)
  }

  const handleEdit = (genero: GeneroPlanta) => {
    setEditingGenero(genero)
    setSheetOpen(true)
  }

  const handleSuccess = () => {
    loadGeneros()
  }

  const stats = {
    total: generos.length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Géneros de Plantas"
        description="Gestiona los géneros de plantas disponibles en tu vivero"
      >
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nuevo Género
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-1 max-w-md">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Géneros</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              géneros registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Géneros</CardTitle>
        </CardHeader>
        <CardContent>
          <GenerosTable
            generos={generos}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onRefresh={loadGeneros}
          />
        </CardContent>
      </Card>

      <GeneroSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        genero={editingGenero}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
