import { useId } from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Isotipo de ResiGest: tres torres con facetas en diagonal, puente en arco y portal.
const torres = [
  { clave: 'izq', puntos: '8,50 8,22 16,16 25,22 25,50' },
  { clave: 'der', puntos: '39,50 39,22 48,16 56,22 56,50' },
  { clave: 'centro', puntos: '21,50 21,13 32,5 43,13 43,50' },
]

export function Isotipo({ className }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true">
      <defs>
        {torres.map((t) => (
          <clipPath key={t.clave} id={`${uid}-${t.clave}`}>
            <polygon points={t.puntos} />
          </clipPath>
        ))}
      </defs>
      {torres.map((t) => (
        <g key={t.clave}>
          <g clipPath={`url(#${uid}-${t.clave})`}>
            <rect width="64" height="56" className="fill-brand-400" />
            <path d="M0 30 L64 6 L64 13 L0 37 Z" className="fill-lime-300" />
            <path d="M0 50 L64 26 L64 31 L0 55 Z" className="fill-brand-300" />
          </g>
          <polygon points={t.puntos} strokeWidth="2.6" strokeLinejoin="round" className="fill-none stroke-brand-800" />
        </g>
      ))}
      <path
        d="M10 37 Q32 27 54 37 L54 41 Q32 31 10 41 Z"
        strokeWidth="2"
        strokeLinejoin="round"
        className="fill-lime-200 stroke-brand-800"
      />
      <path d="M27.5 50 V45 A4.5 4.5 0 0 1 36.5 45 V50 Z" className="fill-brand-800" />
      <path d="M3 50.5 H61" strokeWidth="3" strokeLinecap="round" className="stroke-brand-800" />
    </svg>
  )
}

Isotipo.propTypes = { className: PropTypes.string }

export default function Logo({ className, subtitulo = true }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Isotipo className="h-9 w-10 shrink-0" />
      <div className="leading-none">
        <p className="text-[17px] font-black uppercase tracking-[0.06em] text-brand-800">ResiGest</p>
        {subtitulo && (
          <p className="mt-1 text-2xs font-semibold uppercase tracking-wider text-slate-400">Gestión residencial</p>
        )}
      </div>
    </div>
  )
}

Logo.propTypes = {
  className: PropTypes.string,
  subtitulo: PropTypes.bool,
}
