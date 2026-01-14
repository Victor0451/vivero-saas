'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/page-header'
import { GenerosTable } from '@/components/generos-table'
import { GeneroSheet } from '@/components/genero-sheet'
import { SubgenerosTable } from '@/components/subgeneros-table'
import { SubgeneroSheet } from '@/components/subgenero-sheet'
import { Plus, Sprout, ListTree, Zap } from 'lucide-react'
import { getGeneros } from '@/app/actions/plantas'
import { getSubgeneros } from '@/app/actions/subgeneros'
import { showToast } from '@/lib/toast'
import type { GeneroPlanta, SubgeneroConGenero } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createGenero } from '@/app/actions/plantas'
import { createSubgenero } from '@/app/actions/subgeneros'

export default function GenerosPage() {
  const [generos, setGeneros] = useState<GeneroPlanta[]>([])
  const [subgeneros, setSubgeneros] = useState<SubgeneroConGenero[]>([])
  const [loadingGeneros, setLoadingGeneros] = useState(true)
  const [loadingSubgeneros, setLoadingSubgeneros] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generoSheetOpen, setGeneroSheetOpen] = useState(false)
  const [subgeneroSheetOpen, setSubgeneroSheetOpen] = useState(false)
  const [quickAddDialogOpen, setQuickAddDialogOpen] = useState(false)
  const [editingGenero, setEditingGenero] = useState<GeneroPlanta | null>(null)
  const [editingSubgenero, setEditingSubgenero] = useState<SubgeneroConGenero | null>(null)
  const [activeTab, setActiveTab] = useState('generos')

  // Quick add state
  const [quickGeneroNombre, setQuickGeneroNombre] = useState('')
  const [quickSubgeneroNombre, setQuickSubgeneroNombre] = useState('')
  const [quickLoading, setQuickLoading] = useState(false)

  const loadGeneros = async () => {
    try {
      setLoadingGeneros(true)
      setError(null)
      const data = await getGeneros()
      setGeneros(data)
    } catch (err) {
      console.error('Error loading generos:', err)
      setError('Error al cargar los géneros')
      showToast.error('Error al cargar los géneros')
    } finally {
      setLoadingGeneros(false)
    }
  }

  const loadSubgeneros = async () => {
    try {
      setLoadingSubgeneros(true)
      const data = await getSubgeneros()
      setSubgeneros(data)
    } catch (err) {
      console.error('Error loading subgeneros:', err)
      showToast.error('Error al cargar los subgéneros')
    } finally {
      setLoadingSubgeneros(false)
    }
  }

  useEffect(() => {
    loadGeneros()
    loadSubgeneros()
  }, [])

  const handleCreateGenero = () => {
    setEditingGenero(null)
    setGeneroSheetOpen(true)
  }

  const handleEditGenero = (genero: GeneroPlanta) => {
    setEditingGenero(genero)
    setGeneroSheetOpen(true)
  }

  const handleCreateSubgenero = () => {
    setEditingSubgenero(null)
    setSubgeneroSheetOpen(true)
  }

  const handleEditSubgenero = (subgenero: SubgeneroConGenero) => {
    setEditingSubgenero(subgenero)
    setSubgeneroSheetOpen(true)
  }

  const handleGeneroSuccess = () => {
    loadGeneros()
    loadSubgeneros() // Reload subgeneros in case genre was deleted
  }

  const handleSubgeneroSuccess = () => {
    loadSubgeneros()
  }

  // Recargar géneros cuando se cambia al tab de subgéneros
  useEffect(() => {
    if (activeTab === 'subgeneros') {
      loadGeneros() // Asegurar que los géneros estén actualizados para el select
    }
  }, [activeTab])

  // Quick add handlers
  const handleQuickAdd = async () => {
    if (!quickGeneroNombre.trim()) {
      showToast.error('El nombre del género es requerido')
      return
    }

    setQuickLoading(true)
    try {
      // Crear género
      const generoResult = await createGenero({
        nombre: quickGeneroNombre.trim(),
        descripcion: undefined,
      })

      if (!generoResult.success) {
        showToast.error(generoResult.message)
        setQuickLoading(false)
        return
      }

      // Si hay subgénero, crearlo
      if (quickSubgeneroNombre.trim()) {
        // Esperar un momento para asegurar que el género se haya guardado
        await new Promise(resolve => setTimeout(resolve, 300))

        // Buscar el género recién creado directamente en la base de datos
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: generosData, error: queryError } = await supabase
          .from('generos_planta')
          .select('*')
          .eq('nombre', quickGeneroNombre.trim())
          .limit(1)

        console.log('Query result:', { generosData, queryError, searchName: quickGeneroNombre.trim() })

        if (queryError) {
          console.error('Error querying genre:', queryError)
          showToast.error(`Error al buscar el género: ${queryError.message}`)
          setQuickLoading(false)
          return
        }

        const newGenero = generosData?.[0]

        if (newGenero) {
          const subgeneroResult = await createSubgenero({
            id_genero: newGenero.id_genero,
            nombre: quickSubgeneroNombre.trim(),
            descripcion: undefined,
          })

          if (!subgeneroResult.success) {
            showToast.error(subgeneroResult.error || 'Error al crear subgénero')
            setQuickLoading(false)
            return
          }

          showToast.success('Género y subgénero creados exitosamente')
        } else {
          showToast.error('Género creado, pero no se pudo encontrar para crear el subgénero')
        }
      } else {
        showToast.success('Género creado exitosamente')
      }
      await loadGeneros()
      await loadSubgeneros()

      // Reset form
      setQuickGeneroNombre('')
      setQuickSubgeneroNombre('')
      setQuickAddDialogOpen(false)
    } catch {
      showToast.error('Error al crear')
    } finally {
      setQuickLoading(false)
    }
  }

  const stats = {
    totalGeneros: generos.length,
    totalSubgeneros: subgeneros.length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Géneros y Subgéneros"
        description="Gestiona la clasificación jerárquica de plantas"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setQuickAddDialogOpen(true)}
          >
            <Zap className="h-4 w-4" />
            Creación Rápida
          </Button>
          {activeTab === 'generos' ? (
            <Button className="gap-2" onClick={handleCreateGenero}>
              <Plus className="h-4 w-4" />
              Nuevo Género
            </Button>
          ) : (
            <Button className="gap-2" onClick={handleCreateSubgenero}>
              <Plus className="h-4 w-4" />
              Nuevo Subgénero
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Géneros</CardTitle>
            <Sprout className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGeneros}</div>
            <p className="text-xs text-muted-foreground">
              géneros registrados
            </p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subgéneros</CardTitle>
            <ListTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubgeneros}</div>
            <p className="text-xs text-muted-foreground">
              subgéneros registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="generos">Géneros</TabsTrigger>
          <TabsTrigger value="subgeneros">Subgéneros</TabsTrigger>
        </TabsList>

        <TabsContent value="generos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Géneros</CardTitle>
              <CardDescription>
                Gestiona los géneros principales de plantas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GenerosTable
                generos={generos}
                loading={loadingGeneros}
                error={error}
                onEdit={handleEditGenero}
                onRefresh={loadGeneros}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subgeneros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Subgéneros</CardTitle>
              <CardDescription>
                Gestiona las subcategorías de cada género
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubgenerosTable
                subgeneros={subgeneros}
                loading={loadingSubgeneros}
                error={error}
                onEdit={handleEditSubgenero}
                onRefresh={loadSubgeneros}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Add Dialog */}
      <Dialog open={quickAddDialogOpen} onOpenChange={setQuickAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Creación Rápida
            </DialogTitle>
            <DialogDescription>
              Crea un género y opcionalmente un subgénero en un solo paso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quick-genero">Género *</Label>
              <Input
                id="quick-genero"
                placeholder="Ej: Monstera"
                value={quickGeneroNombre}
                onChange={(e) => setQuickGeneroNombre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickGeneroNombre.trim()) {
                    handleQuickAdd()
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-subgenero">Subgénero (opcional)</Label>
              <Input
                id="quick-subgenero"
                placeholder="Ej: Deliciosa"
                value={quickSubgeneroNombre}
                onChange={(e) => setQuickSubgeneroNombre(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickGeneroNombre.trim()) {
                    handleQuickAdd()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Si lo completas, se creará automáticamente bajo el género especificado
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setQuickAddDialogOpen(false)
                setQuickGeneroNombre('')
                setQuickSubgeneroNombre('')
              }}
              className="flex-1"
              disabled={quickLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleQuickAdd}
              className="flex-1"
              disabled={quickLoading || !quickGeneroNombre.trim()}
            >
              {quickLoading ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <GeneroSheet
        open={generoSheetOpen}
        onOpenChange={setGeneroSheetOpen}
        genero={editingGenero}
        onSuccess={handleGeneroSuccess}
      />

      <SubgeneroSheet
        open={subgeneroSheetOpen}
        onOpenChange={setSubgeneroSheetOpen}
        subgenero={editingSubgenero}
        onSuccess={handleSubgeneroSuccess}
      />
    </div>
  )
}
