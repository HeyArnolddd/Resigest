import { Check, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/utils'

const pasos = ['Nueva', 'En proceso', 'Resuelta']

export default function FlujoEstado({ estado }) {
  const actual = pasos.indexOf(estado) === -1 ? 0 : pasos.indexOf(estado)

  return (
    <div className="flex items-center">
      {pasos.map((p, i) => {
        const completado = i < actual
        const activo = i === actual
        return (
          <div key={p} className={cn('flex items-center', i > 0 && 'flex-1')}>
            {i > 0 && (
              <div
                className={cn(
                  'mx-1 h-0.5 flex-1 rounded-full',
                  i <= actual ? 'bg-brand-500' : 'bg-slate-200',
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  completado && 'bg-brand-600 text-white',
                  activo && 'bg-brand-50 text-brand-700 ring-2 ring-brand-300',
                  !completado && !activo && 'bg-slate-100 text-slate-400',
                )}
              >
                {completado ? <Check className="h-4 w-4" strokeWidth={2.5} /> : activo ? <TriangleAlert className="h-4 w-4" strokeWidth={2} /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold',
                  activo ? 'text-brand-700' : completado ? 'text-slate-600' : 'text-slate-400',
                )}
              >
                {p}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}