import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

// Ilustración fija según la categoría de la incidencia, para reconocer el problema de un vistazo.

function Plomeria() {
  return (
    <>
      <path d="M14 30 H62 Q74 30 74 42 V52" strokeWidth="12" strokeLinecap="round" className="fill-none stroke-slate-400" />
      <rect x="8" y="22" width="10" height="16" rx="2" className="fill-slate-500" />
      <rect x="66" y="50" width="16" height="10" rx="3" className="fill-slate-500" />
      <path d="M54 18 h16 M62 18 v12" strokeWidth="5" strokeLinecap="round" className="stroke-sky-600" />
      <path d="M74 64 C70 70 68 74 74 78 C80 74 78 70 74 64 Z" className="fill-sky-400" />
      <path d="M86 70 C83 75 82 78 86 81 C90 78 89 75 86 70 Z" className="fill-sky-300" />
      <ellipse cx="78" cy="90" rx="26" ry="5" className="fill-sky-200" />
      <path d="M60 90 q6 -3 12 0 t12 0" strokeWidth="1.5" className="fill-none stroke-sky-400" />
    </>
  )
}

function Electrico() {
  return (
    <>
      <rect x="24" y="16" width="56" height="68" rx="10" className="fill-white" />
      <rect x="24" y="16" width="56" height="68" rx="10" strokeWidth="2" className="fill-none stroke-slate-300" />
      <rect x="40" y="34" width="5" height="12" rx="2" className="fill-slate-600" />
      <rect x="59" y="34" width="5" height="12" rx="2" className="fill-slate-600" />
      <path d="M48 60 a4 4 0 0 1 8 0 v4 h-8 Z" className="fill-slate-600" />
      <path d="M96 12 L80 46 H92 L84 78 L108 38 H95 L104 12 Z" className="fill-yellow-400" />
      <path d="M96 12 L80 46 H92 L84 78 L108 38 H95 L104 12 Z" strokeWidth="2" strokeLinejoin="round" className="fill-none stroke-yellow-600" />
    </>
  )
}

function Carpinteria() {
  return (
    <>
      <rect x="22" y="10" width="54" height="84" rx="3" className="fill-[#c9a877]" />
      <rect x="30" y="18" width="38" height="30" rx="2" className="fill-[#b8955f]" />
      <rect x="30" y="54" width="38" height="32" rx="2" className="fill-[#b8955f]" />
      <rect x="60" y="48" width="12" height="18" rx="3" className="fill-slate-500" />
      <circle cx="66" cy="54" r="2.2" className="fill-slate-800" />
      <rect x="65" y="55" width="2" height="5" className="fill-slate-800" />
      {/* Llave */}
      <circle cx="96" cy="40" r="9" strokeWidth="4" className="fill-none stroke-yellow-500" />
      <path d="M96 49 V76 M96 64 h7 M96 71 h5" strokeWidth="4" strokeLinecap="round" className="stroke-yellow-500" />
    </>
  )
}

function Iluminacion() {
  return (
    <>
      <path d="M60 4 V16" strokeWidth="2" className="stroke-slate-500" />
      <path d="M40 46 a20 20 0 1 1 40 0 c0 10 -8 14 -8 24 H48 c0 -10 -8 -14 -8 -24 Z" className="fill-slate-200" />
      <path d="M52 50 l5 8 l5 -10 l5 10" strokeWidth="2" strokeLinejoin="round" className="fill-none stroke-slate-400" />
      <rect x="48" y="70" width="24" height="8" rx="2" className="fill-slate-500" />
      <rect x="50" y="78" width="20" height="6" rx="2" className="fill-slate-600" />
      {/* Rayos apagados */}
      <path d="M22 30 l-8 -4 M24 48 h-10 M98 30 l8 -4 M96 48 h10" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 4" className="stroke-amber-300" />
      <path d="M86 70 l10 10 M96 70 l-10 10" strokeWidth="3.5" strokeLinecap="round" className="stroke-danger" />
    </>
  )
}

function Ascensores() {
  return (
    <>
      <rect x="26" y="8" width="68" height="86" rx="4" className="fill-slate-300" />
      <rect x="40" y="12" width="40" height="12" rx="2" className="fill-slate-800" />
      <path d="M50 21 l4 -5 l4 5 M64 15 l4 5 l4 -5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fill-none stroke-lime-400" />
      <rect x="32" y="28" width="27" height="62" className="fill-slate-100" />
      <rect x="61" y="28" width="27" height="62" className="fill-slate-100" />
      <path d="M60 28 V90" strokeWidth="2" className="stroke-slate-400" />
      <circle cx="102" cy="54" r="5" className="fill-white stroke-slate-400" strokeWidth="1.5" />
      <circle cx="102" cy="68" r="5" className="fill-white stroke-slate-400" strokeWidth="1.5" />
      {/* Ruido */}
      <path d="M10 40 q-4 8 0 16 M4 36 q-6 12 0 24" strokeWidth="2.5" strokeLinecap="round" className="fill-none stroke-warning" />
    </>
  )
}

function ZonasComunes() {
  return (
    <>
      <circle cx="84" cy="34" r="20" className="fill-brand-400" />
      <circle cx="74" cy="26" r="10" className="fill-brand-300" />
      <rect x="81" y="48" width="6" height="40" rx="2" className="fill-[#8a6a3d]" />
      {/* Banca */}
      <rect x="14" y="56" width="56" height="7" rx="2" className="fill-[#c9a877]" />
      <rect x="14" y="44" width="56" height="7" rx="2" className="fill-[#c9a877]" />
      <path d="M20 63 V84 M64 63 V84" strokeWidth="5" strokeLinecap="round" className="stroke-slate-500" />
      <path d="M8 88 H112" strokeWidth="4" strokeLinecap="round" className="stroke-brand-300" />
    </>
  )
}

function Otro() {
  return (
    <>
      <path d="M30 76 L70 36" strokeWidth="10" strokeLinecap="round" className="stroke-slate-500" />
      <path d="M62 28 a14 14 0 1 0 18 18 l-8 -2 l-6 -6 Z" className="fill-slate-500" />
      <circle cx="94" cy="70" r="16" className="fill-brand-100" />
      <path d="M88 64 a6 6 0 1 1 8 6 v4" strokeWidth="3.5" strokeLinecap="round" className="fill-none stroke-brand-700" />
      <circle cx="96" cy="80" r="2.4" className="fill-brand-700" />
    </>
  )
}

const categorias = {
  Plomería: { Escena: Plomeria, fondo: 'bg-sky-50' },
  Eléctrico: { Escena: Electrico, fondo: 'bg-yellow-50' },
  Carpintería: { Escena: Carpinteria, fondo: 'bg-orange-50' },
  Iluminación: { Escena: Iluminacion, fondo: 'bg-amber-50' },
  Ascensores: { Escena: Ascensores, fondo: 'bg-slate-100' },
  'Zonas comunes': { Escena: ZonasComunes, fondo: 'bg-brand-50' },
  Otro: { Escena: Otro, fondo: 'bg-violet-50' },
}

// Escena sobre un fondo suave del color de la categoría; `className` define el tamaño.
// Categorías que se dibujan con la escena de otra parecida
const alias = { Jardinería: 'Zonas comunes', Cubierta: 'Plomería', Equipos: 'Eléctrico' }

export default function IlustracionIncidencia({ categoria, className }) {
  const { Escena, fondo } = categorias[categoria] ?? categorias[alias[categoria]] ?? categorias.Otro
  return (
    <div className={cn('flex items-center justify-center overflow-hidden p-1.5', fondo, className)}>
      <svg viewBox="0 0 120 100" className="h-auto max-h-full w-4/5" aria-hidden="true">
        <Escena />
      </svg>
    </div>
  )
}

IlustracionIncidencia.propTypes = {
  categoria: PropTypes.string.isRequired,
  className: PropTypes.string,
}
