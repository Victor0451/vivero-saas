import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PlantaConDetalles, HistoriaClinica } from '@/types'

// Extend jsPDF type to include autoTable (often needed for TS)
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: { finalY: number }
}

export const generateClinicalReport = (planta: PlantaConDetalles, historia: HistoriaClinica[]) => {
    const doc = new jsPDF() as jsPDFWithAutoTable
    const pageWidth = doc.internal.pageSize.width

    // Header
    doc.setFontSize(22)
    doc.setTextColor(40, 40, 40)
    doc.text('Historia Clínica Digital', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generado el: ${format(new Date(), "dd 'de' MMMM, yyyy - HH:mm", { locale: es })}`, 14, 26)

    // Separator
    doc.setDrawColor(200, 200, 200)
    doc.line(14, 30, pageWidth - 14, 30)

    // Plant Info Section
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(planta.nombre, 14, 40)

    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)

    const col1X = 14
    const col2X = pageWidth / 2

    doc.text(`Género: ${planta.generos_planta?.nombre || 'N/A'}`, col1X, 48)
    doc.text(`Tipo: ${planta.tipos_planta?.nombre || 'N/A'}`, col1X, 54)

    doc.text(`Fecha Admisión: ${planta.fecha_compra ? format(new Date(planta.fecha_compra), 'dd/MM/yyyy') : 'N/A'}`, col2X, 48)

    // Clinical History Table
    const tableData = historia.map(item => [
        format(new Date(item.fecha), 'dd/MM/yyyy'),
        item.tipo_evento || 'General',
        item.descripcion,
        item.tratamiento || '-',
        item.severidad || '-'
    ])

    autoTable(doc, {
        startY: 65,
        head: [['Fecha', 'Evento', 'Descripción', 'Tratamiento', 'Severidad']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 }, // Indigo
        alternateRowStyles: { fillColor: [245, 247, 255] },
        columnStyles: {
            0: { cellWidth: 25 }, // Fecha
            1: { cellWidth: 25 }, // Evento
            2: { cellWidth: 60 }, // Descripcion
            3: { cellWidth: 40 }, // Tratamiento
            4: { cellWidth: 20 }  // Severidad
        },
        didDrawPage: (data) => {
            // Footer page number
            const str = 'Página ' + doc.getNumberOfPages()
            doc.setFontSize(8)
            doc.text(str, pageWidth - 30, doc.internal.pageSize.height - 10)
        }
    })

    // Save the PDF
    doc.save(`historia_clinica_${planta.nombre.replace(/\s+/g, '_').toLowerCase()}.pdf`)
}
