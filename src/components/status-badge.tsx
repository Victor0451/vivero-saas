import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: 'saludable' | 'enferma' | 'muerta' | 'pendiente' | 'completada'
  className?: string
}

const statusConfig = {
  saludable: {
    label: 'Saludable',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  enferma: {
    label: 'Enferma',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  },
  muerta: {
    label: 'Muerta',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  pendiente: {
    label: 'Pendiente',
    variant: 'secondary' as const,
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  },
  completada: {
    label: 'Completada',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
