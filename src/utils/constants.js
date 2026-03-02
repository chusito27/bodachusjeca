export const WEDDING_DATE = new Date('2027-02-27T12:00:00')

export const GUEST_GROUPS = [
  { value: 'familia_novia', label: 'Familia Novia' },
  { value: 'familia_novio', label: 'Familia Novio' },
  { value: 'amigos', label: 'Amigos' },
  { value: 'trabajo', label: 'Trabajo' },
  { value: 'otros', label: 'Otros' }
]

export const RSVP_STATUS = [
  { value: 'pendiente', label: 'Pendiente', color: 'warning' },
  { value: 'confirmado', label: 'Confirmado', color: 'success' },
  { value: 'declinado', label: 'Declinado', color: 'error' }
]

export const BUDGET_CATEGORIES = [
  { value: 'venue', label: 'Venue / Lugar', icon: '🏛️' },
  { value: 'catering', label: 'Catering', icon: '🍽️' },
  { value: 'decoracion', label: 'Decoración', icon: '🎨' },
  { value: 'musica', label: 'Música / DJ', icon: '🎵' },
  { value: 'foto_video', label: 'Foto / Video', icon: '📸' },
  { value: 'vestimenta', label: 'Vestimenta', icon: '👗' },
  { value: 'flores', label: 'Flores', icon: '💐' },
  { value: 'transporte', label: 'Transporte', icon: '🚗' },
  { value: 'invitaciones', label: 'Invitaciones', icon: '💌' },
  { value: 'otros', label: 'Otros', icon: '📦' }
]

export const PAYMENT_STATUS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'pagado', label: 'Pagado' }
]

export const VENDOR_STATUS = [
  { value: 'contactado', label: 'Contactado' },
  { value: 'cotizado', label: 'Cotizado' },
  { value: 'contratado', label: 'Contratado' },
  { value: 'pagado', label: 'Pagado' }
]

export const TASK_PRIORITIES = [
  { value: 'alta', label: 'Alta', color: 'error' },
  { value: 'media', label: 'Media', color: 'warning' },
  { value: 'baja', label: 'Baja', color: 'success' }
]

export const TASK_STATUS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'completada', label: 'Completada' }
]

export const TASK_CATEGORIES = [
  'Ceremonia', 'Recepción', 'Documentos', 'Personal',
  'Decoración', 'Música', 'Catering', 'Transporte', 'Otros'
]

export const MUSIC_MOMENTS = [
  { value: 'ceremonia', label: 'Ceremonia' },
  { value: 'coctel', label: 'Cóctel' },
  { value: 'primer_baile', label: 'Primer Baile' },
  { value: 'fiesta', label: 'Fiesta' },
  { value: 'vals', label: 'Vals' },
  { value: 'otro', label: 'Otro' }
]

export const GALLERY_CATEGORIES = [
  { value: 'inspiracion', label: 'Inspiración' },
  { value: 'venue', label: 'Venue' },
  { value: 'pruebas', label: 'Pruebas' },
  { value: 'invitaciones', label: 'Invitaciones' },
  { value: 'otros', label: 'Otros' }
]

export const MENU_CATEGORIES = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'plato_fuerte', label: 'Plato Fuerte' },
  { value: 'postre', label: 'Postre' },
  { value: 'bebida', label: 'Bebida' },
  { value: 'otro', label: 'Otro' }
]
