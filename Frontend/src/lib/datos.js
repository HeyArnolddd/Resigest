// Conversión de DTO del API a la forma que usan varias pantallas del residente.
import { formatFecha } from './utils'

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const DIBUJO_POR_TAMANO = {
  SOBRE: 'Sobre',
  PEQUENO: 'Caja pequeña',
  MEDIANO: 'Paquete mediano',
  GRANDE: 'Caja grande',
}

export const aVistaPaquete = (p) => ({
  id: `PAQ-${p.id}`,
  idApi: p.id,
  empresa: p.empresaTransportadora,
  guia: p.guia ?? `S/G-${p.id}`,
  descripcion: DIBUJO_POR_TAMANO[p.tamano] ?? p.descripcion,
  detalle: p.descripcion,
  apartamento: p.apartamento,
  fecha: formatFecha(p.fechaEntrega ?? p.fechaRecepcion),
  fechaRecepcion: p.fechaRecepcion,
  entregado: p.estado === 'ENTREGADO',
  estado: p.estado,
})

// 'Hoy · 10:04', 'Ayer' o '08/09/2026'
export function etiquetaFecha(iso, ahora = new Date()) {
  const fecha = new Date(iso)
  const dia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dias = Math.round((dia(ahora) - dia(fecha)) / 86400000)
  if (dias === 0) return `Hoy · ${iso.slice(11, 16)}`
  if (dias === 1) return 'Ayer'
  return formatFecha(iso)
}

export const aNotificacion = (n) => ({
  id: n.id,
  tipo: n.tipo.toLowerCase(),
  titulo: n.titulo,
  detalle: n.mensaje,
  fecha: etiquetaFecha(n.fechaEnvio),
  leida: n.leida,
})

// Resumen de cuotas de administración (las últimas seis) para el inicio.
export function aResumenCuotas(obligaciones) {
  return obligaciones
    .filter((o) => o.concepto === 'CUOTA_ADMINISTRACION')
    .sort((a, b) => a.periodo.localeCompare(b.periodo))
    .slice(-6)
    .reverse()
    .map((o) => {
      const [anio, mes] = o.periodo.split('-')
      return {
        id: `OB-${o.id}`,
        concepto: 'Cuota de administración',
        periodo: `${MESES_CORTOS[Number(mes) - 1]} ${anio}`,
        valor: o.montoTotal,
        vencimiento: formatFecha(o.fechaVencimiento),
        estado: o.estado === 'PAGADA' ? 'Pagada' : o.estado === 'EN_VERIFICACION' ? 'En verificación' : 'Pendiente',
      }
    })
}
