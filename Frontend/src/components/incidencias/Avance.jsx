import PropTypes from 'prop-types'
import { Check } from 'lucide-react'
import { PASOS } from '../../lib/incidencias'
import { cn } from '../../lib/utils'

// Avance de una incidencia en tres pasos (residente y mantenimiento).

export default function Avance({ estado }) {
  // Evaluada cuenta como resuelta; Reabierta vuelve a "En proceso"
  const actual = estado === 'Evaluada' ? 2 : estado === 'Reabierta' ? 1 : Math.max(PASOS.indexOf(estado), 0)
  return (
    <ol className="flex items-center" aria-label={`Avance: ${estado}`}>
      {PASOS.map((paso, i) => {
        const hecho = i < actual || (i === actual && actual === 2)
        return (
          <li key={paso} className="flex flex-1 items-center last:flex-none">
            <span className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-[11px] font-bold',
                  hecho && 'bg-brand-600 text-white',
                  i === actual && !hecho && 'bg-white text-brand-700 ring-2 ring-brand-500',
                  i > actual && 'bg-slate-100 text-slate-400',
                )}
              >
                {hecho ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('text-[11px] font-medium', i <= actual ? 'text-slate-700' : 'text-slate-400')}>{paso}</span>
            </span>
            {i < PASOS.length - 1 && (
              <span className={cn('mx-1.5 mb-4 h-0.5 flex-1 rounded-full', i < actual ? 'bg-brand-600' : 'bg-slate-200')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

Avance.propTypes = { estado: PropTypes.string.isRequired }
