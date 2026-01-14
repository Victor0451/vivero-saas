import { NextRequest, NextResponse } from 'next/server'
import { diagnosticarQueries, probarConsultasBasicas } from '@/app/actions/plantas'

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case 'diagnosticarQueries':
        const diagnostico = await diagnosticarQueries()
        return NextResponse.json(diagnostico)

      case 'probarConsultasBasicas':
        const pruebas = await probarConsultasBasicas()
        return NextResponse.json(pruebas)

      default:
        return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error en API debug:', err)
    return NextResponse.json({
      error: err.message || 'Error interno',
      stack: err.stack
    }, { status: 500 })
  }
}
