import { useId } from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Ciudad en capas para el banner de Inicio. De día: cielo verde claro, sol y nubes.
// De noche: cielo oscuro, luna, estrellas y ventanas encendidas.

const SUELO = 300

// [x, ancho, alto]
const lejanos = [
  [0, 60, 150], [52, 42, 190], [100, 70, 130], [176, 50, 214], [236, 78, 160], [328, 46, 236],
  [388, 72, 168], [466, 56, 204], [536, 88, 150], [636, 52, 224], [700, 70, 182], [762, 60, 146],
]
const medios = [
  [20, 70, 122], [108, 56, 164], [196, 80, 112], [300, 62, 178], [380, 90, 138], [498, 70, 192],
  [588, 62, 128], [676, 86, 166],
]
// [x, ancho, alto, techo a dos aguas]
const frente = [
  [0, 72, 96, false], [92, 62, 74, true], [244, 82, 84, false], [418, 66, 102, true],
  [556, 92, 78, true], [690, 78, 92, false],
]
// [x, tamaño, forma]
const arboles = [
  [76, 22, 'pino'], [170, 20, 'copa'], [206, 16, 'pino'], [340, 24, 'copa'], [374, 18, 'pino'],
  [500, 22, 'copa'], [528, 16, 'pino'], [664, 20, 'pino'], [780, 22, 'copa'],
]
const estrellas = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 197 + 31) % 800,
  y: 14 + ((i * 89) % 150),
  r: i % 5 === 0 ? 1.6 : 1,
}))

const azar = (a, b) => ((a * 73 + b * 151) % 97) / 97

function Ventanas({ x, y, ancho, alto, paso, tam, noche, semilla, densidad = 0.5 }) {
  const cols = Math.floor((ancho - 8) / paso)
  const filas = Math.floor((alto - 14) / paso)
  const margen = (ancho - (cols - 1) * paso - tam) / 2
  return Array.from({ length: filas }, (_, f) =>
    Array.from({ length: cols }, (_, c) => {
      const v = azar(semilla + f, c + f * 7)
      const encendida = noche && v > 1 - densidad
      return (
        <rect
          key={`${f}-${c}`}
          x={x + margen + c * paso}
          y={y + 10 + f * paso}
          width={tam}
          height={tam * 1.25}
          rx="0.8"
          className={cn(
            encendida
              ? 'fill-yellow-200 animate-[ilus-brillo_7s_ease-in-out_infinite]'
              : noche
                ? 'fill-brand-950/40'
                : 'fill-white/30',
          )}
          style={encendida ? { animationDelay: `${(v * 9).toFixed(1)}s`, animationDuration: `${6 + (v * 6).toFixed(0)}s` } : undefined}
        />
      )
    }),
  )
}

export default function CiudadBanner({ noche = false, className }) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 800 320"
      preserveAspectRatio="xMidYMax slice"
      className={cn('ilus', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-cielo`} x1="0" y1="0" x2="0" y2="1">
          {noche ? (
            <>
              <stop offset="0" style={{ stopColor: 'var(--color-brand-950)' }} />
              <stop offset="1" style={{ stopColor: 'var(--color-brand-800)' }} />
            </>
          ) : (
            <>
              <stop offset="0" style={{ stopColor: 'var(--color-brand-600)' }} />
              <stop offset="1" style={{ stopColor: 'var(--color-brand-400)' }} />
            </>
          )}
        </linearGradient>
      </defs>

      <rect width="800" height="320" fill={`url(#${uid}-cielo)`} />

      {/* Haces de luz diagonales y franjas */}
      <path d="M360 320 L640 0 L720 0 L440 320 Z" className={noche ? 'fill-white/[0.03]' : 'fill-white/[0.07]'} />
      <path d="M520 320 L800 40 L800 110 L590 320 Z" className={noche ? 'fill-white/[0.03]' : 'fill-white/[0.06]'} />
      {[
        [0, 96, 230], [0, 108, 150], [0, 120, 280], [560, 70, 240], [610, 84, 190], [520, 132, 280],
      ].map(([x, y, w]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height="5" rx="2.5" className={noche ? 'fill-white/[0.05]' : 'fill-white/10'} />
      ))}

      {noche ? (
        <>
          {estrellas.map((e, i) => (
            <circle
              key={i}
              cx={e.x}
              cy={e.y}
              r={e.r}
              className="fill-white animate-[ilus-brillo_3s_ease-in-out_infinite]"
              style={{ animationDelay: `${(i % 7) * 0.45}s` }}
            />
          ))}
          <circle cx="590" cy="58" r="34" className="fill-yellow-100/10" />
          <circle cx="590" cy="58" r="18" className="fill-yellow-50" />
          <circle cx="584" cy="54" r="3.5" className="fill-yellow-200/60" />
          <circle cx="595" cy="64" r="2.5" className="fill-yellow-200/60" />
        </>
      ) : (
        <>
          <circle cx="590" cy="62" r="46" className="origin-center fill-yellow-100/10 animate-[ilus-respirar_6s_ease-in-out_infinite]" />
          <circle
            cx="590"
            cy="62"
            r="34"
            className="origin-center fill-yellow-100/20 animate-[ilus-respirar_6s_ease-in-out_infinite]"
            style={{ animationDelay: '-3s' }}
          />
          <circle cx="590" cy="62" r="22" className="fill-yellow-200" />
          <g className="fill-white/30 animate-[ilus-nube_18s_ease-in-out_infinite_alternate]">
            <ellipse cx="470" cy="52" rx="34" ry="11" />
            <ellipse cx="454" cy="44" rx="17" ry="11" />
          </g>
          <g className="fill-white/25 animate-[ilus-nube_24s_ease-in-out_infinite_alternate]">
            <ellipse cx="200" cy="40" rx="28" ry="9" />
            <ellipse cx="190" cy="33" rx="14" ry="9" />
          </g>
        </>
      )}

      {/* Capa lejana */}
      <g className={noche ? 'fill-brand-800/80' : 'fill-brand-300/45'}>
        {lejanos.map(([x, w, h]) => (
          <rect key={x} x={x} y={SUELO - h} width={w} height={h} />
        ))}
        <path d={`M349 ${SUELO - 236} V${SUELO - 290}`} strokeWidth="3" className={noche ? 'stroke-brand-800' : 'stroke-brand-300/60'} />
      </g>

      {/* Capa media */}
      {medios.map(([x, w, h], i) => (
        <g key={x}>
          <rect x={x} y={SUELO - h} width={w} height={h} className={noche ? 'fill-brand-900' : 'fill-brand-500/80'} />
          <Ventanas x={x} y={SUELO - h} ancho={w} alto={h - 20} paso={9} tam={3} noche={noche} semilla={i * 13} densidad={0.35} />
        </g>
      ))}
      <path d={`M331 ${SUELO - 178} V${SUELO - 206}`} strokeWidth="2.5" className={noche ? 'stroke-brand-900' : 'stroke-brand-500'} />
      <circle
        cx="331"
        cy={SUELO - 208}
        r="3"
        className={noche ? 'fill-rose-400 animate-[ilus-brillo_1.6s_ease-in-out_infinite]' : 'fill-brand-500'}
      />

      {/* Edificios residenciales al frente */}
      {frente.map(([x, w, h, techo], i) => (
        <g key={x}>
          {techo && (
            <path
              d={`M${x - 4} ${SUELO - h} L${x + w / 2} ${SUELO - h - 22} L${x + w + 4} ${SUELO - h} Z`}
              className={noche ? 'fill-brand-950' : 'fill-brand-700'}
            />
          )}
          <rect x={x} y={SUELO - h} width={w} height={h} className={noche ? 'fill-brand-950' : 'fill-brand-700'} />
          <Ventanas x={x} y={SUELO - h} ancho={w} alto={h - 18} paso={14} tam={7} noche={noche} semilla={i * 29 + 5} densidad={0.6} />
          <rect x={x + w / 2 - 6} y={SUELO - 16} width="12" height="16" rx="1.5" className={noche ? 'fill-yellow-200/50' : 'fill-brand-900/50'} />
        </g>
      ))}

      {/* Árboles */}
      {arboles.map(([x, t, forma], i) => (
        <g
          key={x}
          className="origin-bottom animate-[ilus-pendulo_5s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.6}s` }}
        >
          <rect x={x - 1.5} y={SUELO - t * 0.5} width="3" height={t * 0.5} className={noche ? 'fill-brand-950' : 'fill-brand-800'} />
          {forma === 'pino' ? (
            <path
              d={`M${x} ${SUELO - t * 2.2} C${x + t * 0.55} ${SUELO - t * 1.2} ${x + t * 0.5} ${SUELO - t * 0.4} ${x} ${SUELO - t * 0.4} C${x - t * 0.5} ${SUELO - t * 0.4} ${x - t * 0.55} ${SUELO - t * 1.2} ${x} ${SUELO - t * 2.2} Z`}
              className={noche ? 'fill-brand-900' : 'fill-brand-800'}
            />
          ) : (
            <circle cx={x} cy={SUELO - t * 1.1} r={t * 0.7} className={noche ? 'fill-brand-900' : 'fill-brand-800'} />
          )}
        </g>
      ))}

      {/* Suelo */}
      <rect y={SUELO} width="800" height="20" className={noche ? 'fill-brand-950' : 'fill-brand-800'} />
    </svg>
  )
}

CiudadBanner.propTypes = {
  noche: PropTypes.bool,
  className: PropTypes.string,
}
