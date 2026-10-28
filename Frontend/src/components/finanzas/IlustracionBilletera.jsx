import PropTypes from 'prop-types'

// Ilustración fija para la tarjeta de estado de cuenta: billetera con tarjeta,
// monedas apiladas y un recibo pagado. Pensada para ir sobre el verde de marca.

function Moneda({ x, y }) {
  return (
    <g>
      <ellipse cx={x} cy={y + 5} rx="20" ry="7" className="fill-yellow-500" />
      <rect x={x - 20} y={y} width="40" height="5" className="fill-yellow-500" />
      <ellipse cx={x} cy={y} rx="20" ry="7" className="fill-yellow-300" />
      <ellipse cx={x} cy={y} rx="13" ry="4" className="fill-none stroke-yellow-500/70" strokeWidth="1.5" />
    </g>
  )
}

Moneda.propTypes = { x: PropTypes.number.isRequired, y: PropTypes.number.isRequired }

export default function IlustracionBilletera({ className }) {
  return (
    <svg viewBox="0 0 240 170" className={className} aria-hidden="true">
      <circle cx="132" cy="88" r="74" className="fill-white/[0.07]" />
      <circle cx="132" cy="88" r="52" className="fill-white/[0.06]" />

      {/* Recibo pagado */}
      <g transform="rotate(-8 168 64)">
        <path d="M140 20 H196 V104 L189 99 L182 104 L175 99 L168 104 L161 99 L154 104 L147 99 L140 104 Z" className="fill-white" />
        <rect x="150" y="34" width="26" height="4" rx="2" className="fill-slate-300" />
        <rect x="150" y="44" width="36" height="3" rx="1.5" className="fill-slate-200" />
        <rect x="150" y="52" width="30" height="3" rx="1.5" className="fill-slate-200" />
        <rect x="150" y="60" width="34" height="3" rx="1.5" className="fill-slate-200" />
        <rect x="150" y="76" width="18" height="5" rx="2.5" className="fill-brand-200" />
        <circle cx="182" cy="80" r="9" className="fill-brand-600" />
        <path d="M178 80 l3 3 l5 -6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="fill-none stroke-white" />
      </g>

      {/* Billetera con tarjeta */}
      <rect x="72" y="58" width="68" height="44" rx="5" transform="rotate(-14 106 80)" className="fill-lime-300" />
      <rect x="74" y="66" width="64" height="7" transform="rotate(-14 106 80)" className="fill-brand-800/40" />
      <rect x="54" y="80" width="112" height="70" rx="12" className="fill-brand-900" />
      <rect x="54" y="80" width="112" height="16" rx="8" className="fill-brand-950/60" />
      <path d="M128 104 H170 V130 H128 A13 13 0 0 1 128 104 Z" className="fill-brand-950" />
      <circle cx="131" cy="117" r="5" className="fill-lime-300" />
      <path d="M66 138 H104" strokeWidth="3" strokeLinecap="round" className="stroke-white/15" />

      {/* Monedas */}
      <Moneda x={40} y={142} />
      <Moneda x={40} y={132} />
      <Moneda x={40} y={122} />
      <g>
        <ellipse cx="200" cy="146" rx="15" ry="5" className="fill-yellow-500" />
        <ellipse cx="200" cy="142" rx="15" ry="5" className="fill-yellow-300" />
      </g>

      {/* Destellos */}
      <path d="M28 92 l1.8 5 l5 1.8 l-5 1.8 l-1.8 5 l-1.8 -5 l-5 -1.8 l5 -1.8 Z" className="fill-yellow-200" />
      <path d="M214 108 l1.4 3.8 l3.8 1.4 l-3.8 1.4 l-1.4 3.8 l-1.4 -3.8 l-3.8 -1.4 l3.8 -1.4 Z" className="fill-white/70" />
    </svg>
  )
}

IlustracionBilletera.propTypes = { className: PropTypes.string }
