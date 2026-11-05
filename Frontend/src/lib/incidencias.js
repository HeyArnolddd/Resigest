import { api, enviarArchivo } from './api'

// Pasos de una incidencia y colores de estado y prioridad (residente y mantenimiento).

// Resuelta = el técnico terminó; Confirmada = quien la reportó confirmó que quedó bien
export const PASOS = ['Nueva', 'En proceso', 'Resuelta', 'Confirmada']

// Estados: color reservado + texto (nunca solo color)
export const estilosEstado = {
  Nueva: 'bg-sky-50 text-sky-700 ring-sky-200',
  Asignada: 'bg-violet-50 text-violet-700 ring-violet-200',
  'En proceso': 'bg-warning-bg text-warning-strong ring-amber-200',
  Resuelta: 'bg-success-bg text-success-strong ring-green-200',
  'Por confirmar': 'bg-success-bg text-success-strong ring-green-200',
  Confirmada: 'bg-brand-600 text-white ring-brand-600',
  Evaluada: 'bg-success-bg text-success-strong ring-green-200',
  Reabierta: 'bg-danger-bg text-danger-strong ring-red-200',
  Rechazada: 'bg-danger-bg text-danger-strong ring-red-200',
}

export const puntoEstado = { Nueva: 'bg-sky-500', Asignada: 'bg-violet-500', 'En proceso': 'bg-warning', Resuelta: 'bg-success', 'Por confirmar': 'bg-success', Confirmada: 'bg-brand-700', Rechazada: 'bg-danger' }

export const puntoPrioridad = { Alta: 'bg-danger', Media: 'bg-warning', Baja: 'bg-slate-400' }

export const CATEGORIAS = ['Plomería', 'Eléctrico', 'Carpintería', 'Iluminación', 'Ascensores', 'Zonas comunes', 'Otro']

const ESTADO = { ABIERTA: 'Nueva', ASIGNADA: 'Asignada', EN_PROCESO: 'En proceso', RESUELTA: 'Por confirmar', CERRADA: 'Confirmada' }
const PASO = { ABIERTA: 'Nueva', ASIGNADA: 'Nueva', EN_PROCESO: 'En proceso', RESUELTA: 'Resuelta', CERRADA: 'Confirmada' }
const PRIORIDAD = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' }
export const prioridadApi = (etiqueta) => Object.keys(PRIORIDAD).find((k) => PRIORIDAD[k] === etiqueta)

export const codigoIncidencia = (id) => `INC-${String(id).padStart(3, '0')}`
export const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })

// IncidenciaDTO → forma que usan las pantallas (etiquetas en español)
export const aIncidencia = (i) => ({
  id: i.id,
  codigo: codigoIncidencia(i.id),
  titulo: i.titulo,
  descripcion: i.descripcion,
  ubicacion: i.ubicacion || i.apartamento || 'Sin ubicación',
  categoria: i.categoria || 'Otro',
  estadoApi: i.estado,
  estado: ESTADO[i.estado],
  // Paso del avance: Asignada todavía no empieza; Por confirmar es el paso "Resuelta"
  paso: PASO[i.estado],
  terminada: i.estado === 'RESUELTA' || i.estado === 'CERRADA',
  prioridad: PRIORIDAD[i.prioridad],
  solicitante: i.reportadoPorNombre,
  apartamento: i.apartamento,
  tecnico: i.asignadoANombre,
  solucion: i.solucion,
  fechaReporte: i.fechaReporte,
  fecha: i.fechaReporte ? fmtFecha(i.fechaReporte) : '',
  evidencias: i.evidencias ?? [],
  fotoSolucionUrl: i.fotoSolucionUrl,
  // Comentario de quien la reportó cuando dijo que el problema seguía
  observacion: i.observacionConfirmacion,
})

export const incidenciasApi = {
  mias: () => api('/incidencias/mias').then((l) => l.map(aIncidencia)),
  asignadas: () => api('/incidencias/asignadas').then((l) => l.map(aIncidencia)),
  reportar: (datos) => api('/incidencias', { method: 'POST', body: datos }).then(aIncidencia),
  agregarEvidencia: (id, archivo) => enviarArchivo(`/incidencias/${id}/evidencias`, archivo).then(aIncidencia),
  iniciar: (id) => api(`/incidencias/${id}/inicio`, { method: 'PATCH' }).then(aIncidencia),
  resolver: (id, solucion, fotoUrl) => api(`/incidencias/${id}/solucion`, { method: 'PATCH', body: { solucion, fotoUrl } }).then(aIncidencia),
  confirmar: (id, solucionado, comentario) =>
    api(`/incidencias/${id}/confirmacion`, { method: 'PATCH', body: { solucionado, comentario } }).then(aIncidencia),
}
