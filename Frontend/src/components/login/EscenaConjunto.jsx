import { useId } from 'react'
import { motion } from 'motion/react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Conjunto residencial animado que enmarca el login: torres a los lados,
// ventanas que se encienden, árboles que se mecen y nubes que pasan.
// El centro queda libre para el formulario.

const SUELO = 830

const torres = [
  // Izquierda
  { x: 30, w: 160, alto: 560, relleno: 'atras', antena: true },
  { x: 180, w: 136, alto: 430, relleno: 'frente' },
  { x: 318, w: 112, alto: 250, relleno: 'frente', techo: true },
  // Derecha
  { x: 1236, w: 176, alto: 610, relleno: 'atras', antena: true },
  { x: 1110, w: 140, alto: 400, relleno: 'frente' },
  { x: 1000, w: 104, alto: 230, relleno: 'frente', techo: true },
]

const arboles = [
  { x: 446, r: 30, delay: '0s' },
  { x: 488, r: 22, delay: '0.8s' },
  { x: 976, r: 26, delay: '0.4s' },
  { x: 152, r: 24, delay: '1.2s' },
  { x: 1418, r: 22, delay: '0.6s' },
]

// Pseudoaleatorio estable para decidir qué ventanas están encendidas
const azar = (a, b) => ((a * 73 + b * 151) % 97) / 97

function Torre({ x, w, alto, relleno, antena, techo, indice, uid }) {
  const top = SUELO - alto
  const columnas = Math.floor((w - 24) / 28)
  const filas = Math.floor((alto - 56) / 38)
  const margen = (w - columnas * 28 + 14) / 2

  return (
    <motion.g
      initial={{ y: alto + 80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.15 + indice * 0.09, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {techo && <path d={`M${x - 8} ${top} L${x + w / 2} ${top - 46} L${x + w + 8} ${top} Z`} className="fill-brand-300" />}
      <rect x={x} y={top} width={w} height={alto} rx="6" fill={`url(#${uid}-${relleno})`} />
      {antena && (
        <>
          <line x1={x + w / 2} y1={top} x2={x + w / 2} y2={top - 54} strokeWidth="4" className="stroke-brand-300" />
          <circle
            cx={x + w / 2}
            cy={top - 58}
            r="6"
            className="fill-rose-400 animate-[ilus-brillo_1.6s_ease-in-out_infinite]"
          />
        </>
      )}
      {Array.from({ length: filas }, (_, f) =>
        Array.from({ length: columnas }, (_, c) => {
          const v = azar(indice * 31 + f, c + f * 7)
          const encendida = v > 0.55
          return (
            <rect
              key={`${f}-${c}`}
              x={x + margen + c * 28}
              y={top + 30 + f * 38}
              width="14"
              height="20"
              rx="2"
              className={cn(
                encendida
                  ? 'fill-yellow-100 animate-[ilus-brillo_5s_ease-in-out_infinite]'
                  : 'fill-brand-700/45',
              )}
              style={encendida ? { animationDelay: `${(v * 9).toFixed(2)}s` } : undefined}
            />
          )
        }),
      )}
      <rect x={x + w / 2 - 14} y={SUELO - 36} width="28" height="36" rx="3" className="fill-brand-800/60" />
    </motion.g>
  )
}

Torre.propTypes = {
  x: PropTypes.number.isRequired,
  w: PropTypes.number.isRequired,
  alto: PropTypes.number.isRequired,
  relleno: PropTypes.string.isRequired,
  antena: PropTypes.bool,
  techo: PropTypes.bool,
  indice: PropTypes.number.isRequired,
  uid: PropTypes.string.isRequired,
}

function Arbol({ x, r, delay }) {
  return (
    <g className="origin-bottom animate-[ilus-pendulo_4s_ease-in-out_infinite]" style={{ animationDelay: delay }}>
      <rect x={x - 4} y={SUELO - r * 1.6} width="8" height={r * 1.6} rx="3" className="fill-brand-900/70" />
      <circle cx={x} cy={SUELO - r * 1.9} r={r} className="fill-brand-300" />
      <circle cx={x - r * 0.35} cy={SUELO - r * 2.1} r={r * 0.45} className="fill-brand-200/70" />
    </g>
  )
}

Arbol.propTypes = {
  x: PropTypes.number.isRequired,
  r: PropTypes.number.isRequired,
  delay: PropTypes.string,
}

function Nube({ x, y, escala = 1, duracion }) {
  return (
    <g
      className="fill-white/15 animate-[ilus-nube_ease-in-out_infinite_alternate]"
      style={{ animationDuration: duracion }}
    >
      <g transform={`translate(${x} ${y}) scale(${escala})`}>
        <ellipse cx="0" cy="0" rx="70" ry="24" />
        <ellipse cx="-34" cy="-12" rx="34" ry="24" />
        <ellipse cx="26" cy="-18" rx="30" ry="22" />
      </g>
    </g>
  )
}

Nube.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  escala: PropTypes.number,
  duracion: PropTypes.string.isRequired,
}

// ajuste 'cubrir' recorta a los lados (escritorio); 'completa' muestra todo el conjunto (móvil)
export default function EscenaConjunto({ ajuste = 'cubrir', className }) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio={ajuste === 'cubrir' ? 'xMidYMax slice' : 'xMidYMax meet'}
      className={cn('ilus pointer-events-none', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-atras`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--color-brand-400)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-brand-600)' }} />
        </linearGradient>
        <linearGradient id={`${uid}-frente`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--color-brand-300)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-brand-500)' }} />
        </linearGradient>
        <linearGradient id={`${uid}-colina`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--color-brand-500)' }} />
          <stop offset="1" style={{ stopColor: 'var(--color-brand-700)' }} />
        </linearGradient>
      </defs>

      {/* Formas orgánicas de fondo, como en la referencia */}
      <path
        d="M-60 -40 C120 -20 260 60 250 180 C240 300 90 300 40 400 C0 480 -60 470 -60 470 Z"
        className="fill-brand-500/35 animate-[ilus-flotar_9s_ease-in-out_infinite]"
      />
      <path
        d="M1500 -40 C1300 -10 1180 80 1210 190 C1240 300 1380 290 1420 380 C1450 450 1500 440 1500 440 Z"
        className="fill-brand-500/35 animate-[ilus-flotar_11s_ease-in-out_infinite]"
        style={{ animationDelay: '1.5s' }}
      />
      <circle cx="300" cy="120" r="14" className="fill-brand-300/40 animate-[ilus-flotar_6s_ease-in-out_infinite]" />
      <circle cx="1150" cy="300" r="10" className="fill-brand-300/40 animate-[ilus-flotar_7s_ease-in-out_infinite]" />

      <Nube x={360} y={170} duracion="14s" />
      <Nube x={1080} y={120} escala={0.8} duracion="18s" />

      {torres.map((t, i) => (
        <Torre key={t.x} {...t} indice={i} uid={uid} />
      ))}

      <path
        d={`M0 ${SUELO} C240 ${SUELO - 26} 480 ${SUELO + 10} 720 ${SUELO - 6} C960 ${SUELO - 22} 1200 ${SUELO + 6} 1440 ${SUELO - 14} V900 H0 Z`}
        fill={`url(#${uid}-colina)`}
      />

      {arboles.map((a) => (
        <Arbol key={a.x} {...a} />
      ))}

      <path
        d={`M0 ${SUELO + 30} C300 ${SUELO + 10} 560 ${SUELO + 46} 860 ${SUELO + 26} C1100 ${SUELO + 12} 1300 ${SUELO + 34} 1440 ${SUELO + 24} V900 H0 Z`}
        className="fill-brand-800/60"
      />
    </svg>
  )
}

EscenaConjunto.propTypes = {
  ajuste: PropTypes.oneOf(['cubrir', 'completa']),
  className: PropTypes.string,
}
