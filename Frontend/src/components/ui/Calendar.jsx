import { useState } from 'react'
import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { IconButton } from './Button'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const RESERVA_VISIBLE = 2

const estadoClases = {
  Aprobada: 'bg-success-bg text-success',
  'Ha llegado': 'bg-success-bg text-success',
  Pendiente: 'bg-warning-bg text-warning',
  Rechazada: 'bg-danger-bg text-danger',
  default: 'bg-slate-100 text-slate-600',
}

function keyDeFecha(date) {
  const dia = String(date.getDate()).padStart(2, '0')
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${date.getFullYear()}`
}

function inicioDeSemana(date) {
  const d = new Date(date)
  const offset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - offset)
  return d
}

function leyendaItem({ color, label }) {
  return (
    <span key={label} className="flex items-center gap-2 text-xs text-slate-500">
      <span className={cn('h-2 w-2 rounded-full', color)} />
      {label}
    </span>
  )
}

export default function Calendar({ reservas = [], selected, onSelect, className }) {
  const hoy = new Date()
  const hoyKey = keyDeFecha(hoy)
  const [mes, setMes] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1))

  const porDia = {}
  for (const r of reservas) {
    const key = r.fecha
    if (!porDia[key]) porDia[key] = []
    porDia[key].push(r)
  }

  const anio = mes.getFullYear()
  const mesAct = mes.getMonth()
  const inicio = inicioDeSemana(new Date(anio, mesAct, 1))
  const fin = inicioDeSemana(new Date(anio, mesAct + 1, 0))
  fin.setDate(fin.getDate() + 7)
  const totalDias = Math.round((fin - inicio) / 86400000)
  const dias = Array.from({ length: totalDias }, (_, i) =>
    new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i),
  )

  const cambiarMes = (delta) => setMes(new Date(anio, mesAct + delta, 1))

  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900">
          {MESES[mesAct]} {anio}
        </p>
        <div className="flex gap-1">
          <IconButton icon={ChevronLeft} label="Mes anterior" onClick={() => cambiarMes(-1)} />
          <IconButton icon={ChevronRight} label="Mes siguiente" onClick={() => cambiarMes(1)} />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS.map((d) => (
          <span key={d} className="pb-1 text-2xs font-semibold uppercase tracking-wide text-slate-400">
            {d}
          </span>
        ))}

        {dias.map((d) => {
          const key = keyDeFecha(d)
          const fuera = d.getMonth() !== mesAct
          const esHoy = key === hoyKey
          const esSel = selected === key
          const ocupadas = porDia[key] ?? []
          const esPasado = d < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect?.(key)}
              className={cn(
                'flex h-16 flex-col items-center gap-0.5 rounded-lg p-1 text-xs transition-colors lg:h-20',
                fuera && 'opacity-50',
                !fuera && 'hover:bg-slate-100',
                esPasado && !esHoy && 'opacity-60',
                esSel && 'bg-brand-50 ring-2 ring-brand-300 hover:bg-brand-50',
              )}
            >
              <span
                className={cn(
                  'font-semibold',
                  esSel ? 'text-brand-700' : esHoy ? 'text-brand-600' : 'text-slate-700',
                  esPasado && !esHoy && 'text-slate-400',
                  fuera && 'text-slate-400',
                )}
              >
                {d.getDate()}
              </span>

              {ocupadas.slice(0, RESERVA_VISIBLE).map((r) => (
                <span
                  key={r.id}
                  title={`${r.zona} · ${r.horario} · ${r.estado}`}
                  className={cn(
                    'w-full truncate rounded px-1 py-0.5 text-2xs font-semibold leading-tight',
                    estadoClases[r.estado] ?? estadoClases.default,
                  )}
                >
                  {r.zona}
                </span>
              ))}
              {ocupadas.length > RESERVA_VISIBLE && (
                <span className="text-2xs font-medium text-slate-400">
                  +{ocupadas.length - RESERVA_VISIBLE}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {[
          { color: 'bg-success', label: 'Aprobada' },
          { color: 'bg-warning', label: 'Pendiente' },
          { color: 'bg-danger', label: 'Rechazada' },
        ].map(leyendaItem)}
        <span className="ml-auto hidden text-xs text-slate-400 sm:inline">
          Toca un día para ver sus reservas
        </span>
      </div>
    </div>
  )
}

Calendar.propTypes = {
  reservas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      zona: PropTypes.string.isRequired,
      fecha: PropTypes.string.isRequired,
      horario: PropTypes.string,
      estado: PropTypes.string,
    }),
  ),
  selected: PropTypes.string,
  onSelect: PropTypes.func,
  className: PropTypes.string,
}