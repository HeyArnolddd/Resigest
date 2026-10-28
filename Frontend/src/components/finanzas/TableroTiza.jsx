import PropTypes from 'prop-types'
import { Download, Droplets, Landmark } from 'lucide-react'
import { conceptoObligacion, estadoObligacion } from '../../lib/labels'
import { cn, formatCOP } from '../../lib/utils'

// Historial de obligaciones como un tablero de tiza: marco de madera, pizarra verde de marca
// con manchas de borrador, letra manuscrita y una repisa con tizas y borrador.

const POR_PAGAR = ['PENDIENTE', 'VENCIDA']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const periodoLargo = (p) => `${MESES[Number(p.split('-')[1]) - 1]} ${p.split('-')[0]}`
const fechaCorta = (iso) => {
  const [a, m, d] = iso.split('-').map(Number)
  return `${d} ${MESES[m - 1].slice(0, 3)} ${a}`
}

// Tiza de color por estado (reservado para estados, no para series)
const tiza = {
  PAGADA: 'text-lime-300',
  EN_VERIFICACION: 'text-sky-300',
  PENDIENTE: 'text-yellow-200',
  VENCIDA: 'text-pink-300',
}

const trazoTiza = '[text-shadow:0_0_1px_rgb(255_255_255/0.45),0_0_6px_rgb(255_255_255/0.08)]'

// Subrayado "a mano" con tiza
function Garabato({ className }) {
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" className={cn('h-2 w-full', className)} aria-hidden="true">
      <path d="M2 5 C20 2 32 7 50 4 S82 2 98 5" strokeWidth="2.2" strokeLinecap="round" className="fill-none stroke-current opacity-80" />
    </svg>
  )
}

Garabato.propTypes = { className: PropTypes.string }

export default function TableroTiza({ obligaciones, filtro, onFiltro, verTodo, onVerTodo, onPagar }) {
  const visibles = verTodo ? obligaciones : obligaciones.slice(0, 6)

  return (
    <div className="rounded-xl bg-[#a8875a] p-1 shadow-[0_18px_36px_-18px_rgb(15_23_42/0.45)]">
      <div className="rounded-lg bg-[#c9a877] p-2.5 sm:p-3.5">
        {/* Pizarra */}
        <div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-brand-700 via-brand-800 to-brand-800 shadow-[inset_0_2px_10px_rgb(0_0_0/0.35)]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_22%_18%,rgb(255_255_255/0.08),transparent_45%),radial-gradient(ellipse_at_78%_62%,rgb(255_255_255/0.06),transparent_40%),radial-gradient(ellipse_at_45%_95%,rgb(255_255_255/0.05),transparent_35%)]"
            aria-hidden="true"
          />

          <div className="relative flex flex-wrap items-end justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
            <h2 className={cn('font-tiza text-3xl font-bold text-white sm:text-4xl', trazoTiza)}>
              Historial de obligaciones
            </h2>
            <div className="flex gap-5 font-tiza text-xl" role="tablist" aria-label="Filtrar obligaciones">
              {[
                ['todas', 'Todas'],
                ['porPagar', 'Abiertas'],
                ['pagadas', 'Pagadas'],
              ].map(([clave, etiqueta]) => (
                <button
                  key={clave}
                  type="button"
                  role="tab"
                  aria-selected={filtro === clave}
                  onClick={() => onFiltro(clave)}
                  className={cn(
                    'rounded-md px-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/60',
                    trazoTiza,
                    filtro === clave ? 'text-lime-300' : 'text-white/60 hover:text-white',
                  )}
                >
                  {etiqueta}
                  <Garabato className={filtro === clave ? 'visible' : 'invisible'} />
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-3 overflow-x-auto px-3 sm:px-5">
            <table className="w-full min-w-[640px] border-collapse font-tiza text-white">
              <thead>
                <tr className={cn('text-left text-lg text-white/55', trazoTiza)}>
                  <th className="px-2 py-2 font-semibold">Concepto</th>
                  <th className="px-2 py-2 font-semibold">Periodo</th>
                  <th className="px-2 py-2 font-semibold">Vence</th>
                  <th className="px-2 py-2 text-right font-semibold">Valor</th>
                  <th className="px-2 py-2 font-semibold">Estado</th>
                  <th className="px-2 py-2">
                    <span className="sr-only">Acción</span>
                  </th>
                </tr>
              </thead>
              <tbody className={cn('text-xl', trazoTiza)}>
                {visibles.map((o) => {
                  const Icono = o.concepto === 'SERVICIO_PUBLICO' ? Droplets : Landmark
                  return (
                    <tr key={o.id} className="border-t-2 border-dashed border-white/15">
                      <td className="px-2 py-2.5">
                        <span className="flex items-center gap-2.5">
                          <Icono className="size-5 shrink-0 text-white/75" strokeWidth={1.6} />
                          {conceptoObligacion[o.concepto]}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 capitalize text-white/85">{periodoLargo(o.periodo)}</td>
                      <td className="px-2 py-2.5 text-white/85">{fechaCorta(o.fechaVencimiento)}</td>
                      <td className="px-2 py-2.5 text-right text-2xl font-bold tabular-nums">{formatCOP(o.montoTotal)}</td>
                      <td className="px-2 py-2.5">
                        <span className={cn('inline-block text-xl font-bold', tiza[o.estado])}>
                          {estadoObligacion[o.estado].label}
                          {o.estado !== 'PAGADA' && <Garabato />}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        {POR_PAGAR.includes(o.estado) ? (
                          <button
                            type="button"
                            onClick={() => onPagar(o)}
                            className="rounded-lg border-2 border-white/70 px-3 py-0.5 text-lg font-bold text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
                          >
                            Pagar
                          </button>
                        ) : o.estado === 'PAGADA' ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-lg text-white/70 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
                          >
                            <Download className="size-4" strokeWidth={1.8} />
                            Comprobante
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="relative px-5 pb-4 pt-2 text-center sm:px-7">
            {obligaciones.length > 6 && (
              <button
                type="button"
                onClick={onVerTodo}
                className={cn(
                  'rounded-md px-2 font-tiza text-xl text-white/70 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/60',
                  trazoTiza,
                )}
              >
                {verTodo ? '↑ Ver menos' : `Ver las ${obligaciones.length} obligaciones →`}
              </button>
            )}
          </div>
        </div>

        {/* Repisa con tizas y borrador */}
        <div className="relative -mx-2.5 -mb-2.5 mt-2 flex h-4 items-start gap-3 rounded-b-lg bg-[#b8955f] px-8 sm:-mx-3.5 sm:-mb-3.5" aria-hidden="true">
          <span className="-mt-2 h-2 w-8 rounded-sm bg-slate-100 shadow-sm" />
          <span className="-mt-2 h-2 w-5 rounded-sm bg-yellow-100 shadow-sm" />
          {/* Borrador: lomo de madera y felpa gris */}
          <span className="-mt-4 ml-auto flex h-4 w-16 flex-col overflow-hidden rounded-sm shadow-sm">
            <span className="h-2.5 bg-[#8a6a3d]" />
            <span className="flex-1 bg-slate-300" />
          </span>
          <span className="-mt-2 h-2 w-12 rounded-full bg-orange-500 shadow-sm" />
        </div>
      </div>
    </div>
  )
}

TableroTiza.propTypes = {
  obligaciones: PropTypes.array.isRequired,
  filtro: PropTypes.string.isRequired,
  onFiltro: PropTypes.func.isRequired,
  verTodo: PropTypes.bool,
  onVerTodo: PropTypes.func.isRequired,
  onPagar: PropTypes.func.isRequired,
}
