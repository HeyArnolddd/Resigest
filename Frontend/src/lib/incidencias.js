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

// ---- Conversión del API (IncidenciaDTO) a la forma que usan las pantallas ----

export const CATEGORIAS = [
  { clave: 'PLOMERIA', etiqueta: 'Plomería' },
  { clave: 'ELECTRICO', etiqueta: 'Eléctrico' },
  { clave: 'CARPINTERIA', etiqueta: 'Carpintería' },
  { clave: 'ILUMINACION', etiqueta: 'Iluminación' },
  { clave: 'ASCENSORES', etiqueta: 'Ascensores' },
  { clave: 'ZONAS_COMUNES', etiqueta: 'Zonas comunes' },
  { clave: 'OTRO', etiqueta: 'Otro' },
]

const ESTADO = { ABIERTA: 'Nueva', ASIGNADA: 'Nueva', EN_PROCESO: 'En proceso', RESUELTA: 'Resuelta' }
const PRIORIDAD = { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' }

export const aVistaIncidencia = (i) => ({
  id: `INC-${String(i.id).padStart(3, '0')}`,
  idApi: i.id,
  titulo: i.titulo,
  descripcion: i.descripcion,
  categoria: CATEGORIAS.find((c) => c.clave === i.categoria)?.etiqueta ?? 'Otro',
  ubicacion: [i.apartamento, i.ubicacion].filter(Boolean).join(' · '),
  fecha: i.fechaReporte ? i.fechaReporte.slice(0, 10).split('-').reverse().join('/') : '',
  prioridad: PRIORIDAD[i.prioridad] ?? 'Media',
  estado: ESTADO[i.estado] ?? 'Nueva',
  solicitante: i.reportadoPorNombre,
  asignadoA: i.asignadoANombre,
  solucion: i.solucion,
})
