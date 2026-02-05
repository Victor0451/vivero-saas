'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { Upload, Loader2 } from 'lucide-react'
import { uploadFotoPlanta } from '@/app/actions/fotos'
import { showToast } from '@/lib/toast'

interface AddFotoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    idPlanta: number
    onSuccess: () => void
}

export function AddFotoDialog({
    open,
    onOpenChange,
    idPlanta,
    onSuccess
}: AddFotoDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [notas, setNotas] = useState('')
    const [esPrincipal, setEsPrincipal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            const objectUrl = URL.createObjectURL(selectedFile)
            setPreview(objectUrl)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fecha', date)
        formData.append('notas', notas)
        formData.append('es_principal', String(esPrincipal))

        try {
            const result = await uploadFotoPlanta(idPlanta, formData)

            if (result.success) {
                showToast.success('Foto subida correctamente')
                onSuccess()
                onOpenChange(false)
                // Reset form
                setFile(null)
                setPreview(null)
                setNotas('')
                setEsPrincipal(false)
                setDate(new Date().toISOString().split('T')[0])
            } else {
                showToast.error(result.message || 'Error al subir la foto')
            }
        } catch (error) {
            console.log(error)
            showToast.error('Error al subir la foto')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Foto a Bitácora</DialogTitle>
                    <DialogDescription>
                        Sube una nueva foto para registrar el progreso de tu planta.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {/* Image Upload Area */}
                    <div className="grid place-items-center">
                        <div className={cn(
                            "relative flex flex-col items-center justify-center w-full h-[200px] border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                            preview ? "border-primary" : "border-muted-foreground/25"
                        )}>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleFileChange}
                                required
                            />

                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="absolute inset-0 w-full h-full object-contain p-2 rounded-lg"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click para subir</span> o arrastra y suelta
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG o WEBP
                                    </p>
                                </div>
                            )}
                        </div>
                        {preview && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-xs text-muted-foreground"
                                onClick={() => {
                                    setFile(null)
                                    setPreview(null)
                                }}
                            >
                                Remover imagen
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha de la foto</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-8">
                            <Checkbox
                                id="principal"
                                checked={esPrincipal}
                                onCheckedChange={(checked) => setEsPrincipal(checked as boolean)}
                            />
                            <Label htmlFor="principal" className="cursor-pointer">
                                Usar como foto principal
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notas">Notas (Opcional)</Label>
                        <Textarea
                            id="notas"
                            placeholder="Describí el progreso, síntomas o cambios observados..."
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            className="resize-none"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!file || isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Subir Foto
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
