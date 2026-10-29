import PropTypes from 'prop-types'
import { CalendarDays, Megaphone, Users, Waves } from 'lucide-react'
import { cn } from '../../lib/utils'

// Comunicados como hojas clavadas en una cartelera de corcho con marco de madera
// (la misma madera del tablero de tiza de Finanzas).

const estiloCategoria = {
  Aviso: { icono: Megaphone, franja: 'bg-brand-600', chip: 'bg-brand-50 text-brand-700', chinche: 'fill-red-400' },
  Asamblea: { icono: Users, franja: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700', chinche: 'fill-sky-500' },
  'Zonas comunes': { icono: Waves, franja: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700', chinche: 'fill-amber-400' },
}
const porDefecto = estiloCategoria.Aviso

// Inclinación leve de cada hoja; al pasar el mouse se endereza
const giros = ['sm:-rotate-[1.5deg]', 'sm:rotate-[1deg]', 'sm:-rotate-[0.5deg]']

function Chinche({ className }) {
  return (
    <svg viewBox="0 0 24 24" className="absolute -top-2.5 left-1/2 size-6 -translate-x-1/2 drop-shadow" aria-hidden="true">
      <circle cx="12" cy="11" r="7" className={className} />
      <circle cx="9.5" cy="8.5" r="2.2" className="fill-white/60" />
    </svg>
  )
}

Chinche.propTypes = { className: PropTypes.string }

export default function CarteleraComunicados({ comunicados, titulo = 'Cartelera de la administración', columnas = 'sm:grid-cols-3', contador = true }) {
  return (
    <div className="h-full rounded-xl bg-[#a8875a] p-1 shadow-[0_18px_36px_-18px_rgb(15_23_42/0.45)]">
      <div className="h-full rounded-lg bg-[#c9a877] p-2.5 sm:p-3">
        <div className="relative h-full overflow-hidden rounded-sm bg-[#dcb98a] bg-[radial-gradient(rgb(160_118_70/0.35)_1px,transparent_1.4px),radial-gradient(rgb(255_255_255/0.25)_1px,transparent_1.4px)] bg-[length:14px_14px,22px_22px] bg-[position:0_0,7px_9px] px-4 pb-6 pt-4 shadow-[inset_0_2px_10px_rgb(0_0_0/0.18)] sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="rounded-md bg-white/85 px-3 py-1 text-sm font-bold text-slate-900 shadow-sm">
              {titulo}
            </h2>
            {contador && (
              <span className="rounded-md bg-brand-700 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                {comunicados.length} {comunicados.length === 1 ? 'comunicado' : 'comunicados'}
              </span>
            )}
          </div>

          <ul className={cn('mt-6 grid gap-6 sm:gap-5', columnas)}>
            {comunicados.map((c, i) => {
              const estilo = estiloCategoria[c.categoria] ?? porDefecto
              const Icono = estilo.icono
              return (
                <li
                  key={c.id}
                  className={cn(
                    'relative flex flex-col rounded-sm bg-white shadow-[0_10px_18px_-10px_rgb(60_40_10/0.55)] transition-transform duration-300 hover:rotate-0 hover:-translate-y-1',
                    giros[i % giros.length],
                  )}
                >
                  <Chinche className={estilo.chinche} />
                  <span className={cn('h-1.5 rounded-t-sm', estilo.franja)} />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold', estilo.chip)}>
                        <Icono className="size-3.5" strokeWidth={2} />
                        {c.categoria}
                      </span>
                      {i === 0 && (
                        <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-danger-strong">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-sm font-bold leading-snug text-slate-900">{c.titulo}</h3>
                    <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-slate-600">{c.contenido}</p>
                    <p className="mt-3 flex items-center gap-1.5 border-t border-dashed border-slate-200 pt-2.5 text-[11px] font-medium text-slate-400">
                      <CalendarDays className="size-3.5" />
                      Publicado el {c.fecha}
                      {c.destino && <span className="ml-auto truncate">· {c.destino}</span>}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

CarteleraComunicados.propTypes = {
  comunicados: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      titulo: PropTypes.string.isRequired,
      categoria: PropTypes.string.isRequired,
      fecha: PropTypes.string.isRequired,
      contenido: PropTypes.string.isRequired,
      destino: PropTypes.string,
    }),
  ).isRequired,
  titulo: PropTypes.string,
  columnas: PropTypes.string,
  contador: PropTypes.bool,
}
