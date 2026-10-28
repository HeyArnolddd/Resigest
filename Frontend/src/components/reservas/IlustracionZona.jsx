import { useId } from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Escenas animadas por zona común. Las animaciones (ilus-*) viven en index.css
// y se apagan solas con prefers-reduced-motion.

// Ola repetible: ancho de sobra para desplazarla en bucle
function ola(y, amp, periodo = 40, ancho = 320) {
  let d = `M0 ${y} Q${periodo / 4} ${y - amp} ${periodo / 2} ${y}`
  for (let x = periodo; x <= ancho; x += periodo / 2) d += ` T${x} ${y}`
  return `${d} L${ancho} 150 L0 150 Z`
}

// Rayos de sol alrededor de (cx, cy)
function Rayos({ cx, cy, r1, r2, className }) {
  return (
    <g className={cn('origin-center animate-[ilus-girar_20s_linear_infinite]', className)}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return (
          <line
            key={i}
            x1={cx + r1 * Math.cos(a)}
            y1={cy + r1 * Math.sin(a)}
            x2={cx + r2 * Math.cos(a)}
            y2={cy + r2 * Math.sin(a)}
            strokeWidth="3"
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}

Rayos.propTypes = {
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  r1: PropTypes.number.isRequired,
  r2: PropTypes.number.isRequired,
  className: PropTypes.string,
}

function Destello({ x, y, s = 4, delay = '0s', className = 'fill-white' }) {
  return (
    <path
      d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} Z`}
      className={cn(className, 'animate-[ilus-brillo_1.8s_ease-in-out_infinite]')}
      style={{ animationDelay: delay }}
    />
  )
}

Destello.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  s: PropTypes.number,
  delay: PropTypes.string,
  className: PropTypes.string,
}

function Piscina({ uid }) {
  return (
    <>
      <rect width="240" height="150" className="fill-sky-50" />
      <Rayos cx={198} cy={32} r1={19} r2={26} className="stroke-amber-300" />
      <circle cx="198" cy="32" r="13" className="fill-amber-300" />
      <rect y="70" width="240" height="80" className="fill-sky-100" />
      <clipPath id={`${uid}-agua`}>
        <rect x="24" y="82" width="192" height="56" rx="10" />
      </clipPath>
      <rect x="24" y="82" width="192" height="56" rx="10" className="fill-sky-300" />
      <g clipPath={`url(#${uid}-agua)`}>
        <path d={ola(96, 3)} className="fill-sky-400 animate-[ilus-ola_3s_linear_infinite]" />
        <path
          d={ola(114, 3)}
          className="fill-sky-500 animate-[ilus-ola_4.5s_linear_infinite_reverse]"
        />
        <Destello x={150} y={104} delay="0.3s" />
        <Destello x={60} y={124} s={3} delay="1s" />
      </g>
      <g className="stroke-sky-800" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d="M188 70 V98 M200 70 V98 M188 64 Q188 56 194 58 M200 64 Q200 56 206 58" />
        <path d="M188 78 H200 M188 88 H200" strokeWidth="2" />
      </g>
      <g className="animate-[ilus-flotar_3s_ease-in-out_infinite]">
        <circle cx="86" cy="100" r="11" fill="none" strokeWidth="7" className="stroke-pink-400" />
        <circle
          cx="86"
          cy="100"
          r="11"
          fill="none"
          strokeWidth="7"
          strokeDasharray="8.6 8.6"
          className="stroke-white"
        />
      </g>
    </>
  )
}

Piscina.propTypes = { uid: PropTypes.string.isRequired }

function SalonSocial() {
  // Bombillos sobre dos curvas de guirnalda
  const curva = (t, x0) => ({
    x: x0 + 120 * t,
    y: (1 - t) ** 2 * 14 + 2 * (1 - t) * t * 40 + t ** 2 * 14,
  })
  const bombillos = [0, 120].flatMap((x0) => [0.2, 0.4, 0.6, 0.8].map((t) => curva(t, x0)))
  const confeti = [
    { x: 30, c: 'fill-pink-400', d: '0s' },
    { x: 70, c: 'fill-amber-300', d: '1.2s' },
    { x: 165, c: 'fill-sky-400', d: '0.6s' },
    { x: 210, c: 'fill-violet-400', d: '1.8s' },
    { x: 100, c: 'fill-violet-300', d: '2.4s' },
  ]
  return (
    <>
      <rect width="240" height="150" className="fill-violet-50" />
      <rect y="122" width="240" height="28" className="fill-violet-100" />
      <path d="M0 14 Q60 40 120 14 Q180 40 240 14" fill="none" strokeWidth="1.5" className="stroke-violet-300" />
      {bombillos.map((b, i) => (
        <circle
          key={i}
          cx={b.x}
          cy={b.y + 4}
          r="4"
          className="fill-amber-300 animate-[ilus-brillo_1.6s_ease-in-out_infinite]"
          style={{ animationDelay: `${(i % 4) * 0.4}s` }}
        />
      ))}
      {confeti.map((c) => (
        <rect
          key={c.x}
          x={c.x}
          y="30"
          width="5"
          height="8"
          rx="1"
          className={cn(c.c, 'opacity-0 animate-[ilus-confeti_3.2s_linear_infinite]')}
          style={{ animationDelay: c.d }}
        />
      ))}
      <g className="origin-top animate-[ilus-pendulo_3s_ease-in-out_infinite]">
        <line x1="120" y1="0" x2="120" y2="40" strokeWidth="1.5" className="stroke-violet-400" />
        <circle cx="120" cy="54" r="14" className="fill-violet-300" />
        <path
          d="M106 54 H134 M108 47 H132 M108 61 H132 M120 40 V68 M113 41 Q110 54 113 67 M127 41 Q130 54 127 67"
          fill="none"
          strokeWidth="1"
          className="stroke-violet-500"
        />
      </g>
      <Destello x={98} y={50} s={5} delay="0.2s" className="fill-amber-300" />
      <Destello x={142} y={62} s={4} delay="0.9s" className="fill-amber-300" />
      <Destello x={138} y={38} s={3} delay="1.4s" className="fill-violet-400" />
      {[
        { x: 38, c: 'fill-pink-400', d: '0s' },
        { x: 56, c: 'fill-violet-500', d: '0.7s' },
        { x: 196, c: 'fill-sky-400', d: '1.3s' },
      ].map((g) => (
        <g key={g.x} className="animate-[ilus-flotar_3.4s_ease-in-out_infinite]" style={{ animationDelay: g.d }}>
          <path d={`M${g.x} 94 Q${g.x - 4} 108 ${g.x + 2} 122`} fill="none" strokeWidth="1" className="stroke-violet-300" />
          <ellipse cx={g.x} cy="80" rx="11" ry="14" className={g.c} />
          <path d={`M${g.x - 2} 94 h4 l-2 3 z`} className={g.c} />
          <ellipse cx={g.x - 4} cy="74" rx="2.5" ry="4" className="fill-white/50" />
        </g>
      ))}
    </>
  )
}

function ZonaBBQ() {
  const llama = (x, h) => `M${x} 86 C${x - 9} 78 ${x - 5} ${86 - h * 0.7} ${x} ${86 - h} C${x + 5} ${86 - h * 0.7} ${x + 9} 78 ${x} 86 Z`
  return (
    <>
      <rect width="240" height="150" className="fill-orange-50" />
      <rect y="126" width="240" height="24" className="fill-orange-100" />
      <g className="fill-orange-200">
        <circle cx="206" cy="80" r="16" />
        <circle cx="194" cy="92" r="12" />
        <rect x="203" y="96" width="6" height="30" rx="2" className="fill-orange-300" />
      </g>
      {[104, 120, 136].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="58"
          r="7"
          className="fill-slate-300 opacity-0 animate-[ilus-humo_2.8s_ease-out_infinite]"
          style={{ animationDelay: `${i * 0.9}s` }}
        />
      ))}
      {[
        { x: 98, h: 22, c: 'fill-orange-500', d: '0s' },
        { x: 120, h: 30, c: 'fill-orange-500', d: '0.3s' },
        { x: 142, h: 22, c: 'fill-orange-500', d: '0.15s' },
        { x: 109, h: 16, c: 'fill-amber-300', d: '0.45s' },
        { x: 131, h: 16, c: 'fill-amber-300', d: '0.6s' },
      ].map((f) => (
        <path
          key={`${f.x}-${f.h}`}
          d={llama(f.x, f.h)}
          className={cn(f.c, 'origin-bottom animate-[ilus-llama_0.9s_ease-in-out_infinite]')}
          style={{ animationDelay: f.d }}
        />
      ))}
      <rect x="88" y="80" width="26" height="8" rx="4" className="fill-rose-700" />
      <rect x="126" y="80" width="26" height="8" rx="4" className="fill-rose-800" />
      <line x1="64" y1="89" x2="176" y2="89" strokeWidth="3" strokeLinecap="round" className="stroke-slate-500" />
      <path d="M70 90 A50 24 0 0 0 170 90 Z" className="fill-slate-700" />
      <g className="stroke-slate-700" strokeWidth="4" strokeLinecap="round">
        <line x1="96" y1="110" x2="84" y2="126" />
        <line x1="144" y1="110" x2="156" y2="126" />
        <line x1="120" y1="114" x2="120" y2="126" />
      </g>
    </>
  )
}

function ParqueInfantil() {
  return (
    <>
      <rect width="240" height="150" className="fill-yellow-50" />
      <Rayos cx={34} cy={30} r1={18} r2={25} className="stroke-yellow-400" />
      <circle cx="34" cy="30" r="12" className="fill-yellow-300" />
      <g className="fill-white animate-[ilus-nube_6s_ease-in-out_infinite_alternate]">
        <ellipse cx="150" cy="24" rx="20" ry="9" />
        <ellipse cx="138" cy="20" rx="11" ry="9" />
        <ellipse cx="160" cy="18" rx="10" ry="8" />
      </g>
      <rect y="120" width="240" height="30" className="fill-yellow-100" />
      <g className="stroke-yellow-500" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M44 58 Q56 98 88 120" />
      </g>
      <g className="stroke-yellow-700" strokeWidth="3" strokeLinecap="round">
        <line x1="34" y1="56" x2="30" y2="120" />
        <line x1="48" y1="56" x2="52" y2="120" />
        <line x1="32" y1="74" x2="50" y2="74" />
        <line x1="31" y1="92" x2="51" y2="92" />
        <line x1="30" y1="108" x2="52" y2="108" />
      </g>
      <g className="stroke-yellow-700" strokeWidth="4" strokeLinecap="round">
        <line x1="120" y1="44" x2="210" y2="44" />
        <line x1="126" y1="44" x2="112" y2="120" />
        <line x1="204" y1="44" x2="218" y2="120" />
      </g>
      <g className="origin-top animate-[ilus-columpio_2.6s_ease-in-out_infinite]">
        <line x1="150" y1="44" x2="150" y2="98" strokeWidth="1.5" className="stroke-yellow-800" />
        <line x1="174" y1="44" x2="174" y2="98" strokeWidth="1.5" className="stroke-yellow-800" />
        <rect x="146" y="97" width="32" height="6" rx="2" className="fill-orange-500" />
      </g>
      <circle cx="96" cy="112" r="8" className="fill-sky-400 animate-[ilus-rebote_1.2s_infinite]" />
    </>
  )
}

function Gimnasio() {
  return (
    <>
      <rect width="240" height="150" className="fill-pink-50" />
      <rect y="124" width="240" height="26" className="fill-pink-100" />
      <path
        d="M20 32 H70 L78 18 L88 46 L96 26 L102 32 H150"
        pathLength="100"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="60 40"
        className="stroke-pink-400 animate-[ilus-pulso_2.2s_linear_infinite]"
      />
      <path
        d="M196 40 C186 32 180 22 188 16 C193 12 196 16 196 19 C196 16 199 12 204 16 C212 22 206 32 196 40 Z"
        className="fill-pink-500 origin-center animate-[ilus-latido_1.1s_ease-in-out_infinite]"
      />
      <g className="animate-[ilus-pesa_2s_ease-in-out_infinite]">
        <line x1="56" y1="78" x2="184" y2="78" strokeWidth="5" strokeLinecap="round" className="stroke-slate-600" />
        <rect x="62" y="60" width="10" height="36" rx="3" className="fill-pink-600" />
        <rect x="74" y="65" width="8" height="26" rx="3" className="fill-pink-400" />
        <rect x="168" y="60" width="10" height="36" rx="3" className="fill-pink-600" />
        <rect x="158" y="65" width="8" height="26" rx="3" className="fill-pink-400" />
      </g>
      <rect x="100" y="112" width="40" height="8" rx="3" className="fill-slate-600" />
      <line x1="108" y1="120" x2="104" y2="124" strokeWidth="3" className="stroke-slate-600" />
      <line x1="132" y1="120" x2="136" y2="124" strokeWidth="3" className="stroke-slate-600" />
      <g className="fill-slate-700">
        <circle cx="34" cy="114" r="10" />
        <path d="M27 104 Q34 92 41 104" fill="none" strokeWidth="4" className="stroke-slate-700" />
      </g>
      <rect x="200" y="98" width="12" height="26" rx="4" className="fill-sky-300" />
      <rect x="202" y="94" width="8" height="5" rx="1" className="fill-sky-500" />
    </>
  )
}

function Generica() {
  return (
    <>
      <rect width="240" height="150" className="fill-slate-50" />
      <rect y="124" width="240" height="26" className="fill-slate-100" />
      <rect x="80" y="40" width="80" height="84" rx="4" className="fill-slate-300" />
      {[52, 72, 92].map((y) =>
        [92, 112, 132].map((x) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="12"
            height="12"
            rx="2"
            className="fill-amber-200 animate-[ilus-brillo_2.4s_ease-in-out_infinite]"
            style={{ animationDelay: `${(x + y) % 7 * 0.3}s` }}
          />
        )),
      )}
    </>
  )
}

const escenas = [
  { patron: /piscina/i, Escena: Piscina },
  { patron: /sal[oó]n/i, Escena: SalonSocial },
  { patron: /bbq|parrilla|asado/i, Escena: ZonaBBQ },
  { patron: /parque|infantil|juegos/i, Escena: ParqueInfantil },
  { patron: /gimnasio|gym/i, Escena: Gimnasio },
]

// Elige la escena por el nombre de la zona (así funciona con zonas nuevas del API)
export default function IlustracionZona({ nombre, className }) {
  const uid = useId().replace(/:/g, '')
  const Escena = escenas.find((e) => e.patron.test(nombre))?.Escena ?? Generica
  return (
    <svg
      viewBox="0 0 240 150"
      preserveAspectRatio="xMidYMid slice"
      className={cn('ilus block h-full w-full', className)}
      aria-hidden="true"
    >
      <Escena uid={uid} />
    </svg>
  )
}

IlustracionZona.propTypes = {
  nombre: PropTypes.string.isRequired,
  className: PropTypes.string,
}
