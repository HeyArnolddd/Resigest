import { Bike, Package, UserRound, Wrench } from 'lucide-react'
import { api } from './api'

// Color e icono por tipo de movimiento en portería (se repiten en Inicio, Visitantes y Bitácora)
export const tipoMovimiento = {
  Visitante: { icono: UserRound, chip: 'bg-brand-50 text-brand-700', icon: 'bg-brand-50 text-brand-700 ring-brand-100', punto: 'bg-brand-500', banda: 'bg-brand-600 text-white' },
  Domicilio: { icono: Bike, chip: 'bg-amber-50 text-amber-700', icon: 'bg-amber-50 text-amber-600 ring-amber-100', punto: 'bg-amber-500', banda: 'bg-amber-300 text-amber-950' },
  Servicio: { icono: Wrench, chip: 'bg-sky-50 text-sky-700', icon: 'bg-sky-50 text-sky-600 ring-sky-100', punto: 'bg-sky-500', banda: 'bg-sky-600 text-white' },
  Paquete: { icono: Package, chip: 'bg-violet-50 text-violet-700', icon: 'bg-violet-50 text-violet-600 ring-violet-100', punto: 'bg-violet-500', banda: 'bg-violet-600 text-white' },
}

export const estiloTipo = (tipo) => tipoMovimiento[tipo] ?? tipoMovimiento.Visitante

// Tipo de ingreso en el API ↔ etiqueta en pantalla
export const TIPOS_INGRESO = { VISITANTE: 'Visitante', DOMICILIO: 'Domicilio', SERVICIO: 'Servicio' }
export const tipoApi = (etiqueta) => Object.keys(TIPOS_INGRESO).find((k) => TIPOS_INGRESO[k] === etiqueta)

export const TAMANOS_PAQUETE = ['Sobre', 'Caja pequeña', 'Paquete mediano', 'Caja grande']

export const hora = (iso) => new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

// Fecha local en formato del API (yyyy-MM-dd), desplazada `dias` desde hoy
export const fechaApi = (dias = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toLocaleDateString('en-CA')
}

export const esDeHoy = (iso) => iso && iso.startsWith(fechaApi())

// RegistroIngresoDTO → gafete de la pantalla
export const aIngreso = (r) => ({
  id: r.id,
  persona: r.nombreVisitante,
  documento: r.documento,
  apartamento: r.apartamento,
  tipo: TIPOS_INGRESO[r.tipo] ?? 'Visitante',
  empresa: r.empresa,
  hora: hora(r.fechaIngreso),
  fechaIngreso: r.fechaIngreso,
  fechaSalida: r.fechaSalida,
  dentro: !r.fechaSalida,
  registradoPor: r.registradoPorNombre,
})

// PaqueteDTO → caja de la estantería
export const aPaquete = (p) => ({
  id: p.id,
  apartamentoId: p.apartamentoDestinoId,
  apartamento: p.apartamento,
  empresa: p.empresaTransportadora,
  guia: p.guia,
  descripcion: p.tamano ?? 'Paquete mediano',
  fotoUrl: p.fotoUrl,
  estado: p.estado,
  enPorteria: p.estado !== 'ENTREGADO',
  fechaRecepcion: p.fechaRecepcion,
  fechaEntrega: p.fechaEntrega,
  entregadoA: p.entregadoA,
})

export const porteriaApi = {
  apartamentos: () => api('/apartamentos'),
  directorio: () => api('/usuarios/directorio'),
  paquetes: () => api('/paquetes').then((l) => l.map(aPaquete)),
  registrarPaquete: (datos) => api('/paquetes', { method: 'POST', body: datos }).then(aPaquete),
  entregarPaquete: (id, entregadoA) => api(`/paquetes/${id}/entrega`, { method: 'PATCH', body: { entregadoA } }).then(aPaquete),
  dentro: () => api('/porteria/ingresos/dentro').then((l) => l.map(aIngreso)),
  bitacora: (desde, hasta) => api('/porteria/bitacora', { params: { desde, hasta } }).then((l) => l.map(aIngreso)),
  registrarIngreso: (datos) => api('/porteria/ingresos', { method: 'POST', body: datos }).then(aIngreso),
  registrarSalida: (id) => api(`/porteria/ingresos/${id}/salida`, { method: 'PATCH' }),
}

// Ingresos de hoy más los que siguen dentro desde antes, sin repetir, del más reciente al más antiguo
export async function ingresosDelDia() {
  const [hoy, dentro] = await Promise.all([porteriaApi.bitacora(fechaApi(), fechaApi()), porteriaApi.dentro()])
  const porId = new Map([...dentro, ...hoy].map((i) => [i.id, i]))
  return [...porId.values()].sort((a, b) => b.fechaIngreso.localeCompare(a.fechaIngreso))
}
