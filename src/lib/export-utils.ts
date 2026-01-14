import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import type { PlantHealthTrend, TaskCompletionData, PlantDistribution } from '@/app/actions/analytics'

interface ExportData {
    healthTrends: PlantHealthTrend[]
    taskCompletion: TaskCompletionData[]
    plantDistribution: PlantDistribution[]
}

/**
 * Exporta los datos de analytics a un archivo Excel
 */
export function exportToExcel(data: ExportData) {
    // Crear un nuevo workbook
    const workbook = XLSX.utils.book_new()

    // Hoja 1: Tendencias de Salud de Plantas
    const healthTrendsData = data.healthTrends.map(trend => ({
        'Mes': trend.mes,
        'Saludables': trend.saludables,
        'Enfermas': trend.enfermas,
        'Muertas': trend.muertas,
        'Total': trend.saludables + trend.enfermas + trend.muertas
    }))
    const healthSheet = XLSX.utils.json_to_sheet(healthTrendsData)
    XLSX.utils.book_append_sheet(workbook, healthSheet, 'Salud de Plantas')

    // Hoja 2: Completado de Tareas
    const taskCompletionDataFormatted = data.taskCompletion.map(task => ({
        'Mes': task.mes,
        'Completadas': task.completadas,
        'Pendientes': task.pendientes,
        'Total': task.completadas + task.pendientes,
        'Tasa de Completado (%)': task.completadas + task.pendientes > 0
            ? ((task.completadas / (task.completadas + task.pendientes)) * 100).toFixed(1)
            : '0'
    }))
    const taskSheet = XLSX.utils.json_to_sheet(taskCompletionDataFormatted)
    XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tareas')

    // Hoja 3: Distribución por Género
    const distributionData = data.plantDistribution.map(dist => ({
        'Género': dist.name,
        'Cantidad': dist.value,
        'Porcentaje (%)': ((dist.value / data.plantDistribution.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)
    }))
    const distSheet = XLSX.utils.json_to_sheet(distributionData)
    XLSX.utils.book_append_sheet(workbook, distSheet, 'Distribución por Género')

    // Generar archivo
    const fileName = `vivero-analytics-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    XLSX.writeFile(workbook, fileName)
}

/**
 * Exporta los datos de analytics a un archivo PDF
 */
export function exportToPDF(data: ExportData) {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Título del documento
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte de Analytics - Vivero SaaS', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 28, { align: 'center' })

    let yPosition = 40

    // Tabla 1: Tendencias de Salud de Plantas
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Tendencias de Salud de Plantas', 14, yPosition)
    yPosition += 5

    const healthTrendsTableData = data.healthTrends.map(trend => [
        trend.mes,
        trend.saludables.toString(),
        trend.enfermas.toString(),
        trend.muertas.toString(),
        (trend.saludables + trend.enfermas + trend.muertas).toString()
    ])

    autoTable(doc, {
        startY: yPosition,
        head: [['Mes', 'Saludables', 'Enfermas', 'Muertas', 'Total']],
        body: healthTrendsTableData,
        theme: 'grid',
        headStyles: { fillColor: [34, 197, 94] }, // Verde
        styles: { fontSize: 9 },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPosition = (doc as any).lastAutoTable.finalY + 15

    // Tabla 2: Completado de Tareas
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Completado de Tareas por Mes', 14, yPosition)
    yPosition += 5

    const taskCompletionTableData = data.taskCompletion.map(task => {
        const total = task.completadas + task.pendientes
        const rate = total > 0 ? ((task.completadas / total) * 100).toFixed(1) : '0'
        return [
            task.mes,
            task.completadas.toString(),
            task.pendientes.toString(),
            total.toString(),
            `${rate}%`
        ]
    })

    autoTable(doc, {
        startY: yPosition,
        head: [['Mes', 'Completadas', 'Pendientes', 'Total', 'Tasa']],
        body: taskCompletionTableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] }, // Azul
        styles: { fontSize: 9 },
    })

    // Nueva página para distribución
    doc.addPage()
    yPosition = 20

    // Tabla 3: Distribución por Género
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Distribución de Plantas por Género', 14, yPosition)
    yPosition += 5

    const totalPlants = data.plantDistribution.reduce((sum, d) => sum + d.value, 0)
    const distributionTableData = data.plantDistribution.map(dist => {
        const percentage = ((dist.value / totalPlants) * 100).toFixed(1)
        return [
            dist.name,
            dist.value.toString(),
            `${percentage}%`
        ]
    })

    autoTable(doc, {
        startY: yPosition,
        head: [['Género', 'Cantidad', 'Porcentaje']],
        body: distributionTableData,
        theme: 'grid',
        headStyles: { fillColor: [168, 85, 247] }, // Púrpura
        styles: { fontSize: 9 },
    })

    // Pie de página
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(
            `Página ${i} de ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        )
    }

    // Guardar PDF
    const fileName = `vivero-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`
    doc.save(fileName)
}
