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
  WOMPI: 'Wompi',
  TRANSFERENCIA: 'Transferencia',
}

export const estadoPago = {
  INICIADO: { label: 'Iniciado', tone: 'neutral' },
  EN_VERIFICACION: { label: 'En verificación', tone: 'info' },
  APROBADO: { label: 'Aprobado', tone: 'success' },
  RECHAZADO: { label: 'Rechazado', tone: 'danger' },
}
