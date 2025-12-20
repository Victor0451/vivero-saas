'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AvatarUpload } from '@/components/avatar-upload'
import { updateProfile, uploadAvatar } from '@/app/actions/profile'
import { showToast } from '@/lib/toast'
import { Loader2, User, Mail, Shield } from 'lucide-react'

const profileSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre no puede tener más de 100 caracteres'),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  initialData: {
    id: string
    email: string
    nombre: string
    avatar_url: string
    rol: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nombre: initialData.nombre,
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    startTransition(async () => {
      try {
        // Crear FormData con los datos del formulario
        const formData = new FormData()
        formData.append('nombre', data.nombre)

        const result = await updateProfile(formData)

        if (result.success) {
          showToast.success(result.message || 'Perfil actualizado correctamente')
          reset(data) // Reset form to clear dirty state
        } else {
          showToast.error(result.message || 'Error al actualizar el perfil')
        }
      } catch (error) {
        showToast.error('Error inesperado al actualizar el perfil')
      }
    })
  }

  const handleAvatarUpload = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const result = await uploadAvatar(formData)

      if (result.success) {
        showToast.success(result.message || 'Avatar actualizado correctamente')
        setAvatarUrl(result.avatarUrl || '')
      } else {
        showToast.error(result.message || 'Error al actualizar el avatar')
      }
    } catch (error) {
      showToast.error('Error inesperado al subir el avatar')
    } finally {
      setIsUploading(false)
    }
  }

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'destructive'
      case 'manager':
      case 'gerente':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (rol: string) => {
    switch (rol.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'Administrador'
      case 'manager':
      case 'gerente':
        return 'Gerente'
      default:
        return 'Usuario'
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Foto de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={initialData.nombre || initialData.email} />
              <AvatarFallback className="text-lg">
                {initialData.nombre?.charAt(0).toUpperCase() || initialData.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <AvatarUpload
                onUpload={handleAvatarUpload}
                isUploading={isUploading}
                currentAvatarUrl={avatarUrl}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                value={initialData.email}
                readOnly
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                El correo electrónico no se puede modificar
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                {...register('nombre')}
                placeholder="Ingresa tu nombre completo"
              />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>

            {/* Role (Read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rol
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(initialData.rol)}>
                  {getRoleLabel(initialData.rol)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Contacta al administrador para cambiar tu rol
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={!isDirty || isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!isDirty || isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
