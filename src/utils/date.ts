import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDateColombian = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export const formatDateTimeColombian = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: es })
}