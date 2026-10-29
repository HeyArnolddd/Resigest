import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { ArrowRight, MapPin, Siren } from 'lucide-react'
import { Titulo, VerMas } from '../../components/ui/Panel'
import EscenaTaller from '../../components/mantenimiento/EscenaTaller'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import { estilosEstado, puntoPrioridad } from '../../lib/incidencias'
import { incidencias } from '../../data/mock'
import { aparecer, tarjeta } from '../../lib/panel'
import { useAhora } from '../../lib/useAhora'
import { cn, saludo } from '../../lib/utils'

export default function Inicio({ onNavigate }) {
  const ahora = useAhora()
  const contar = (estado) => incidencias.filter((i) => i.estado === estado).length
  const abiertas = incidencias.filter((i) => ['Nueva', 'En proceso'].includes(i.estado))
  const urgentes = abiertas.filter((i) => i.prioridad === 'Alta')
  const nuevas = incidencias.filter((i) => i.estado === 'Nueva').slice(0, 5)
  const fecha = ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  const resumen = [
    ['Nuevas', contar('Nueva'), 'bg-sky-500', 'Por revisar'],
    ['En proceso', contar('En proceso'), 'bg-warning', 'Trabajo en curso'],
    ['Resueltas', contar('Resuelta'), 'bg-success', 'Este mes'],
  ]

  // Abiertas por categoría, de mayor a menor
  const porCategoria = Object.entries(
    abiertas.reduce((acc, i) => ({ ...acc, [i.categoria]: (acc[i.categoria] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])
  const maxCategoria = Math.max(...porCategoria.map(([, n]) => n), 1)

  return (
    <div className="space-y-5">
      {/* Bienvenida */}
      <motion.section {...aparecer(0)} className={cn(tarjeta, 'grid overflow-hidden md:grid-cols-[1fr_minmax(0,380px)]')}>
        <div className="p-6">
          <p className="text-sm font-semibold text-brand-700 first-letter:uppercase">{fecha}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{saludo(ahora)}, Jorge</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tienes <span className="font-semibold text-slate-800">{abiertas.length} incidencias abiertas</span>
            {urgentes.length > 0 && (
              <>
                , <span className="font-semibold text-danger-strong">{urgentes.length} con prioridad alta</span>
              </>
            )}
            .
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {resumen.map(([etiqueta, valor, punto, sub]) => (
              <button
                key={etiqueta}
                type="button"
                onClick={() => onNavigate(etiqueta === 'Resueltas' ? 'historial' : 'incidencias')}
                className="group rounded-xl bg-slate-50 px-3 py-2.5 text-left outline-none ring-1 ring-slate-100 transition-colors hover:bg-brand-50/60 hover:ring-brand-100 focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <span className="block text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{valor}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className={cn('size-2 shrink-0 rounded-full', punto)} />
                  {etiqueta}
                </span>
                <span className="hidden text-[11px] text-slate-400 sm:block">{sub}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="hidden items-end bg-gradient-to-b from-brand-50/40 to-brand-50 md:flex">
          <EscenaTaller className="h-48 w-full" />
        </div>
      </motion.section>

      {/* Urgentes */}
      {urgentes.length > 0 && (
        <motion.section {...aparecer(1)}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex size-6 items-center justify-center rounded-md bg-danger-bg text-danger-strong">
              <Siren className="size-3.5" />
            </span>
            Prioridad alta
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {urgentes.map((inc) => (
              <button
                key={inc.id}
                type="button"
                onClick={() => onNavigate('incidencias')}
                className={cn(
                  tarjeta,
                  'group flex overflow-hidden text-left outline-none ring-1 ring-red-100 transition-shadow hover:ring-red-200 focus-visible:ring-2 focus-visible:ring-brand-500',
                )}
              >
                <IlustracionIncidencia categoria={inc.categoria} className="w-28 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">{inc.id}</span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', estilosEstado[inc.estado])}>{inc.estado}</span>
                  </div>
                  <p className="mt-2 font-bold leading-snug text-slate-900">{inc.titulo}</p>
                  <p className="mt-auto flex items-center gap-1 pt-2 text-xs text-slate-500">
                    <MapPin className="size-3.5" /> {inc.ubicacion} · {inc.fecha}
                  </p>
                </div>
                <span className="flex items-center pr-4 text-slate-300 transition-colors group-hover:text-brand-600">
                  <ArrowRight className="size-5" />
                </span>
              </button>
            ))}
          </div>
        </motion.section>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Por revisar */}
        <motion.section {...aparecer(2)} className={cn(tarjeta, 'p-5 lg:col-span-2')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('incidencias')}>Ver todas</VerMas>}>Solicitudes por revisar</Titulo>
          <ul className="mt-3 divide-y divide-slate-100">
            {nuevas.map((inc) => (
              <li key={inc.id}>
                <button
                  type="button"
                  onClick={() => onNavigate('incidencias')}
                  className="flex w-full items-center gap-3 rounded-lg py-2.5 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <IlustracionIncidencia categoria={inc.categoria} className="size-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{inc.titulo}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {inc.categoria} · {inc.ubicacion}
                    </p>
                  </div>
                  <span className="hidden items-center gap-1.5 whitespace-nowrap text-xs text-slate-500 sm:flex">
                    <span className={cn('size-2 rounded-full', puntoPrioridad[inc.prioridad])} />
                    {inc.prioridad}
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400 tabular-nums">{inc.fecha.slice(0, 5)}</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Por categoría */}
        <motion.section {...aparecer(3)} className={cn(tarjeta, 'p-5')}>
          <Titulo>Abiertas por categoría</Titulo>
          <ul className="mt-4 space-y-3">
            {porCategoria.map(([categoria, n], i) => (
              <li key={categoria}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{categoria}</span>
                  <span className="font-bold text-slate-900 tabular-nums">{n}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-brand-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(n / maxCategoria) * 100}%` }}
                    transition={{ delay: 0.2 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  )
}

Inicio.propTypes = { onNavigate: PropTypes.func.isRequired }
