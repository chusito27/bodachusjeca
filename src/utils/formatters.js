import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = (date) => {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return format(d, 'dd MMM yyyy', { locale: es })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return format(d, "dd MMM yyyy 'a las' HH:mm", { locale: es })
}

export const formatTime = (time) => {
  if (!time) return ''
  return time
}

export const formatCurrency = (amount) => {
  if (amount == null) return '$0'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatRelative = (date) => {
  if (!date) return ''
  const d = date?.toDate ? date.toDate() : new Date(date)
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

export const daysUntil = (date) => {
  return differenceInDays(new Date(date), new Date())
}

export const formatPercentage = (value, total) => {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}
