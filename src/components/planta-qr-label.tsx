'use client'

import { useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, QrCode, Leaf } from 'lucide-react'
import { PlantaQRCode } from './planta-qr-code'
import type { PlantaConDetalles } from '@/types'

interface PlantaQRLabelProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    planta: PlantaConDetalles
}

export function PlantaQRLabel({ open, onOpenChange, planta }: PlantaQRLabelProps) {
    const printRef = useRef<HTMLDivElement>(null)

    // URL de la ficha de la planta (usamos la URL actual o construimos una absoluta)
    const plantUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/plantas/${planta.id_planta}`
        : `/plantas/${planta.id_planta}`

    const handlePrint = () => {
        const printContent = printRef.current
        if (!printContent) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Etiqueta - ${planta.nombre}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              justify-content: center;
              padding: 20px;
            }
            .label-card {
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              width: 100%;
              max-width: 300px;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            .qr-container { padding: 8px; background: white; border: 1px solid #f1f5f9; border-radius: 8px; }
            .title { font-size: 18px; font-weight: 700; margin-top: 12px; color: #1e293b; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .footer { font-size: 10px; color: #94a3b8; margin-top: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
            @media print {
              body * { visibility: hidden; }
              .label-card, .label-card * { visibility: visible; }
              .label-card { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="qr-container">
              ${printContent.querySelector('svg')?.outerHTML || ''}
            </div>
            <div class="title">${planta.nombre}</div>
            <div class="subtitle">${planta.tipos_planta?.nombre || ''} • ${planta.generos_planta?.nombre || ''}</div>
            <div class="footer">Vivero SaaS - Escanea para ver ficha</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `)
        printWindow.document.close()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                <div className="bg-gradient-to-br from-white to-slate-50 p-6 md:p-8">
                    <DialogHeader className="mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <QrCode className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Etiqueta de Planta</DialogTitle>
                                <DialogDescription>
                                    Pre visualización de la etiqueta física.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex flex-col items-center">
                        {/* Card Preview */}
                        <div
                            ref={printRef}
                            className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center w-full max-w-[280px] hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] scale-95 group-hover:scale-100 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
                                <PlantaQRCode value={plantUrl} size={160} />
                            </div>

                            <div className="mt-8 space-y-1">
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{planta.nombre}</h3>
                                <p className="text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                                    <Leaf className="w-3 h-3" />
                                    {planta.tipos_planta?.nombre || 'General'}
                                </p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-50 w-full flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                                    ID: ${planta.id_planta}
                                </span>
                                <span className="mt-1 text-[9px] font-medium text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-full">
                                    Vivero SaaS
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-2 gap-3 w-full">
                            <Button
                                variant="outline"
                                className="rounded-2xl h-12 border-slate-200 hover:bg-slate-50 gap-2 border-dashed"
                                onClick={() => onOpenChange(false)}
                            >
                                Cerrar
                            </Button>
                            <Button
                                onClick={handlePrint}
                                className="rounded-2xl h-12 shadow-lg shadow-primary/20 gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimir
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
