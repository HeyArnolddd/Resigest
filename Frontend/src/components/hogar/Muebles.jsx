import { useId } from 'react'
import PropTypes from 'prop-types'

// Muebles y objetos fijos para los fondos de "interior de casa" del residente.
// Todos son SVG decorativos, sin animación, en la paleta de marca.

const madera = 'fill-[#c9a877]'
const maderaOscura = 'fill-[#a8875a]'

function Svg({ viewBox, className, children }) {
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true">
      {children}
    </svg>
  )
}

Svg.propTypes = { viewBox: PropTypes.string.isRequired, className: PropTypes.string, children: PropTypes.node }

const props = { className: PropTypes.string }

// ── Sala ────────────────────────────────────────────────────────────────

export function Lampara({ className = 'w-28' }) {
  return (
    <Svg viewBox="0 0 120 150" className={className}>
      <circle cx="60" cy="112" r="46" className="fill-yellow-100/50" />
      <path d="M60 0 V70" strokeWidth="2" className="stroke-brand-800/60" />
      <path d="M32 100 L44 70 H76 L88 100 Z" className="fill-brand-700" />
      <path d="M44 70 H76" strokeWidth="3" strokeLinecap="round" className="stroke-brand-800" />
      <ellipse cx="60" cy="101" rx="14" ry="5" className="fill-yellow-200" />
    </Svg>
  )
}
Lampara.propTypes = props

export function Ventana({ className = 'w-40', vista = 'jardin' }) {
  return (
    <Svg viewBox="0 0 170 220" className={className}>
      <rect x="22" y="14" width="126" height="176" className="fill-sky-100" />
      <circle cx="118" cy="48" r="13" className="fill-yellow-200" />
      <ellipse cx="60" cy="56" rx="20" ry="7" className="fill-white" />
      {vista === 'jardin' ? (
        <>
          <path d="M22 150 Q60 128 100 146 T148 140 V190 H22 Z" className="fill-brand-300" />
          <circle cx="52" cy="140" r="15" className="fill-brand-500" />
          <rect x="50" y="146" width="4" height="22" className="fill-brand-800" />
        </>
      ) : (
        <>
          <rect x="34" y="110" width="30" height="80" className="fill-brand-300" />
          <rect x="70" y="90" width="34" height="100" className="fill-brand-400" />
          <rect x="110" y="122" width="30" height="68" className="fill-brand-300" />
        </>
      )}
      <rect x="22" y="14" width="126" height="176" strokeWidth="8" className="fill-none stroke-white" />
      <path d="M85 14 V190 M22 100 H148" strokeWidth="5" className="stroke-white" />
      <rect x="12" y="188" width="146" height="10" rx="2" className="fill-white" />
      <path d="M10 6 H40 C34 70 44 140 30 200 H10 Z" className="fill-brand-400/80" />
      <path d="M160 6 H130 C136 70 126 140 140 200 H160 Z" className="fill-brand-400/80" />
      <rect x="4" y="2" width="162" height="6" rx="3" className="fill-brand-800/70" />
    </Svg>
  )
}
Ventana.propTypes = { ...props, vista: PropTypes.oneOf(['jardin', 'ciudad']) }

export function Cuadros({ className = 'w-40' }) {
  return (
    <Svg viewBox="0 0 170 140" className={className}>
      <rect x="6" y="10" width="92" height="70" rx="3" className="fill-white" />
      <rect x="14" y="18" width="76" height="54" className="fill-brand-50" />
      <path d="M14 72 L40 40 L58 60 L70 48 L90 72 Z" className="fill-brand-400" />
      <circle cx="74" cy="30" r="6" className="fill-yellow-300" />
      <circle cx="136" cy="44" r="26" className="fill-white" />
      <circle cx="136" cy="44" r="20" className="fill-lime-100" />
      <circle cx="136" cy="38" r="7" className="fill-brand-600" />
      <path d="M122 60 C124 48 148 48 150 60 Z" className="fill-brand-600" />
      <rect x="40" y="94" width="44" height="40" rx="3" className="fill-white" />
      <rect x="46" y="100" width="32" height="28" className="fill-sky-100" />
      <path d="M46 120 Q62 106 78 118 V128 H46 Z" className="fill-sky-300" />
    </Svg>
  )
}
Cuadros.propTypes = props

export function Estante({ className = 'w-36' }) {
  const libros = [
    [14, 10, 34, 'fill-brand-600'],
    [26, 8, 30, 'fill-lime-400'],
    [36, 12, 36, 'fill-brand-800'],
    [50, 9, 28, 'fill-sky-400'],
    [61, 10, 33, 'fill-yellow-300'],
  ]
  return (
    <Svg viewBox="0 0 150 90" className={className}>
      {libros.map(([x, w, h, c]) => (
        <rect key={x} x={x} y={60 - h} width={w} height={h} rx="1.5" className={c} />
      ))}
      <rect x="74" y="34" width="10" height="26" rx="1.5" transform="rotate(14 79 60)" className="fill-brand-500" />
      <path d="M104 44 h24 l-3 16 h-18 Z" className="fill-brand-700" />
      <path d="M116 44 C108 30 100 30 98 22 C108 24 114 30 116 44 Z" className="fill-brand-400" />
      <path d="M116 44 C120 28 128 24 134 20 C132 32 126 38 116 44 Z" className="fill-brand-500" />
      <rect x="4" y="60" width="142" height="7" rx="2" className="fill-white" />
      <path d="M20 67 v12 M130 67 v12" strokeWidth="5" strokeLinecap="round" className="stroke-white" />
    </Svg>
  )
}
Estante.propTypes = props

export function MateraGrande({ className = 'w-28' }) {
  return (
    <Svg viewBox="0 0 120 190" className={className}>
      <path d="M60 120 C30 100 14 70 18 40 C40 60 52 86 60 120 Z" className="fill-brand-500" />
      <path d="M60 120 C86 96 104 66 102 30 C80 52 66 82 60 120 Z" className="fill-brand-400" />
      <path d="M60 122 C56 84 60 40 64 6 C76 42 72 84 60 122 Z" className="fill-brand-600" />
      <path d="M60 122 C44 100 30 92 8 92 C26 106 42 116 60 122 Z" className="fill-lime-400" />
      <path d="M32 118 H88 L80 186 H40 Z" className="fill-white" />
      <path d="M32 118 H88 L86 132 H34 Z" className="fill-brand-100" />
    </Svg>
  )
}
MateraGrande.propTypes = props

export function Reloj({ className = 'w-24' }) {
  return (
    <Svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="44" className="fill-brand-700" />
      <circle cx="50" cy="50" r="37" className="fill-white" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x="49" y="16" width="2" height={i % 3 === 0 ? 8 : 4} transform={`rotate(${i * 30} 50 50)`} className="fill-brand-800/60" />
      ))}
      <path d="M50 50 V28 M50 50 L64 58" strokeWidth="3.5" strokeLinecap="round" className="stroke-brand-900" />
      <circle cx="50" cy="50" r="3.5" className="fill-lime-400" />
    </Svg>
  )
}
Reloj.propTypes = props

export function Sofa({ className = 'w-48' }) {
  return (
    <Svg viewBox="0 0 200 110" className={className}>
      <rect x="22" y="14" width="156" height="56" rx="16" className="fill-brand-600" />
      <rect x="40" y="28" width="56" height="34" rx="10" className="fill-brand-500" />
      <rect x="104" y="28" width="56" height="34" rx="10" className="fill-brand-500" />
      <rect x="54" y="20" width="26" height="22" rx="6" transform="rotate(-10 67 31)" className="fill-lime-300" />
      <rect x="10" y="44" width="30" height="50" rx="12" className="fill-brand-700" />
      <rect x="160" y="44" width="30" height="50" rx="12" className="fill-brand-700" />
      <rect x="34" y="60" width="132" height="30" rx="8" className="fill-brand-600" />
      <path d="M28 94 v12 M172 94 v12" strokeWidth="6" strokeLinecap="round" className="stroke-brand-900" />
    </Svg>
  )
}
Sofa.propTypes = props

// ── Estudio (Finanzas) ──────────────────────────────────────────────────

export function Calendario({ className = 'w-28' }) {
  return (
    <Svg viewBox="0 0 110 120" className={className}>
      <rect x="8" y="14" width="94" height="100" rx="8" className="fill-white" />
      <rect x="8" y="14" width="94" height="26" rx="8" className="fill-brand-600" />
      <rect x="8" y="30" width="94" height="10" className="fill-brand-600" />
      <path d="M32 6 v18 M78 6 v18" strokeWidth="6" strokeLinecap="round" className="stroke-brand-800" />
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={18 + (i % 5) * 16} y={50 + Math.floor(i / 5) * 18} width="10" height="10" rx="2" className={i === 7 ? 'fill-yellow-400' : 'fill-brand-100'} />
      ))}
    </Svg>
  )
}
Calendario.propTypes = props

export function Escritorio({ className = 'w-52' }) {
  return (
    <Svg viewBox="0 0 220 150" className={className}>
      {/* Silla */}
      <rect x="150" y="54" width="44" height="50" rx="10" className="fill-brand-700" />
      <rect x="146" y="98" width="52" height="12" rx="5" className="fill-brand-800" />
      <path d="M172 110 V136 M156 144 L172 136 L188 144" strokeWidth="5" strokeLinecap="round" className="stroke-slate-500" />
      {/* Escritorio */}
      <rect x="6" y="80" width="170" height="10" rx="3" className={madera} />
      <rect x="14" y="90" width="10" height="56" className={maderaOscura} />
      <rect x="120" y="90" width="48" height="56" rx="2" className={maderaOscura} />
      <rect x="128" y="102" width="32" height="4" rx="2" className="fill-[#ead8b8]" />
      <rect x="128" y="122" width="32" height="4" rx="2" className="fill-[#ead8b8]" />
      {/* Portátil */}
      <path d="M50 44 H110 V76 H50 Z" className="fill-slate-700" />
      <rect x="54" y="48" width="52" height="24" className="fill-brand-100" />
      <path d="M58 66 l10 -8 l8 5 l12 -10 l12 6" strokeWidth="2" strokeLinejoin="round" className="fill-none stroke-brand-600" />
      <path d="M42 76 H118 L114 80 H46 Z" className="fill-slate-500" />
      {/* Lámpara de escritorio */}
      <path d="M22 80 V54 L36 36" strokeWidth="4" strokeLinecap="round" className="fill-none stroke-brand-800" />
      <path d="M28 30 L46 26 L44 44 Z" className="fill-brand-600" />
      <rect x="14" y="76" width="18" height="5" rx="2" className="fill-brand-800" />
      {/* Taza */}
      <rect x="124" y="64" width="12" height="16" rx="2" className="fill-white" />
    </Svg>
  )
}
Escritorio.propTypes = props

export function CajaFuerte({ className = 'w-32' }) {
  return (
    <Svg viewBox="0 0 120 160" className={className}>
      {/* Alcancía */}
      <ellipse cx="60" cy="42" rx="30" ry="22" className="fill-pink-300" />
      <circle cx="84" cy="40" r="9" className="fill-pink-300" />
      <ellipse cx="88" cy="42" rx="4" ry="3" className="fill-pink-400" />
      <path d="M44 24 l4 -10 l8 8 Z" className="fill-pink-400" />
      <circle cx="78" cy="34" r="2" className="fill-slate-700" />
      <rect x="52" y="20" width="14" height="3" rx="1.5" className="fill-pink-500" />
      <path d="M44 60 v8 M72 60 v8" strokeWidth="6" strokeLinecap="round" className="stroke-pink-400" />
      <circle cx="58" cy="8" r="6" className="fill-yellow-300" />
      {/* Caja fuerte */}
      <rect x="10" y="68" width="100" height="88" rx="8" className="fill-slate-600" />
      <rect x="18" y="76" width="84" height="72" rx="5" className="fill-slate-500" />
      <circle cx="60" cy="112" r="18" className="fill-slate-300" />
      <circle cx="60" cy="112" r="7" className="fill-slate-600" />
      <path d="M60 94 v6 M78 112 h-6 M60 130 v-6 M42 112 h6" strokeWidth="2.5" className="stroke-slate-600" />
      <rect x="88" y="104" width="6" height="16" rx="3" className="fill-lime-300" />
    </Svg>
  )
}
CajaFuerte.propTypes = props

// ── Terraza (Reservas) ──────────────────────────────────────────────────

export function Guirnalda({ className = 'w-44' }) {
  const bombillos = [16, 46, 76, 106, 136, 166]
  return (
    <Svg viewBox="0 0 180 70" className={className}>
      <path d="M0 8 Q45 40 90 20 T180 10" strokeWidth="2" className="fill-none stroke-brand-800/60" />
      {bombillos.map((x, i) => {
        const y = [20, 30, 27, 18, 17, 12][i]
        return (
          <g key={x}>
            <circle cx={x} cy={y + 14} r="10" className="fill-yellow-200/50" />
            <rect x={x - 3} y={y} width="6" height="5" className="fill-brand-800" />
            <ellipse cx={x} cy={y + 12} rx="5" ry="7" className="fill-yellow-200" />
          </g>
        )
      })}
    </Svg>
  )
}
Guirnalda.propTypes = props

// Ventana en arco de la terraza: afuera, la piscina con una palmera, detrás de la baranda del balcón
export function Ventanal({ className = 'w-44' }) {
  const uid = useId().replace(/:/g, '')
  const vidrio = 'M24 210 V84 A66 66 0 0 1 156 84 V210 Z'
  return (
    <Svg viewBox="0 0 180 226" className={className}>
      <defs>
        <clipPath id={`${uid}-vidrio`}>
          <path d={vidrio} />
        </clipPath>
      </defs>
      {/* Marco */}
      <path d="M12 214 V84 A78 78 0 0 1 168 84 V214 Z" className="fill-white" />

      <g clipPath={`url(#${uid}-vidrio)`}>
        <rect width="180" height="226" className="fill-sky-100" />
        <circle cx="122" cy="62" r="14" className="fill-yellow-200" />
        <ellipse cx="62" cy="58" rx="18" ry="6" className="fill-white" />
        <ellipse cx="52" cy="53" rx="9" ry="6" className="fill-white" />
        {/* Colinas */}
        <path d="M0 150 Q40 128 84 146 T180 138 V226 H0 Z" className="fill-brand-200" />
        {/* Piscina */}
        <rect x="0" y="160" width="180" height="66" className="fill-sky-400" />
        <path d="M0 160 H180" strokeWidth="4" className="stroke-white" />
        <path d="M24 174 q8 -4 16 0 t16 0 M86 184 q8 -4 16 0 t16 0 M120 170 q8 -4 16 0 t16 0" strokeWidth="2.5" strokeLinecap="round" className="fill-none stroke-sky-200" />
        {/* Palmera */}
        <path d="M54 160 Q50 128 60 100" strokeWidth="5" strokeLinecap="round" className="fill-none stroke-[#a8875a]" />
        <path d="M60 100 Q44 92 32 100 Q46 96 60 102 Z" className="fill-brand-500" />
        <path d="M60 100 Q76 90 90 98 Q74 96 60 102 Z" className="fill-brand-500" />
        <path d="M60 100 Q52 82 40 80 Q54 88 60 100 Z" className="fill-brand-600" />
        <path d="M60 100 Q70 82 84 82 Q70 90 60 100 Z" className="fill-brand-600" />
        <circle cx="60" cy="102" r="3" className="fill-[#8a6a3d]" />
        {/* Baranda del balcón */}
        <path d="M0 182 H180" strokeWidth="4" className="stroke-white" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${30 + i * 11} 182 V210`} strokeWidth="2.5" className="stroke-white/90" />
        ))}
      </g>

      {/* Divisiones de la ventana */}
      <path d={vidrio} strokeWidth="3" className="fill-none stroke-white" />
      <path d="M90 18 V210 M24 120 H156" strokeWidth="5" className="stroke-white" />
      {/* Alféizar con matera */}
      <rect x="4" y="210" width="172" height="12" rx="3" className="fill-white" />
      <path d="M134 196 h22 l-3 14 h-16 Z" className="fill-brand-700" />
      <path d="M145 196 C140 186 134 184 132 178 C140 180 144 188 145 196 Z M145 196 C148 184 154 182 160 178 C158 188 152 192 145 196 Z" className="fill-brand-400" />
    </Svg>
  )
}
Ventanal.propTypes = props

export function PlantaColgante({ className = 'w-24' }) {
  return (
    <Svg viewBox="0 0 90 160" className={className}>
      <path d="M45 0 V40 M45 40 L26 80 M45 40 L64 80" strokeWidth="1.5" className="stroke-brand-800/60" />
      <path d="M22 80 H68 L62 104 H28 Z" className="fill-white" />
      {[[30, 130], [40, 150], [52, 140], [62, 124]].map(([x, y]) => (
        <path key={x} d={`M${x} 100 Q${x - 6} ${(y + 100) / 2} ${x} ${y}`} strokeWidth="3" strokeLinecap="round" className="fill-none stroke-brand-500" />
      ))}
      {[[26, 112], [34, 136], [40, 120], [48, 146], [56, 128], [60, 112], [64, 120]].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="5" ry="3.5" className="fill-brand-400" />
      ))}
      <path d="M30 80 Q36 66 45 72 Q54 64 62 80 Z" className="fill-brand-500" />
    </Svg>
  )
}
PlantaColgante.propTypes = props

export function Asador({ className = 'w-36' }) {
  return (
    <Svg viewBox="0 0 140 150" className={className}>
      <path d="M50 26 q-6 -10 0 -20 M70 26 q-6 -10 0 -20 M90 26 q-6 -10 0 -20" strokeWidth="3" strokeLinecap="round" className="fill-none stroke-slate-300" />
      <path d="M20 40 H120 A50 40 0 0 1 20 40 Z" className="fill-slate-700" />
      <rect x="16" y="34" width="108" height="8" rx="4" className="fill-slate-500" />
      <path d="M40 76 L28 144 M100 76 L112 144 M70 80 V144" strokeWidth="5" strokeLinecap="round" className="stroke-slate-600" />
      <circle cx="28" cy="144" r="6" className="fill-slate-800" />
      <circle cx="112" cy="144" r="6" className="fill-slate-800" />
      <rect x="56" y="56" width="28" height="6" rx="3" className="fill-orange-400" />
    </Svg>
  )
}
Asador.propTypes = props

export function MesaSombrilla({ className = 'w-48' }) {
  return (
    <Svg viewBox="0 0 200 200" className={className}>
      <path d="M100 30 C40 30 10 60 6 74 H194 C190 60 160 30 100 30 Z" className="fill-brand-500" />
      {[40, 80, 120, 160].map((x) => (
        <path key={x} d={`M${x} 74 Q${x + 10} 84 ${x + 20} 74`} className="fill-brand-500" />
      ))}
      <path d="M100 30 C80 40 70 60 66 74 H134 C130 60 120 40 100 30 Z" className="fill-lime-300" />
      <rect x="97" y="20" width="6" height="170" rx="3" className="fill-white" />
      <ellipse cx="100" cy="140" rx="64" ry="8" className="fill-white" />
      <path d="M60 146 L54 196 M140 146 L146 196" strokeWidth="5" strokeLinecap="round" className="stroke-white" />
      <rect x="84" y="120" width="12" height="16" rx="2" className="fill-sky-300" />
      <rect x="104" y="124" width="10" height="12" rx="2" className="fill-yellow-300" />
    </Svg>
  )
}
MesaSombrilla.propTypes = props

// ── Cuarto de herramientas (Incidencias) ────────────────────────────────

export function LamparaTaller({ className = 'w-28' }) {
  return (
    <Svg viewBox="0 0 110 170" className={className}>
      <circle cx="55" cy="118" r="44" className="fill-yellow-100/50" />
      <path d="M55 0 V62" strokeWidth="2.5" className="stroke-slate-600" />
      <rect x="49" y="58" width="12" height="8" rx="2" className="fill-slate-700" />
      <path d="M26 96 Q26 66 55 66 Q84 66 84 96 Z" className="fill-brand-700" />
      <path d="M36 82 Q55 72 74 82" strokeWidth="3" strokeLinecap="round" className="fill-none stroke-brand-500/60" />
      <rect x="22" y="94" width="66" height="6" rx="3" className="fill-brand-800" />
      <ellipse cx="55" cy="112" rx="11" ry="13" className="fill-yellow-200" />
      {/* Rejilla protectora */}
      <path d="M40 100 Q38 124 55 130 Q72 124 70 100 M55 100 V130 M41 114 H69" strokeWidth="2" className="fill-none stroke-slate-500" />
    </Svg>
  )
}
LamparaTaller.propTypes = props

export function TableroHerramientas({ className = 'w-44' }) {
  return (
    <Svg viewBox="0 0 190 150" className={className}>
      <rect x="4" y="4" width="182" height="142" rx="6" className={madera} />
      <rect x="4" y="4" width="182" height="142" rx="6" strokeWidth="5" className="fill-none stroke-[#a8875a]" />
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={16 + (i % 12) * 15} cy={16 + Math.floor(i / 12) * 28} r="1.8" className={maderaOscura} />
      ))}
      {/* Martillo */}
      <rect x="24" y="40" width="8" height="78" rx="3" className="fill-[#8a6a3d]" />
      <path d="M10 28 H40 Q46 28 46 34 V40 H10 Z" className="fill-slate-600" />
      <path d="M10 28 Q4 34 8 44" strokeWidth="4" strokeLinecap="round" className="fill-none stroke-slate-600" />
      {/* Serrucho */}
      <path d="M58 46 H104 V56 L64 116 H58 Z" className="fill-slate-300" />
      <path d="M58 116 l3 -6 l3 6 l3 -6 l3 6" strokeWidth="1.5" className="fill-none stroke-slate-400" />
      <rect x="98" y="30" width="22" height="34" rx="8" className="fill-brand-600" />
      <rect x="104" y="38" width="10" height="14" rx="4" className={madera} />
      {/* Alicate */}
      <path d="M134 30 L148 74 M154 30 L140 74" strokeWidth="5" strokeLinecap="round" className="stroke-slate-500" />
      <path d="M148 74 L156 118 M140 74 L132 118" strokeWidth="8" strokeLinecap="round" className="stroke-orange-500" />
      <circle cx="144" cy="66" r="3.5" className="fill-slate-700" />
      {/* Llave */}
      <path d="M172 30 V100" strokeWidth="7" strokeLinecap="round" className="stroke-slate-500" />
      <path d="M164 22 a9 9 0 1 0 16 0 l-4 6 h-8 Z" className="fill-slate-500" />
      {/* Metro */}
      <rect x="160" y="112" width="22" height="20" rx="5" className="fill-yellow-400" />
      <circle cx="171" cy="122" r="4" className="fill-slate-700" />
    </Svg>
  )
}
TableroHerramientas.propTypes = props

export function RepisaPintura({ className = 'w-40' }) {
  const tarros = [
    [20, 'fill-brand-500'],
    [62, 'fill-sky-400'],
    [104, 'fill-yellow-400'],
  ]
  return (
    <Svg viewBox="0 0 160 90" className={className}>
      {tarros.map(([x, c]) => (
        <g key={x}>
          <rect x={x} y="22" width="34" height="40" rx="3" className="fill-slate-200" />
          <ellipse cx={x + 17} cy="22" rx="17" ry="4" className="fill-slate-300" />
          <rect x={x} y="32" width="34" height="18" className={c} />
          <path d={`M${x + 8} 32 v8 a2.5 2.5 0 0 0 5 0 v-8`} className={c} />
          <path d={`M${x + 4} 18 Q${x + 17} 4 ${x + 30} 18`} strokeWidth="2" className="fill-none stroke-slate-500" />
        </g>
      ))}
      <rect x="6" y="62" width="148" height="8" rx="2" className="fill-white" />
      <path d="M24 70 l10 14 M136 70 l-10 14" strokeWidth="4" strokeLinecap="round" className="stroke-white" />
    </Svg>
  )
}
RepisaPintura.propTypes = props

export function BancoTrabajo({ className = 'w-52' }) {
  return (
    <Svg viewBox="0 0 220 170" className={className}>
      {/* Prensa */}
      <rect x="16" y="48" width="44" height="22" rx="3" className="fill-slate-600" />
      <rect x="24" y="36" width="10" height="16" className="fill-slate-500" />
      <rect x="44" y="36" width="10" height="16" className="fill-slate-500" />
      <path d="M38 58 H6" strokeWidth="4" strokeLinecap="round" className="stroke-slate-400" />
      <circle cx="6" cy="58" r="4" className="fill-slate-700" />
      {/* Taladro */}
      <path d="M96 40 H140 Q148 40 148 48 V56 H96 Z" className="fill-brand-600" />
      <rect x="84" y="45" width="14" height="6" rx="2" className="fill-slate-700" />
      <path d="M72 48 H86" strokeWidth="2.5" className="stroke-slate-400" />
      <path d="M118 56 L112 70 H130 L134 56 Z" className="fill-brand-700" />
      <rect x="110" y="64" width="24" height="6" rx="2" className="fill-slate-800" />
      {/* Tornillos */}
      <circle cx="166" cy="66" r="3" className="fill-slate-400" />
      <circle cx="176" cy="67" r="3" className="fill-slate-400" />
      <circle cx="171" cy="62" r="3" className="fill-slate-400" />
      {/* Banco */}
      <rect x="4" y="70" width="212" height="12" rx="3" className={madera} />
      <path d="M4 76 H216" strokeWidth="1.5" className="stroke-[#a8875a]" />
      <rect x="14" y="82" width="10" height="84" className={maderaOscura} />
      <rect x="196" y="82" width="10" height="84" className={maderaOscura} />
      <rect x="14" y="132" width="192" height="8" className={maderaOscura} />
      {/* Caja de herramientas en la repisa de abajo */}
      <rect x="120" y="100" width="64" height="32" rx="4" className="fill-orange-600" />
      <rect x="120" y="100" width="64" height="9" rx="4" className="fill-orange-700" />
      <path d="M140 100 V92 H164 V100" strokeWidth="4" className="fill-none stroke-slate-600" />
      <rect x="147" y="114" width="10" height="7" rx="1.5" className="fill-yellow-300" />
    </Svg>
  )
}
BancoTrabajo.propTypes = props

export function TableroElectrico({ className = 'w-32' }) {
  return (
    <Svg viewBox="0 0 120 200" className={className}>
      {/* Tubería hacia el techo */}
      <path d="M60 0 V30" strokeWidth="9" className="stroke-slate-300" />
      <rect x="52" y="22" width="16" height="6" rx="1.5" className="fill-slate-400" />
      <rect x="8" y="30" width="104" height="150" rx="6" className="fill-slate-300" />
      <rect x="16" y="38" width="88" height="134" rx="4" className="fill-slate-100" />
      {/* Señal de alto voltaje */}
      <path d="M60 46 L78 76 H42 Z" strokeWidth="2" strokeLinejoin="round" className="fill-yellow-300 stroke-slate-800" />
      <path d="M62 54 L55 64 H61 L57 72 L66 61 H60 Z" className="fill-slate-800" />
      {Array.from({ length: 8 }, (_, i) => {
        const x = 26 + (i % 2) * 38
        const y = 88 + Math.floor(i / 2) * 20
        return (
          <g key={i}>
            <rect x={x} y={y} width="30" height="14" rx="2" className="fill-white" />
            <rect x={x + 9} y={y + 3} width="12" height="8" rx="1.5" className={i === 5 ? 'fill-warning' : 'fill-slate-500'} />
          </g>
        )
      })}
      <rect x="98" y="96" width="4" height="22" rx="2" className="fill-slate-400" />
      <circle cx="96" cy="44" r="3" className="fill-brand-500" />
    </Svg>
  )
}
TableroElectrico.propTypes = props

export function EscaleraTijera({ className = 'w-40' }) {
  return (
    <Svg viewBox="0 0 160 220" className={className}>
      {/* Escalera */}
      <path d="M50 10 L14 214 M50 10 L86 214" strokeWidth="8" strokeLinecap="round" className="stroke-brand-600" />
      <rect x="38" y="4" width="24" height="12" rx="3" className="fill-brand-700" />
      {[60, 105, 150, 195].map((y) => {
        const d = ((y - 10) / 204) * 36
        return <path key={y} d={`M${50 - d} ${y} H${50 + d}`} strokeWidth="6" strokeLinecap="round" className="stroke-brand-500" />
      })}
      {/* Balde de pintura y brocha */}
      <path d="M100 166 H150 L146 214 H104 Z" className="fill-white" />
      <ellipse cx="125" cy="166" rx="25" ry="6" className="fill-slate-200" />
      <ellipse cx="125" cy="166" rx="20" ry="4" className="fill-brand-400" />
      <path d="M100 172 h12 v10 a3 3 0 0 1 -6 0 v-4 a3 3 0 0 0 -6 0 Z" className="fill-brand-400" />
      <path d="M102 166 Q125 140 148 166" strokeWidth="2" className="fill-none stroke-slate-400" />
      <rect x="132" y="128" width="8" height="30" rx="3" transform="rotate(18 136 143)" className={madera} />
      <rect x="128" y="154" width="14" height="12" rx="2" transform="rotate(18 135 160)" className="fill-slate-500" />
    </Svg>
  )
}
EscaleraTijera.propTypes = props

// ── Recibidor (Paquetes) ────────────────────────────────────────────────

export function Espejo({ className = 'w-28' }) {
  return (
    <Svg viewBox="0 0 110 110" className={className}>
      <circle cx="55" cy="55" r="50" className="fill-[#c9a877]" />
      <circle cx="55" cy="55" r="42" className="fill-sky-100" />
      <path d="M30 40 L50 20 M34 58 L66 26" strokeWidth="5" strokeLinecap="round" className="stroke-white" />
    </Svg>
  )
}
Espejo.propTypes = props

export function PortaLlaves({ className = 'w-28' }) {
  return (
    <Svg viewBox="0 0 120 90" className={className}>
      <rect x="6" y="10" width="108" height="20" rx="4" className="fill-brand-700" />
      {[24, 48, 72, 96].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 30 v8`} strokeWidth="3" className="stroke-slate-400" />
          {i !== 2 && (
            <>
              <circle cx={x} cy="46" r="7" strokeWidth="3" className="fill-none stroke-yellow-500" />
              <path d={`M${x} 53 v22 m0 -6 h6 m-6 -6 h4`} strokeWidth="3" strokeLinecap="round" className="stroke-yellow-500" />
            </>
          )}
        </g>
      ))}
    </Svg>
  )
}
PortaLlaves.propTypes = props

export function Perchero({ className = 'w-28' }) {
  return (
    <Svg viewBox="0 0 110 250" className={className}>
      <rect x="51" y="20" width="8" height="220" rx="3" className={maderaOscura} />
      <path d="M55 30 L30 44 M55 30 L80 44 M55 50 L34 62" strokeWidth="5" strokeLinecap="round" className="stroke-[#a8875a]" />
      <path d="M30 240 H80" strokeWidth="8" strokeLinecap="round" className="stroke-[#a8875a]" />
      {/* Abrigo */}
      <path d="M78 44 C96 50 100 70 98 140 H64 C62 90 64 56 78 44 Z" className="fill-brand-600" />
      <path d="M78 44 L82 100" strokeWidth="2" className="stroke-brand-800" />
      {/* Bolso */}
      <path d="M32 44 C26 56 30 66 34 72" strokeWidth="3" className="fill-none stroke-yellow-700" />
      <rect x="16" y="70" width="36" height="30" rx="6" className="fill-yellow-400" />
      {/* Paraguas */}
      <path d="M24 236 V170 q0 -8 6 -8" strokeWidth="4" strokeLinecap="round" className="fill-none stroke-sky-700" />
      <path d="M14 236 Q24 180 34 236 Z" className="fill-sky-500" />
    </Svg>
  )
}
Perchero.propTypes = props

export function PuertaPrincipal({ className = 'w-44' }) {
  return (
    <Svg viewBox="0 0 170 270" className={className}>
      <rect x="10" y="4" width="150" height="250" rx="4" className="fill-white" />
      <rect x="22" y="16" width="126" height="238" className="fill-brand-700" />
      <rect x="40" y="34" width="90" height="70" rx="3" className="fill-brand-600" />
      <rect x="50" y="44" width="70" height="50" className="fill-sky-100" />
      <path d="M85 44 V94 M50 69 H120" strokeWidth="3" className="stroke-brand-600" />
      <rect x="40" y="124" width="90" height="110" rx="3" className="fill-brand-600" />
      <rect x="56" y="150" width="58" height="10" rx="2" className="fill-yellow-300" />
      <circle cx="132" cy="140" r="6" className="fill-yellow-300" />
      {/* Tapete */}
      <rect x="20" y="254" width="130" height="14" rx="4" className="fill-[#a8875a]" />
      <path d="M40 261 H130" strokeWidth="2" strokeDasharray="6 5" className="stroke-[#ead8b8]" />
    </Svg>
  )
}
PuertaPrincipal.propTypes = props

// ── Comedor (Comunidad) ─────────────────────────────────────────────────

export function Banderines({ className = 'w-44' }) {
  const colores = ['fill-brand-500', 'fill-lime-300', 'fill-yellow-300', 'fill-sky-400', 'fill-white', 'fill-brand-500', 'fill-lime-300', 'fill-yellow-300']
  return (
    <Svg viewBox="0 0 180 60" className={className}>
      <path d="M0 6 Q90 30 180 6" strokeWidth="2" className="fill-none stroke-brand-800/60" />
      {colores.map((c, i) => {
        const x = 13 + i * 22
        const t = (x - 90) / 90
        const y = 6 + 12 * (1 - t * t)
        return <path key={x} d={`M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 20} Z`} className={c} />
      })}
    </Svg>
  )
}
Banderines.propTypes = props

export function Cartelera({ className = 'w-44' }) {
  return (
    <Svg viewBox="0 0 190 150" className={className}>
      <rect x="4" y="4" width="182" height="142" rx="6" className={maderaOscura} />
      <rect x="12" y="12" width="166" height="126" rx="3" className="fill-[#dcb98a]" />
      {Array.from({ length: 30 }, (_, i) => (
        <circle key={i} cx={20 + ((i * 37) % 152)} cy={20 + ((i * 53) % 110)} r="1.2" className="fill-[#c49a64]" />
      ))}
      {/* Aviso de la administración */}
      <g transform="rotate(-3 60 62)">
        <rect x="24" y="22" width="66" height="82" rx="2" className="fill-white" />
        <rect x="24" y="22" width="66" height="16" rx="2" className="fill-brand-600" />
        {[48, 56, 64, 72, 80].map((y, i) => (
          <rect key={y} x="31" y={y} width={i % 2 ? 40 : 52} height="3" rx="1.5" className="fill-slate-200" />
        ))}
        <circle cx="57" cy="22" r="4" className="fill-red-400" />
      </g>
      {/* Foto de vecinos */}
      <g transform="rotate(5 132 50)">
        <rect x="104" y="20" width="56" height="58" rx="2" className="fill-white" />
        <rect x="110" y="26" width="44" height="38" className="fill-sky-100" />
        <circle cx="124" cy="44" r="6" className="fill-brand-500" />
        <circle cx="140" cy="44" r="6" className="fill-yellow-400" />
        <path d="M114 64 C116 52 132 52 134 64 Z M130 64 C132 52 148 52 150 64 Z" className="fill-brand-600" />
        <circle cx="132" cy="20" r="4" className="fill-sky-500" />
      </g>
      {/* Notas adhesivas */}
      <g transform="rotate(-6 128 110)">
        <rect x="104" y="92" width="40" height="38" className="fill-yellow-200" />
        <path d="M110 104 h26 M110 112 h20" strokeWidth="2.5" strokeLinecap="round" className="stroke-yellow-600/50" />
      </g>
      <g transform="rotate(8 160 112)">
        <rect x="148" y="96" width="26" height="26" className="fill-pink-200" />
        <circle cx="161" cy="96" r="3.5" className="fill-brand-600" />
      </g>
      <rect x="38" y="112" width="44" height="18" rx="2" transform="rotate(4 60 121)" className="fill-lime-200" />
    </Svg>
  )
}
Cartelera.propTypes = props

export function EstacionCafe({ className = 'w-48' }) {
  return (
    <Svg viewBox="0 0 210 180" className={className}>
      {/* Cafetera */}
      <rect x="22" y="30" width="44" height="60" rx="5" className="fill-slate-700" />
      <rect x="22" y="30" width="44" height="14" rx="5" className="fill-slate-800" />
      <rect x="30" y="58" width="28" height="30" rx="4" className="fill-sky-100/90" />
      <rect x="30" y="72" width="28" height="16" rx="3" className="fill-[#7a4a24]" />
      <circle cx="58" cy="37" r="3" className="fill-lime-400" />
      <path d="M44 22 q-5 -8 0 -16 M54 22 q-5 -8 0 -16" strokeWidth="2.5" strokeLinecap="round" className="fill-none stroke-slate-300" />
      {/* Bandeja con tazas */}
      <rect x="80" y="84" width="76" height="6" rx="3" className={maderaOscura} />
      {[['fill-white', 86], ['fill-brand-500', 108], ['fill-lime-300', 130]].map(([c, x]) => (
        <g key={x}>
          <rect x={x} y="66" width="16" height="18" rx="3" className={c} />
          <path d={`M${x + 16} 70 a5 5 0 0 1 0 10`} strokeWidth="2.5" className="fill-none stroke-slate-300" />
        </g>
      ))}
      {/* Matera */}
      <path d="M170 70 h22 l-3 20 h-16 Z" className="fill-white" />
      <path d="M181 70 C174 56 166 54 164 46 C174 48 180 56 181 70 Z M181 70 C184 54 192 50 198 46 C196 58 190 64 181 70 Z" className="fill-brand-500" />
      {/* Aparador */}
      <rect x="8" y="90" width="194" height="70" rx="5" className={madera} />
      <rect x="16" y="98" width="86" height="54" rx="3" className={maderaOscura} />
      <rect x="108" y="98" width="86" height="54" rx="3" className={maderaOscura} />
      <rect x="54" y="122" width="10" height="3" rx="1.5" className="fill-[#ead8b8]" />
      <rect x="146" y="122" width="10" height="3" rx="1.5" className="fill-[#ead8b8]" />
      <path d="M22 160 v14 M188 160 v14" strokeWidth="6" strokeLinecap="round" className="stroke-[#a8875a]" />
    </Svg>
  )
}
EstacionCafe.propTypes = props

export function LamparasTriples({ className = 'w-40' }) {
  const lamparas = [
    [40, 70, 'fill-brand-700'],
    [85, 96, 'fill-brand-600'],
    [130, 70, 'fill-brand-700'],
  ]
  return (
    <Svg viewBox="0 0 170 150" className={className}>
      <rect x="20" y="0" width="130" height="6" rx="3" className="fill-brand-800/70" />
      {lamparas.map(([x, largo, c]) => (
        <g key={x}>
          <circle cx={x} cy={largo + 22} r="26" className="fill-yellow-100/45" />
          <path d={`M${x} 6 V${largo}`} strokeWidth="2" className="stroke-brand-800/60" />
          <path d={`M${x - 18} ${largo + 18} Q${x - 18} ${largo} ${x} ${largo} Q${x + 18} ${largo} ${x + 18} ${largo + 18} Z`} className={c} />
          <ellipse cx={x} cy={largo + 19} rx="9" ry="4" className="fill-yellow-200" />
        </g>
      ))}
    </Svg>
  )
}
LamparasTriples.propTypes = props

export function MesaComedor({ className = 'w-56' }) {
  // Silla vista de frente: espaldar con listones, cojín y dos patas
  const silla = (x) => (
    <g>
      <rect x={x + 4} y="54" width="38" height="56" rx="12" className="fill-brand-700" />
      {[14, 21, 28].map((d) => (
        <rect key={d} x={x + d} y="64" width="4" height="40" rx="2" className="fill-brand-500" />
      ))}
      <rect x={x} y="106" width="46" height="11" rx="4" className="fill-brand-700" />
      <rect x={x + 3} y="102" width="40" height="7" rx="3.5" className="fill-lime-300" />
      <rect x={x + 4} y="117" width="5" height="44" rx="2" className="fill-brand-800" />
      <rect x={x + 37} y="117" width="5" height="44" rx="2" className="fill-brand-800" />
    </g>
  )
  return (
    <Svg viewBox="0 0 240 180" className={className}>
      {/* Tapete */}
      <ellipse cx="120" cy="164" rx="116" ry="14" className="fill-brand-300/60" />
      <ellipse cx="120" cy="164" rx="102" ry="9" strokeWidth="2" strokeDasharray="6 5" className="fill-none stroke-white/80" />
      {silla(2)}
      {silla(192)}
      {/* Mesa con mantel */}
      <path d="M120 128 V158 M100 160 H140" strokeWidth="8" strokeLinecap="round" className="stroke-[#a8875a]" />
      <path d="M52 88 H188 L182 122 Q120 132 58 122 Z" className="fill-white" />
      <path d="M58 122 Q120 132 182 122" strokeWidth="3" className="fill-none stroke-brand-200" />
      <ellipse cx="120" cy="88" rx="68" ry="8" className="fill-white" />
      <ellipse cx="120" cy="88" rx="68" ry="8" strokeWidth="1.5" className="fill-none stroke-slate-200" />
      {/* Sobre la mesa */}
      <ellipse cx="82" cy="86" rx="14" ry="3.5" className="fill-slate-100" />
      <ellipse cx="158" cy="86" rx="14" ry="3.5" className="fill-slate-100" />
      <path d="M112 86 C106 72 110 62 120 62 C130 62 134 72 128 86 Z" className="fill-sky-300" />
      {[[112, 54], [120, 46], [128, 54], [116, 50], [124, 50]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" className={x === 120 ? 'fill-yellow-300' : 'fill-pink-300'} />
      ))}
      <path d="M120 62 V48 M116 62 L112 54 M124 62 L128 54" strokeWidth="2" className="stroke-brand-600" />
      <path d="M144 86 V70 h12 v16" className="fill-sky-100" />
      <rect x="142" y="68" width="16" height="18" rx="3" className="fill-sky-200/90" />
      <path d="M158 72 a5 5 0 0 1 0 10" strokeWidth="2.5" className="fill-none stroke-sky-300" />
    </Svg>
  )
}
MesaComedor.propTypes = props
