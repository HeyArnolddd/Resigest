import { Bike, Package, UserRound, Wrench } from 'lucide-react'

// Color e icono por tipo de movimiento en portería (se repiten en Inicio, Visitantes y Bitácora)
export const tipoMovimiento = {
  Visitante: { icono: UserRound, chip: 'bg-brand-50 text-brand-700', icon: 'bg-brand-50 text-brand-700 ring-brand-100', punto: 'bg-brand-500', banda: 'bg-brand-600 text-white' },
  Domicilio: { icono: Bike, chip: 'bg-amber-50 text-amber-700', icon: 'bg-amber-50 text-amber-600 ring-amber-100', punto: 'bg-amber-500', banda: 'bg-amber-300 text-amber-950' },
  Servicio: { icono: Wrench, chip: 'bg-sky-50 text-sky-700', icon: 'bg-sky-50 text-sky-600 ring-sky-100', punto: 'bg-sky-500', banda: 'bg-sky-600 text-white' },
  Paquete: { icono: Package, chip: 'bg-violet-50 text-violet-700', icon: 'bg-violet-50 text-violet-600 ring-violet-100', punto: 'bg-violet-500', banda: 'bg-violet-600 text-white' },
}

export const estiloTipo = (tipo) => tipoMovimiento[tipo] ?? tipoMovimiento.Visitante

export const horaActual = () => new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })

// ---- Conversión del API a la forma que usan las pantallas de portería ----

export const fechaISO = (d) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}
export const hoyLocal = () => fechaISO(new Date())
export const ayerLocal = () => fechaISO(new Date(Date.now() - 86400000))

export const aVistaIngreso = (r) => ({
  id: r.id,
  hora: r.fechaIngreso.slice(11, 16),
  persona: r.nombreVisitante,
  apartamento: r.apartamento,
  tipo: r.tipo === 'DOMICILIO' ? 'Domicilio' : 'Visitante',
  estado: r.fechaSalida ? 'Completado' : 'En portería',
  dia: r.fechaIngreso.slice(0, 10) === hoyLocal() ? 'Hoy' : r.fechaIngreso.slice(0, 10) === ayerLocal() ? 'Ayer' : 'Antes',
})

export const aVistaPaqueteEstante = (p) => ({
  id: p.id,
  idApi: p.id,
  empresa: p.empresaTransportadora,
  guia: p.guia ?? `S/G-${p.id}`,
  apartamento: p.apartamento,
  descripcion: ({ SOBRE: 'Sobre', PEQUENO: 'Caja pequeña', MEDIANO: 'Paquete mediano', GRANDE: 'Caja grande' })[p.tamano] ?? p.descripcion,
  fecha: `${p.fechaRecepcion.slice(8, 10)}/${p.fechaRecepcion.slice(5, 7)}/${p.fechaRecepcion.slice(0, 4)} · ${p.fechaRecepcion.slice(11, 16)}`,
  estado: p.estado === 'ENTREGADO' ? 'Entregado' : 'Ha llegado',
  entregadoA: p.entregadoA,
})

export const TAMANO_A_API = { Sobre: 'SOBRE', 'Caja pequeña': 'PEQUENO', 'Paquete mediano': 'MEDIANO', 'Caja grande': 'GRANDE' }
