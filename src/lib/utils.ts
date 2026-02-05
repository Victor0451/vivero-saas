import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

export function formatDateUTC(dateString: string | Date, formatStr: string = 'd MMM yyyy') {
  if (!dateString) return ''
  const date = new Date(dateString)
  // Convert to UTC timezone to avoid local offset shifting
  const utcDate = toZonedTime(date, 'UTC')
  return format(utcDate, formatStr, { locale: es })
}
