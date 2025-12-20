import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Settings, Moon, Sun } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

interface HeaderProps {
  tenantName?: string
}

async function getUserProfile() {
  const supabase = await createClient()

  // Obtener datos del usuario autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      id: '',
      email: 'usuario@vivero.com',
      nombre: 'Usuario',
      avatar_url: ''
    }
  }

  // Obtener datos adicionales del perfil desde public.users
  const { data: profile } = await supabase
    .from('users')
    .select('nombre, avatar_url, id_tenant')
    .eq('id_user', user.id)
    .single()

  return {
    id: user.id,
    email: user.email || '',
    nombre: profile?.nombre || 'Usuario',
    avatar_url: profile?.avatar_url || ''
  }
}

export async function Header({ tenantName = 'Vivero Principal' }: HeaderProps) {
  const userProfile = await getUserProfile()

  const handleLogout = async () => {
    'use server'
    await logoutAction()
  }

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      {/* Tenant Info */}
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="font-semibold text-lg">{tenantName}</h1>
          <p className="text-sm text-muted-foreground">Sistema de gestión</p>
        </div>
      </div>

      {/* User Menu & Theme Toggle */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.nombre} />
                <AvatarFallback>
                  {userProfile.nombre?.charAt(0).toUpperCase() || userProfile.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userProfile.nombre}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userProfile.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/perfil">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
