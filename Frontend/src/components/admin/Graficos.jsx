import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { cn } from '../../lib/utils'

// Gráficos del panel de administración.

// Curva suave que pasa por todos los puntos (Catmull-Rom → Bézier)
function curva(puntos) {
  return puntos.reduce((d, [x, y], i, arr) => {
    if (i === 0) return `M${x} ${y}`
    const [x0, y0] = arr[i - 2] ?? arr[i - 1]
    const [x1, y1] = arr[i - 1]
    const [x3, y3] = arr[i + 1] ?? [x, y]
    const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6]
    const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6]
    return `${d} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x} ${y}`
  }, '')
}

// Recaudo frente a lo facturado, mes a mes: la barra clara es lo facturado y la verde lo
// recaudado; arriba va el porcentaje recaudado. Al pasar el mouse se ve el detalle del mes.
export function GraficoRecaudo({ datos, formato, className }) {
  const [activo, setActivo] = useState(datos.length - 1)
  const max = Math.max(...datos.map((d) => d.facturado))
  const pct = (d) => Math.round((d.valor / d.facturado) * 100)
  const promedio = Math.round(datos.reduce((s, d) => s + pct(d), 0) / datos.length)
  const d = datos[activo]

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-600" /> Recaudado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-100 ring-1 ring-brand-200" /> Por recaudar
          </span>
        </div>
        {/* Detalle del mes activo */}
        <p className="text-xs text-slate-500" aria-live="polite">
          <span className="font-semibold text-slate-800">{d.mes}:</span> {formato(d.valor)} de {formato(d.facturado)} ·{' '}
          <span className="font-semibold text-warning-strong">faltan {formato(d.facturado - d.valor)}</span>
        </p>
      </div>

      <div className="relative mt-4 flex flex-1 items-end gap-3 border-b border-slate-200 sm:gap-5" onMouseLeave={() => setActivo(datos.length - 1)}>
        {datos.map((m, i) => (
          <button
            key={m.mes}
            type="button"
            onMouseEnter={() => setActivo(i)}
            onFocus={() => setActivo(i)}
            aria-label={`${m.mes}: recaudado ${formato(m.valor)} de ${formato(m.facturado)} (${pct(m)}%)`}
            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end outline-none"
          >
            <span className={cn('mb-1 text-xs font-bold tabular-nums transition-colors', i === activo ? 'text-brand-700' : 'text-slate-400')}>
              {pct(m)}%
            </span>
            <span
              className={cn(
                'relative flex w-full max-w-14 items-end overflow-hidden rounded-t-lg bg-brand-100 ring-1 ring-inset ring-brand-200/70 transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-brand-500',
                i === activo && 'shadow-[0_8px_20px_-10px_rgb(0_101_43/0.6)]',
              )}
              style={{ height: `${(m.facturado / max) * 100}%` }}
            >
              <motion.span
                className={cn('w-full rounded-t-md', i === activo ? 'bg-brand-600' : 'bg-brand-500')}
                initial={{ height: 0 }}
                animate={{ height: `${pct(m)}%` }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-3 sm:gap-5">
        {datos.map((m, i) => (
          <span key={m.mes} className={cn('flex-1 text-center text-[11px]', i === activo ? 'font-semibold text-slate-700' : 'text-slate-400')}>
            {m.mes}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Promedio de recaudo: <span className="font-semibold text-slate-700">{promedio}%</span>
      </p>
    </div>
  )
}

GraficoRecaudo.propTypes = {
  datos: PropTypes.arrayOf(
    PropTypes.shape({ mes: PropTypes.string.isRequired, facturado: PropTypes.number.isRequired, valor: PropTypes.number.isRequired }),
  ).isRequired,
  formato: PropTypes.func.isRequired,
  className: PropTypes.string,
}

// Anillo de progreso con el porcentaje al centro
export function Anillo({ valor, total, className, children }) {
  const r = 52
  const c = 2 * Math.PI * r
  const parte = total ? valor / total : 0
  return (
    <div className={cn('relative', className)}>
      <svg viewBox="0 0 128 128" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="64" cy="64" r={r} strokeWidth="12" className="fill-none stroke-slate-100" />
        <motion.circle
          cx="64"
          cy="64"
          r={r}
          strokeWidth="12"
          strokeLinecap="round"
          className="fill-none stroke-brand-600"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - parte) }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

Anillo.propTypes = {
  valor: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
}

// Línea mínima para tarjetas de indicadores
export function Sparkline({ valores, className }) {
  const max = Math.max(...valores)
  const min = Math.min(...valores)
  const puntos = valores.map((v, i) => [(i / (valores.length - 1)) * 100, 28 - ((v - min) / (max - min || 1)) * 24])
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={cn('h-8 w-full overflow-visible', className)} aria-hidden="true">
      <path d={curva(puntos)} fill="none" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="stroke-current" />
    </svg>
  )
}

Sparkline.propTypes = { valores: PropTypes.arrayOf(PropTypes.number).isRequired, className: PropTypes.string }
