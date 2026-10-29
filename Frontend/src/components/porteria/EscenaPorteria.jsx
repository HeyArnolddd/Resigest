import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Caseta de portería con la talanquera que sube y baja, la baliza encendida y un carro
// esperando. Las torres del conjunto quedan al fondo. Se usa en el Inicio de portería.

export default function EscenaPorteria({ className }) {
  return (
    <svg viewBox="0 0 360 170" preserveAspectRatio="xMidYMax meet" className={cn('ilus', className)} aria-hidden="true">
      {/* Fondo: halo y torres */}
      <circle cx="250" cy="70" r="64" className="fill-brand-100/80" />
      <g className="fill-brand-200/80">
        <rect x="196" y="40" width="34" height="110" rx="3" />
        <rect x="236" y="22" width="40" height="128" rx="3" />
        <rect x="282" y="52" width="32" height="98" rx="3" />
      </g>
      <g className="fill-white/70">
        {[0, 1, 2, 3, 4, 5].map((f) =>
          [0, 1, 2].map((c) => <rect key={`${f}-${c}`} x={243 + c * 10} y={34 + f * 16} width="6" height="8" rx="1" />),
        )}
      </g>

      {/* Reja */}
      <g className="stroke-brand-300" strokeWidth="2.5" strokeLinecap="round">
        <path d="M10 150 H118" />
        <path d="M10 116 H118" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M${16 + i * 11} 112 V150`} />
        ))}
      </g>

      {/* Caseta */}
      <rect x="44" y="70" width="80" height="80" rx="4" className="fill-white" />
      <rect x="38" y="60" width="92" height="14" rx="4" className="fill-brand-700" />
      <rect x="54" y="84" width="60" height="34" rx="3" className="fill-sky-100" />
      {/* Portero */}
      <circle cx="78" cy="100" r="7" className="fill-amber-200" />
      <path d="M70 96 h16 l-2 -5 h-12 z" className="fill-brand-800" />
      <path d="M66 118 C66 108 90 108 90 118 Z" className="fill-brand-600" />
      <rect x="96" y="104" width="12" height="9" rx="1.5" className="fill-slate-700" />
      <rect x="54" y="116" width="60" height="4" className="fill-brand-200" />
      <rect x="62" y="126" width="44" height="10" rx="2" className="fill-brand-50" />
      <text x="84" y="133.5" textAnchor="middle" className="fill-brand-700 text-[7px] font-bold tracking-wider">PORTERÍA</text>
      {/* Baliza */}
      <rect x="80" y="52" width="8" height="8" rx="2" className="fill-slate-300" />
      <circle cx="84" cy="51" r="5" className="fill-amber-400 [animation:ilus-brillo_1.4s_ease-in-out_infinite]" />

      {/* Talanquera */}
      <rect x="134" y="112" width="10" height="38" rx="2" className="fill-slate-600" />
      <g className="origin-left [animation:porteria-talanquera_7s_ease-in-out_infinite]">
        <rect x="140" y="112" width="96" height="7" rx="3.5" className="fill-white stroke-slate-300" strokeWidth="1" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={150 + i * 18} y="112" width="9" height="7" className="fill-red-400" />
        ))}
      </g>
      <circle cx="139" cy="115.5" r="4" className="fill-slate-700" />

      {/* Carro esperando */}
      <g>
        <path d="M262 132 l10 -16 h40 l12 16 z" className="fill-sky-200" />
        <rect x="252" y="130" width="84" height="16" rx="6" className="fill-sky-500" />
        <rect x="256" y="134" width="8" height="5" rx="2" className="fill-amber-200" />
        <circle cx="272" cy="147" r="7" className="fill-slate-700" />
        <circle cx="318" cy="147" r="7" className="fill-slate-700" />
        <circle cx="272" cy="147" r="2.5" className="fill-slate-300" />
        <circle cx="318" cy="147" r="2.5" className="fill-slate-300" />
      </g>

      {/* Suelo */}
      <rect x="0" y="150" width="360" height="20" className="fill-brand-200/70" />
      <path d="M150 160 h24 M196 160 h24 M242 160 h24 M288 160 h24" strokeWidth="2" strokeLinecap="round" className="stroke-white/80" />
    </svg>
  )
}

EscenaPorteria.propTypes = { className: PropTypes.string }
