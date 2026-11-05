// Pasos de una incidencia y colores de estado y prioridad (residente y mantenimiento).

export const PASOS = ['Nueva', 'En proceso', 'Resuelta']

// Estados: color reservado + texto (nunca solo color)
export const estilosEstado = {
  Nueva: 'bg-sky-50 text-sky-700 ring-sky-200',
  'En proceso': 'bg-warning-bg text-warning-strong ring-amber-200',
  Resuelta: 'bg-success-bg text-success-strong ring-green-200',
  Evaluada: 'bg-success-bg text-success-strong ring-green-200',
  Reabierta: 'bg-danger-bg text-danger-strong ring-red-200',
  Rechazada: 'bg-danger-bg text-danger-strong ring-red-200',
}

export const puntoEstado = { Nueva: 'bg-sky-500', 'En proceso': 'bg-warning', Resuelta: 'bg-success', Rechazada: 'bg-danger' }

export const puntoPrioridad = { Alta: 'bg-danger', Media: 'bg-warning', Baja: 'bg-slate-400' }
