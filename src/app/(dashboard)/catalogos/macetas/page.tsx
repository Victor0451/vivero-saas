'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { MacetasTable } from '@/components/macetas-table'
import { MacetaSheet } from '@/components/maceta-sheet'
import { Plus, Box } from 'lucide-react'
import { getMacetas } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'
import type { Maceta } from '@/types'

export default function MacetasPage() {
  const [macetas, setMacetas] = useState<Maceta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingMaceta, setEditingMaceta] = useState<Maceta | null>(null)

  const loadMacetas = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMacetas()
      setMacetas(data)
    } catch (err) {
      console.error('Error loading macetas:', err)
      setError('Error al cargar las macetas')
      showToast.error('Error al cargar las macetas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMacetas()
  }, [])

  const handleCreate = () => {
    setEditingMaceta(null)
    setSheetOpen(true)
  }

  const handleEdit = (maceta: Maceta) => {
    setEditingMaceta(maceta)
    setSheetOpen(true)
  }

  const handleSuccess = () => {
    loadMacetas()
  }

  const stats = {
    total: macetas.length,
    conMaterial: macetas.filter(m => m.material).length,
    conDimensiones: macetas.filter(m => m.diametro_cm || m.altura_cm).length,
    conVolumen: macetas.filter(m => m.volumen_lts).length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Macetas"
        description="Gestiona las macetas disponibles en tu vivero"
      >
        <Button className="gap-2" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nueva Maceta
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Macetas</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              macetas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Material</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conMaterial}</div>
            <p className="text-xs text-muted-foreground">
              especifican material
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Dimensiones</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conDimensiones}</div>
            <p className="text-xs text-muted-foreground">
              tienen medidas
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Volumen</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conVolumen}</div>
            <p className="text-xs text-muted-foreground">
              especifican capacidad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Macetas</CardTitle>
        </CardHeader>
        <CardContent>
          <MacetasTable
            macetas={macetas}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onRefresh={loadMacetas}
          />
        </CardContent>
      </Card>

      <MacetaSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        maceta={editingMaceta}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
