'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createSubgenero, updateSubgenero } from '@/app/actions/subgeneros'
import { getGeneros } from '@/app/actions/plantas'
import { showToast } from '@/lib/toast'
import type { SubgeneroConGenero, GeneroPlanta } from '@/types'

const subgeneroSchema = z.object({
    id_genero: z.number().min(1, 'Debes seleccionar un género'),
    nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
    descripcion: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

type SubgeneroFormData = z.infer<typeof subgeneroSchema>

interface SubgeneroSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    subgenero: SubgeneroConGenero | null
    onSuccess: () => void
}

export function SubgeneroSheet({
    open,
    onOpenChange,
    subgenero,
    onSuccess,
}: SubgeneroSheetProps) {
    const [loading, setLoading] = useState(false)
    const [generos, setGeneros] = useState<GeneroPlanta[]>([])
    const [loadingGeneros, setLoadingGeneros] = useState(true)

    const form = useForm<SubgeneroFormData>({
        resolver: zodResolver(subgeneroSchema),
        defaultValues: {
            id_genero: subgenero?.id_genero || undefined,
            nombre: subgenero?.nombre || '',
            descripcion: subgenero?.descripcion || '',
        },
    })

    useEffect(() => {
        loadGeneros()
    }, [])

    // Recargar géneros cuando se abre el sheet
    useEffect(() => {
        if (open) {
            loadGeneros()
        }
    }, [open])

    useEffect(() => {
        if (subgenero) {
            form.reset({
                id_genero: subgenero.id_genero,
                nombre: subgenero.nombre,
                descripcion: subgenero.descripcion || '',
            })
        } else {
            form.reset({
                id_genero: undefined,
                nombre: '',
                descripcion: '',
            })
        }
    }, [subgenero, form])

    const loadGeneros = async () => {
        try {
            setLoadingGeneros(true)
            const data = await getGeneros()
            setGeneros(data)
        } catch (error) {
            console.error('Error loading generos:', error)
            showToast.error('Error al cargar géneros')
        } finally {
            setLoadingGeneros(false)
        }
    }

    const onSubmit = async (data: SubgeneroFormData) => {
        setLoading(true)
        try {
            let result
            if (subgenero) {
                result = await updateSubgenero(subgenero.id_subgenero, {
                    nombre: data.nombre,
                    descripcion: data.descripcion,
                })
            } else {
                result = await createSubgenero(data)
            }

            if (result.success) {
                showToast.success(
                    subgenero ? 'Subgénero actualizado correctamente' : 'Subgénero creado correctamente'
                )
                onSuccess()
                onOpenChange(false)
                form.reset()
            } else {
                showToast.error(result.error || 'Error al guardar subgénero')
            }
        } catch (error) {
            console.error('Error saving subgenero:', error)
            showToast.error('Error al guardar subgénero')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[540px]">
                <SheetHeader>
                    <SheetTitle>
                        {subgenero ? 'Editar Subgénero' : 'Nuevo Subgénero'}
                    </SheetTitle>
                    <SheetDescription>
                        {subgenero
                            ? 'Modifica los datos del subgénero'
                            : 'Completa los datos para crear un nuevo subgénero'}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                        <FormField
                            control={form.control}
                            name="id_genero"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Género Padre *</FormLabel>
                                    <Select
                                        disabled={loadingGeneros || !!subgenero}
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        value={field.value?.toString()}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un género" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {generos.map((genero) => (
                                                <SelectItem
                                                    key={genero.id_genero}
                                                    value={genero.id_genero.toString()}
                                                >
                                                    {genero.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Deliciosa" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción del subgénero (opcional)"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {subgenero ? 'Actualizar' : 'Crear'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    )
}
