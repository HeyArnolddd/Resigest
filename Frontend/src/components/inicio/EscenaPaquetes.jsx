import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Paquetes esperando en la portería: cajas apiladas en el mostrador y un sobre.
// Ilustración fija; se usa en la tarjeta "Te esperan en portería" del Inicio.

function Caja({ x, y, w, h, tono = 'claro', className, style }) {
  const cara = tono === 'claro' ? 'fill-amber-200' : 'fill-amber-300'
  const lado = tono === 'claro' ? 'fill-amber-300' : 'fill-amber-400'
  return (
    <g className={className} style={style}>
      <rect x={x} y={y} width={w} height={h} rx="3" className={cara} />
      <rect x={x} y={y} width={w} height={h * 0.22} rx="3" className={lado} />
      <rect x={x + w / 2 - 5} y={y} width="10" height={h} className="fill-amber-100/80" />
      <rect x={x + 8} y={y + h * 0.5} width={w * 0.3} height={h * 0.22} rx="1.5" className="fill-white/90" />
      <path d={`M${x + 10} ${y + h * 0.58} h${w * 0.18}`} strokeWidth="1.5" strokeLinecap="round" className="stroke-slate-400" />
    </g>
  )
}

Caja.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  w: PropTypes.number.isRequired,
  h: PropTypes.number.isRequired,
  tono: PropTypes.oneOf(['claro', 'oscuro']),
  className: PropTypes.string,
  style: PropTypes.object,
}

export default function EscenaPaquetes({ className }) {
  return (
    <svg viewBox="0 0 320 130" preserveAspectRatio="xMaxYMax meet" className={cn('ilus', className)} aria-hidden="true">
      {/* Fondo */}
      <circle cx="262" cy="34" r="40" className="fill-brand-100/70" />
      <circle cx="40" cy="22" r="4" className="fill-brand-200" />
      <circle cx="300" cy="96" r="3" className="fill-brand-300" />

      {/* Mostrador */}
      <rect x="20" y="108" width="280" height="10" rx="5" className="fill-brand-200" />
      <rect x="40" y="118" width="240" height="12" className="fill-brand-100" />

      {/* Cajas apiladas */}
      <Caja x={62} y={62} w={70} h={46} tono="oscuro" />
      <Caja x={74} y={30} w={48} h={32} />
      <Caja x={146} y={70} w={52} h={38} />

      {/* Sobre */}
      <g>
        <rect x="218" y="56" width="54" height="36" rx="4" className="fill-white" />
        <path d="M218 60 L245 78 L272 60" strokeWidth="2.5" strokeLinejoin="round" className="fill-none stroke-brand-300" />
        <circle cx="268" cy="58" r="9" className="fill-brand-600" />
        <path d="M264 58 l3 3 l5 -6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fill-none stroke-white" />
      </g>

      {/* Destellos */}
      <path d="M140 30 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 Z" className="fill-yellow-300" />
      <path d="M205 28 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" className="fill-yellow-300" />
    </svg>
  )
}

EscenaPaquetes.propTypes = {
  className: PropTypes.string,
}
