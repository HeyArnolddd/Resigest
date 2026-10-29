import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Dibujo del paquete según su descripción: sobre, caja pequeña, paquete mediano o caja grande.
// Mismas cajas de cartón que la escena de portería del Inicio.

const escalas = { 'Caja pequeña': 0.7, 'Paquete mediano': 0.85, 'Caja grande': 1 }

function Caja({ escala }) {
  const w = 100 * escala
  const h = 76 * escala
  const x = 60 - w / 2
  const y = 92 - h
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" className="fill-amber-200" />
      <rect x={x} y={y} width={w} height={h * 0.24} rx="4" className="fill-amber-300" />
      <rect x={60 - 6} y={y} width="12" height={h} className="fill-amber-100/80" />
      <rect x={x + 7} y={y + h * 0.48} width={w * 0.3} height={h * 0.24} rx="2" className="fill-white/90" />
      <path d={`M${x + 10} ${y + h * 0.57} h${w * 0.18}`} strokeWidth="1.6" strokeLinecap="round" className="stroke-slate-400" />
    </g>
  )
}

Caja.propTypes = { escala: PropTypes.number.isRequired }

function Sobre() {
  return (
    <g>
      <rect x="12" y="34" width="96" height="56" rx="4" className="fill-white stroke-slate-200" strokeWidth="1.5" />
      <path d="M13 36 L60 68 L107 36" strokeWidth="2" strokeLinejoin="round" className="fill-sky-50 stroke-slate-200" />
      <rect x="86" y="44" width="16" height="12" rx="1.5" className="fill-brand-200" />
    </g>
  )
}

export default function IlustracionPaquete({ descripcion, className }) {
  return (
    <svg viewBox="0 0 120 104" className={cn('ilus', className)} aria-hidden="true">
      <ellipse cx="60" cy="93" rx="50" ry="5" className="fill-slate-900/10" />
      {descripcion === 'Sobre' ? <Sobre /> : <Caja escala={escalas[descripcion] ?? 0.8} />}
    </svg>
  )
}

IlustracionPaquete.propTypes = { descripcion: PropTypes.string, className: PropTypes.string }
