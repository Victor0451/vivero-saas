'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { loginAction, loginDemoAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Sprout, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'invalid_credentials') {
      setError('Credenciales incorrectas. Inténtalo de nuevo.')
    } else if (errorParam === 'registration_closed') {
      setError('El registro público está cerrado temporalmente.')
    } else if (errorParam === 'missing_fields') {
      setError('Por favor, completa todos los campos.')
    } else if (errorParam === 'session_error') {
      setError('Error al iniciar sesión. Inténtalo de nuevo.')
    } else if (errorParam) {
      setError('Ha ocurrido un error. Inténtalo de nuevo.')
    }
  }, [searchParams])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      formData.append('redirectTo', redirectTo)
      await loginAction(formData)
    } catch (err) {
      // El error ya se maneja en la acción server-side con redirect
      console.error('Unexpected login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      await loginDemoAction(formData)
    } catch (err) {
      // Ignorar error de redirección de Next.js
      if ((err as Error).message.includes('NEXT_REDIRECT')) {
        return
      }
      console.error('Demo login error:', err)
      setError('Error al iniciar la demo.')
      setIsLoading(false)
    }
  }

  const handleInputChange = () => {
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Sprout className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Bienvenido de vuelta</CardTitle>
            <CardDescription className="text-base">
              Ingresa tus credenciales para acceder a tu vivero
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                disabled={isLoading}
                className="h-12 text-base"
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="h-12 text-base pr-10"
                  onChange={handleInputChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                O prueba sin registrarte
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full h-12 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-all font-medium"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            Probá la Demo (Acceso Total)
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Registro cerrado durante Beta Pública.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <LoginContent />
    </Suspense>
  )
}