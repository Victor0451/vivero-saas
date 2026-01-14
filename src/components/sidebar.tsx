'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Sprout,
  CheckSquare,
  Settings,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Flower2,
  Box,
  User,
  Package,
  LucideIcon
} from 'lucide-react'
import { useState } from 'react'

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  children?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Plantas',
    href: '/plantas',
    icon: Sprout,
  },
  {
    name: 'Inventario',
    href: '/inventario',
    icon: Package,
  },
  {
    name: 'Catálogos',
    href: '#',
    icon: FolderOpen,
    children: [
      {
        name: 'Géneros',
        href: '/catalogos/generos',
        icon: Flower2,
      },
      {
        name: 'Macetas',
        href: '/catalogos/macetas',
        icon: Box,
      },
    ],
  },
  {
    name: 'Historial Clínico',
    href: '/historial-clinico',
    icon: Stethoscope,
  },
  {
    name: 'Tareas',
    href: '/tareas',
    icon: CheckSquare,
  },
  {
    name: 'Configuración',
    href: '#',
    icon: Settings,
    children: [
      {
        name: 'Perfil',
        href: '/perfil',
        icon: User,
      },
      {
        name: 'General',
        href: '/configuracion',
        icon: Settings,
      },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const isMenuExpanded = (menuName: string) => expandedMenus.includes(menuName)

  const isMenuActive = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some((child) =>
        pathname === child.href || pathname.startsWith(child.href + '/')
      )
    }
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Vivero</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = isMenuActive(item)

          if (item.children) {
            // Elemento con submenú
            return (
              <div key={item.name}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "px-3"
                  )}
                  onClick={() => toggleMenu(item.name)}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isMenuExpanded(item.name) && "rotate-90"
                        )}
                      />
                    </>
                  )}
                </Button>

                {!collapsed && isMenuExpanded(item.name) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href || pathname.startsWith(child.href + '/')
                      return (
                        <Link key={child.name} href={child.href}>
                          <Button
                            variant={isChildActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start px-3",
                              isChildActive && "bg-secondary"
                            )}
                          >
                            <child.icon className="h-3 w-3 mr-2" />
                            <span className="text-sm">{child.name}</span>
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          } else {
            // Elemento simple
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-secondary"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          }
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        {!collapsed && (
          <div className="text-xs text-muted-foreground">
            <p>Vivero SaaS v1.3</p>
            <p className="mt-1">Sistema de gestión</p>
          </div>
        )}
      </div>
    </div>
  )
}
