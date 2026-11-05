// Conversión del API a la forma que usan las pantallas del administrador.
import { formatFecha } from './utils'

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Pago por transferencia pendiente de validar.
export const aPagoManual = (p) => ({
  id: p.id,
  residente: p.apartamento,
  apartamento: p.apartamento,
  valor: p.monto,
  fecha: formatFecha(p.fecha),
  banco: 'Transferencia',
  numeroConsignacion: p.referencia ?? '—',
  estado: p.estado === 'EN_VERIFICACION' ? 'Pendiente revisión' : p.estado === 'APROBADO' ? 'Aprobada' : 'Rechazada',
  concepto: `${p.concepto === 'CUOTA_ADMINISTRACION' ? 'Cuota de administración' : p.concepto} · ${p.periodo}`,
  comprobante: p.urlComprobanteAdjunto,
  motivoRechazo: p.motivoRechazo,
})

// Recaudo mensual en millones, con la etiqueta corta del mes.
export const aRecaudoMensual = (meses) =>
  meses.map((m) => ({
    mes: MESES_CORTOS[Number(m.periodo.split('-')[1]) - 1],
    facturado: m.facturado / 1e6,
    valor: m.recaudado / 1e6,
  }))

export const aCartera = (c) => ({
  apartamentos: c.apartamentos,
  alDia: c.alDia,
  enMora: c.enMora,
  saldoMora: c.saldoEnMora,
})
