// Enums de la API → etiqueta en español y tono para StatusBadge.

export const estadoReserva = {
  PENDIENTE: { label: 'Pendiente', tone: 'warning' },
  APROBADA: { label: 'Aprobada', tone: 'success' },
  RECHAZADA: { label: 'Rechazada', tone: 'danger' },
  CANCELADA: { label: 'Cancelada', tone: 'neutral' },
}

export const estadoObligacion = {
  PENDIENTE: { label: 'Pendiente', tone: 'warning' },
  EN_VERIFICACION: { label: 'En verificación', tone: 'info' },
  PAGADA: { label: 'Pagada', tone: 'success' },
  VENCIDA: { label: 'Vencida', tone: 'danger' },
}

export const conceptoObligacion = {
  ARRIENDO: 'Arriendo',
  CUOTA_ADMINISTRACION: 'Cuota de administración',
  SERVICIO_PUBLICO: 'Servicio de agua',
}

export const metodoPago = {
  PAYU: 'PayU (en línea)',
  TRANSFERENCIA: 'Transferencia',
}

export const estadoPago = {
  INICIADO: { label: 'Iniciado', tone: 'neutral' },
  EN_VERIFICACION: { label: 'En verificación', tone: 'info' },
  APROBADO: { label: 'Aprobado', tone: 'success' },
  RECHAZADO: { label: 'Rechazado', tone: 'danger' },
}

export const rolUsuario = {
  RESIDENTE: 'Residente',
  PORTERO: 'Portería',
  MANTENIMIENTO: 'Mantenimiento',
  ADMINISTRADOR: 'Administrador',
}

export const tipoResidente = {
  PROPIETARIO: 'Propietario',
  ARRENDATARIO: 'Arrendatario',
}

export const turnosPorteria = ['Mañana', 'Tarde', 'Noche']

// Estado de la incidencia en el API → etiqueta, colores y paso del avance (Nueva · En proceso · Resuelta)
export const estadoIncidencia = {
  ABIERTA: { label: 'Abierta', punto: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700 ring-sky-200', paso: 'Nueva' },
  ASIGNADA: { label: 'Asignada', punto: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700 ring-violet-200', paso: 'En proceso' },
  EN_PROCESO: { label: 'En proceso', punto: 'bg-warning', chip: 'bg-warning-bg text-warning-strong ring-amber-200', paso: 'En proceso' },
  RESUELTA: { label: 'Por confirmar', punto: 'bg-success', chip: 'bg-success-bg text-success-strong ring-green-200', paso: 'Resuelta' },
  CERRADA: { label: 'Confirmada', punto: 'bg-brand-700', chip: 'bg-brand-600 text-white ring-brand-600', paso: 'Confirmada' },
}

export const prioridadIncidencia = {
  BAJA: { label: 'Baja', punto: 'bg-slate-400' },
  MEDIA: { label: 'Media', punto: 'bg-warning' },
  ALTA: { label: 'Alta', punto: 'bg-danger' },
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

// "2026-10" → "Octubre 2026"; con corto = true → "Oct"
export function nombrePeriodo(periodo, corto = false) {
  const [anio, mes] = periodo.split('-').map(Number)
  const nombre = MESES[mes - 1]
  return corto ? nombre.slice(0, 3) : `${nombre} ${anio}`
}
