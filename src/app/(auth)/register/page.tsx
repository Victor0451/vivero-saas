'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/loading-spinner'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir inmediatamente al login con el mensaje de error apropiado
    router.push('/login?error=registration_closed')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Redirigiendo al inicio de sesión...</p>
      </div>
    </div>
  )
}