import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Rincón del técnico para el Inicio de mantenimiento: caja de herramientas, casco,
// escalera y dos engranajes que giran despacio.

function Engranaje({ cx, cy, r, dientes, relleno, trazo, sentido = 1 }) {
  const d = Array.from({ length: dientes }, (_, i) => {
    const a = (i / dientes) * Math.PI * 2
    return `M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} L${cx + Math.cos(a) * (r + 6)} ${cy + Math.sin(a) * (r + 6)}`
  }).join(' ')
  return (
    <g className={cn('origin-center', sentido > 0 ? '[animation:ilus-girar_14s_linear_infinite]' : '[animation:ilus-girar_10s_linear_infinite_reverse]')}>
      <path d={d} strokeWidth="7" strokeLinecap="round" className={cn('fill-none', trazo)} />
      <circle cx={cx} cy={cy} r={r} className={relleno} />
      <circle cx={cx} cy={cy} r={r * 0.38} className="fill-white" />
    </g>
  )
}

Engranaje.propTypes = {
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  r: PropTypes.number.isRequired,
  dientes: PropTypes.number.isRequired,
  relleno: PropTypes.string.isRequired,
  trazo: PropTypes.string.isRequired,
  sentido: PropTypes.number,
}

export default function EscenaTaller({ className }) {
  return (
    <svg viewBox="0 0 360 170" preserveAspectRatio="xMidYMax meet" className={cn('ilus', className)} aria-hidden="true">
      <circle cx="200" cy="74" r="66" className="fill-brand-100/80" />
      <Engranaje cx={292} cy={48} r={20} dientes={10} relleno="fill-brand-300" trazo="stroke-brand-300" />
      <Engranaje cx={322} cy={78} r={13} dientes={8} relleno="fill-brand-200" trazo="stroke-brand-200" sentido={-1} />

      {/* Escalera */}
      <g className="stroke-amber-500" strokeWidth="5" strokeLinecap="round">
        <path d="M44 150 L70 34" />
        <path d="M96 150 L70 34" />
      </g>
      <g className="stroke-amber-400" strokeWidth="4" strokeLinecap="round">
        <path d="M52 118 H88" />
        <path d="M58 92 H82" />
        <path d="M63 66 H77" />
      </g>

      {/* Banco y caja de herramientas */}
      <rect x="128" y="118" width="180" height="10" rx="3" className="fill-[#b8935f]" />
      <rect x="138" y="128" width="8" height="22" className="fill-[#9c7a4c]" />
      <rect x="290" y="128" width="8" height="22" className="fill-[#9c7a4c]" />
      <rect x="150" y="84" width="84" height="34" rx="4" className="fill-brand-600" />
      <rect x="150" y="84" width="84" height="10" rx="4" className="fill-brand-700" />
      <path d="M176 84 V74 a4 4 0 0 1 4 -4 h24 a4 4 0 0 1 4 4 V84" strokeWidth="5" className="fill-none stroke-slate-600" />
      <rect x="186" y="98" width="12" height="8" rx="2" className="fill-amber-300" />
      {/* Llave y destornillador asomando */}
      <path d="M166 84 L160 60" strokeWidth="5" strokeLinecap="round" className="stroke-slate-400" />
      <circle cx="159" cy="57" r="6" className="fill-none stroke-slate-400" strokeWidth="4" />
      <path d="M220 84 L226 66" strokeWidth="3" strokeLinecap="round" className="stroke-slate-300" />

      {/* Casco */}
      <path d="M250 118 a22 18 0 0 1 44 0 Z" className="fill-amber-300" />
      <rect x="244" y="114" width="56" height="5" rx="2.5" className="fill-amber-400" />
      <rect x="269" y="100" width="6" height="14" rx="3" className="fill-amber-200" />

      {/* Suelo */}
      <rect x="0" y="150" width="360" height="20" className="fill-brand-200/70" />
    </svg>
  )
}

EscenaTaller.propTypes = { className: PropTypes.string }
