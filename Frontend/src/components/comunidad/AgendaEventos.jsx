import PropTypes from 'prop-types'
import { Clock, MapPin, Trash2 } from 'lucide-react'
import { hojaEvento } from '../../lib/agenda'
import { cn } from '../../lib/utils'

// Lista de eventos como hojas de calendario. Con `onEliminar` muestra el botón para borrarlos (administración).
export default function AgendaEventos({ eventos, onEliminar, ocupado }) {
  return (
    <ol className="relative space-y-3 before:absolute before:bottom-6 before:left-[25px] before:top-6 before:w-px before:bg-slate-200">
      {eventos.map((e, i) => {
        const h = hojaEvento(e)
        return (
          <li key={e.id} className="relative flex gap-3.5">
            {/* Hoja de calendario */}
            <span className="z-10 flex w-[52px] shrink-0 flex-col self-start overflow-hidden rounded-lg bg-white text-center shadow-sm ring-1 ring-slate-200">
              <span className={cn('py-0.5 text-[10px] font-bold uppercase tracking-wide text-white', h.tono.cabeza)}>{h.mes}</span>
              <span className="pt-0.5 text-lg font-extrabold leading-tight text-slate-900 tabular-nums">{h.dia}</span>
              <span className="pb-1 text-[10px] font-medium capitalize text-slate-400">{h.semana}</span>
            </span>
            <div className={cn('min-w-0 flex-1 rounded-xl px-3 py-2', i === 0 && 'bg-brand-50/60 ring-1 ring-brand-100')}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug text-slate-800">{e.titulo}</p>
                <span className={cn('shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold', h.tono.chip)}>{h.faltan}</span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" /> {h.horario}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {e.lugar}
                </span>
                <span className="text-[11px] font-medium text-slate-400">{h.tono.label}</span>
              </p>
              {e.descripcion && <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-600">{e.descripcion}</p>}
              {onEliminar && (
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => onEliminar(e)}
                  className="mt-2 inline-flex items-center gap-1 rounded-md text-[11px] font-semibold text-slate-400 outline-none hover:text-danger-strong focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" /> Quitar de la agenda
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

AgendaEventos.propTypes = { eventos: PropTypes.array.isRequired, onEliminar: PropTypes.func, ocupado: PropTypes.bool }
