import { api } from './api'

export { useCarga } from './useCarga'

// Llamadas del portal del administrador.
export const adminApi = {
  apartamentos: () => api('/apartamentos'),
  residentes: () => api('/usuarios', { params: { rol: 'RESIDENTE', activo: true, size: 1000 } }).then((p) => p.content),
  tecnicos: () => api('/usuarios', { params: { rol: 'MANTENIMIENTO', activo: true, size: 200 } }).then((p) => p.content),
  obligaciones: (params) => api('/obligaciones', { params }),
  generarObligaciones: (datos) => api('/obligaciones/generar', { method: 'POST', body: datos }),
  pagosPorValidar: () => api('/pagos/pendientes-validacion'),
  validarPago: (id, aprobar, motivo) => api(`/pagos/${id}/validacion`, { method: 'PATCH', body: { aprobar, motivo } }),
  zonas: () => api('/zonas-comunes'),
  reservas: (params) => api('/reservas', { params }),
  aprobarReserva: (id) => api(`/reservas/${id}/aprobar`, { method: 'PATCH' }),
  rechazarReserva: (id, justificacion) => api(`/reservas/${id}/rechazar`, { method: 'PATCH', body: { justificacion } }),
  incidencias: () => api('/incidencias', { params: { size: 200 } }).then((p) => p.content),
  asignarIncidencia: (id, tecnicoId) => api(`/incidencias/${id}/asignacion`, { method: 'PATCH', body: { tecnicoId } }),
  comunicados: () => api('/comunicados'),
  publicarComunicado: (datos) => api('/comunicados', { method: 'POST', body: datos }),
}

const numero = (v) => Number(v ?? 0)

// Facturado y recaudado por periodo, los últimos `meses` que tengan cobros.
export function recaudoPorPeriodo(obligaciones, meses = 6) {
  const porPeriodo = new Map()
  for (const o of obligaciones) {
    const p = porPeriodo.get(o.periodo) ?? { periodo: o.periodo, facturado: 0, valor: 0 }
    p.facturado += numero(o.montoTotal)
    p.valor += numero(o.montoTotal) - numero(o.saldoPendiente)
    porPeriodo.set(o.periodo, p)
  }
  return [...porPeriodo.values()].sort((a, b) => a.periodo.localeCompare(b.periodo)).slice(-meses)
}

// Un apartamento está en mora si tiene alguna obligación vencida con saldo.
export function cartera(obligaciones, totalApartamentos) {
  const enMora = new Set()
  let saldoMora = 0
  for (const o of obligaciones) {
    if (o.estado === 'VENCIDA' && numero(o.saldoPendiente) > 0) {
      enMora.add(o.apartamentoId)
      saldoMora += numero(o.saldoPendiente)
    }
  }
  return { apartamentos: totalApartamentos, enMora: enMora.size, alDia: totalApartamentos - enMora.size, saldoMora }
}

// Montos grandes en millones ("$4,8 M"); los pequeños completos
export const millones = (v) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`
    : `$${Math.round(v).toLocaleString('es-CO')}`
