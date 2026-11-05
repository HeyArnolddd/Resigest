import { api } from './api'

// Tipos de evento de la agenda: etiqueta y color de la hoja del calendario
export const TIPOS_EVENTO = {
  ASAMBLEA: { label: 'Asamblea', cabeza: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700' },
  MANTENIMIENTO: { label: 'Mantenimiento', cabeza: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700' },
  TRAMITE: { label: 'Trámite', cabeza: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  EVENTO: { label: 'Evento', cabeza: 'bg-brand-600', chip: 'bg-brand-50 text-brand-700' },
}

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

// EventoDTO → datos para pintar la hoja del calendario
export function hojaEvento(e, hoy = new Date()) {
  const fecha = new Date(`${e.fecha}T00:00:00`)
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const dias = Math.round((fecha - inicioHoy) / 86_400_000)
  const hora = (h) => h?.slice(0, 5)
  return {
    mes: MESES_CORTOS[fecha.getMonth()],
    dia: fecha.getDate(),
    semana: DIAS_CORTOS[fecha.getDay()],
    faltan: dias <= 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`,
    horario: e.horaFin ? `${hora(e.horaInicio)} – ${hora(e.horaFin)}` : hora(e.horaInicio),
    tono: TIPOS_EVENTO[e.tipo] ?? TIPOS_EVENTO.EVENTO,
  }
}

export const agendaApi = {
  proximos: () => api('/eventos'),
  crear: (datos) => api('/eventos', { method: 'POST', body: datos }),
  eliminar: (id) => api(`/eventos/${id}`, { method: 'DELETE' }),
}
