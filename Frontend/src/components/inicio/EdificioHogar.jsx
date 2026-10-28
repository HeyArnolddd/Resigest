import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Torre del residente para el banner de Inicio: su ventana se ilumina y late.
// Pensada para ir sobre el fondo verde de marca.

const PISOS = 5
const COLUMNAS = 3
const MI_PISO = 3 // contado desde abajo
const MI_COLUMNA = 1

export default function EdificioHogar({ className }) {
  const x0 = 150
  const ancho = 104
  const altoPiso = 26
  const suelo = 168
  const top = suelo - PISOS * altoPiso - 14

  const ventana = (piso, col) => ({
    x: x0 + 14 + col * 28,
    y: suelo - 14 - piso * altoPiso,
  })
  const mia = ventana(MI_PISO, MI_COLUMNA)

  return (
    <svg viewBox="0 0 300 180" className={cn('ilus', className)} aria-hidden="true">
      {/* Nubes */}
      <g className="fill-white/20 animate-[ilus-nube_16s_ease-in-out_infinite_alternate]">
        <ellipse cx="60" cy="38" rx="26" ry="9" />
        <ellipse cx="48" cy="32" rx="13" ry="9" />
      </g>
      <g className="fill-white/15 animate-[ilus-nube_22s_ease-in-out_infinite_alternate]">
        <ellipse cx="270" cy="26" rx="20" ry="7" />
        <ellipse cx="262" cy="21" rx="10" ry="7" />
      </g>

      {/* Torre del fondo */}
      <rect x="84" y="62" width="70" height="106" rx="4" className="fill-white/10" />
      {[0, 1, 2, 3].map((f) =>
        [0, 1].map((c) => (
          <rect key={`b${f}${c}`} x={96 + c * 26} y={76 + f * 22} width="12" height="12" rx="2" className="fill-white/15" />
        )),
      )}

      {/* Torre del residente */}
      <path d={`M${x0 - 6} ${top} L${x0 + ancho / 2} ${top - 22} L${x0 + ancho + 6} ${top} Z`} className="fill-brand-300" />
      <rect x={x0} y={top} width={ancho} height={suelo - top} rx="4" className="fill-white/25" />
      {Array.from({ length: PISOS }, (_, f) =>
        Array.from({ length: COLUMNAS }, (_, c) => {
          // Sin ventana sobre la puerta ni en la del residente (se dibuja aparte)
          if ((f === 0 && c === 1) || (f === MI_PISO && c === MI_COLUMNA)) return null
          const { x, y } = ventana(f, c)
          const encendida = (f * 3 + c * 5) % 4 === 0
          return (
            <rect
              key={`${f}${c}`}
              x={x}
              y={y - 16}
              width="16"
              height="16"
              rx="2"
              className={encendida ? 'fill-yellow-100/80 animate-[ilus-brillo_6s_ease-in-out_infinite]' : 'fill-brand-900/25'}
              style={encendida ? { animationDelay: `${f + c}s` } : undefined}
            />
          )
        }),
      )}
      <rect x={x0 + ancho / 2 - 9} y={suelo - 20} width="18" height="20" rx="2" className="fill-brand-900/40" />

      {/* Tu apartamento */}
      <circle
        cx={mia.x + 8}
        cy={mia.y - 8}
        r="14"
        className="fill-yellow-200/40 animate-[ilus-pulso_2.4s_ease-out_infinite]"
      />
      <rect x={mia.x} y={mia.y - 16} width="16" height="16" rx="2" className="fill-yellow-200" />

      {/* Árbol */}
      <g className="origin-bottom animate-[ilus-pendulo_4s_ease-in-out_infinite]">
        <rect x="270" y="140" width="5" height="28" rx="2" className="fill-brand-900/50" />
        <circle cx="272" cy="134" r="16" className="fill-brand-300" />
        <circle cx="267" cy="129" r="7" className="fill-brand-200/70" />
      </g>

      {/* Suelo */}
      <path d="M0 168 C80 162 200 172 300 164 V180 H0 Z" className="fill-brand-800/50" />
    </svg>
  )
}

EdificioHogar.propTypes = {
  className: PropTypes.string,
}
