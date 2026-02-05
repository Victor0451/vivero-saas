'use client'

import { useState } from 'react'
import {
    Droplets,
    Trash2,
    X,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Skull,
    Loader2,
    CheckSquare,
    Stethoscope
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { showToast } from '@/lib/toast'
import { bulkWatering } from '@/app/actions/bulk-actions'
import { bulkUpdatePlantasStatus, bulkSoftDeletePlantas } from '@/app/actions/plantas'
import { ConfirmDialog } from './confirm-dialog'

interface BulkActionToolbarProps {
    selectedIds: number[]
    onClearSelection: () => void
    onOpenBulkTask?: () => void
    onOpenBulkHistory?: () => void
    onSuccess: () => void
}

export function BulkActionToolbar({ selectedIds, onClearSelection, onOpenBulkTask, onOpenBulkHistory, onSuccess }: BulkActionToolbarProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

    if (selectedIds.length === 0) return null

    const handleBulkWatering = async () => {
        setLoading('watering')
        const res = await bulkWatering(selectedIds)
        if (res.success) {
            showToast.success(res.message)
            onSuccess()
        } else {
            showToast.error(res.message)
        }
        setLoading(null)
    }

    const handleBulkStatusChange = async (status: 'normal' | 'enferma' | 'muerta') => {
        setLoading('status')
        const res = await bulkUpdatePlantasStatus(selectedIds, status)
        if (res.success) {
            showToast.success(res.message)
            onSuccess()
        } else {
            showToast.error(res.message)
        }
        setLoading(null)
    }

    const handleBulkDelete = async () => {
        setLoading('delete')
        const res = await bulkSoftDeletePlantas(selectedIds)
        if (res.success) {
            showToast.success(res.message)
            onSuccess()
        } else {
            showToast.error(res.message)
        }
        setLoading(null)
        setConfirmDeleteOpen(false)
    }

    return (
        <>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
                <div className="bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-4 min-w-[320px] lg:min-w-[550px]">
                    {/* Count */}
                    <div className="flex items-center gap-3 pr-4 border-r border-primary/10">
                        <div className="bg-primary text-primary-foreground h-8 w-8 rounded-xl flex items-center justify-center font-bold text-sm">
                            {selectedIds.length}
                        </div>
                        <span className="text-sm font-semibold hidden sm:inline">Seleccionadas</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/5 rounded-xl gap-2 font-semibold"
                            onClick={handleBulkWatering}
                            disabled={!!loading}
                        >
                            {loading === 'watering' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Droplets className="h-4 w-4" />}
                            <span className="hidden lg:inline">Regar</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/5 rounded-xl gap-2 font-semibold"
                            onClick={onOpenBulkHistory}
                            disabled={!!loading}
                        >
                            <Stethoscope className="h-4 w-4" />
                            <span className="hidden lg:inline">Actividad</span>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:bg-primary/5 rounded-xl gap-2 font-semibold"
                                    disabled={!!loading}
                                >
                                    {loading === 'status' ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                    <span className="hidden lg:inline">Estado</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="rounded-xl p-1">
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('normal')} className="rounded-lg gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    <span>Normal</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('enferma')} className="rounded-lg gap-2">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    <span>Enferma</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkStatusChange('muerta')} className="rounded-lg gap-2">
                                    <Skull className="h-4 w-4 text-destructive" />
                                    <span>Muerta</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/5 rounded-xl gap-2 font-semibold"
                            onClick={onOpenBulkTask}
                            disabled={!!loading}
                        >
                            <CheckSquare className="h-4 w-4" />
                            <span className="hidden lg:inline">Tarea</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/5 rounded-xl gap-2 font-semibold ml-auto"
                            onClick={() => setConfirmDeleteOpen(true)}
                            disabled={!!loading}
                        >
                            {loading === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            <span className="hidden lg:inline">Eliminar</span>
                        </Button>
                    </div>

                    {/* Close */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/5"
                        onClick={onClearSelection}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
                title={`Eliminar ${selectedIds.length} plantas`}
                description={`¿Estás seguro de que quieres eliminar las ${selectedIds.length} plantas seleccionadas? Esta acción no se puede deshacer.`}
                confirmText="Eliminar permanentemente"
                cancelText="Cancelar"
                onConfirm={handleBulkDelete}
                variant="destructive"
            />
        </>
    )
}
