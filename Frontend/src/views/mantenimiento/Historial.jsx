import { motion } from 'motion/react'
import { CalendarDays, CheckCircle2, MapPin } from 'lucide-react'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import { puntoPrioridad } from '../../lib/incidencias'
import { incidencias } from '../../data/mock'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export default function Historial() {
  const resueltas = incidencias.filter((i) => i.estado === 'Resuelta')

  // Agrupadas por mes (fechas dd/mm/aaaa), en el orden en que llegan
  const porMes = resueltas.reduce((acc, i) => {
    const [, m, a] = i.fecha.split('/')
    const clave = `${MESES[Number(m) - 1]} ${a}`
    ;(acc[clave] ??= []).push(i)
    return acc
  }, {})

  const prioridades = ['Alta', 'Media', 'Baja'].map((p) => [p, resueltas.filter((i) => i.prioridad === p).length])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Historial</h1>
        <p className="mt-1 text-sm text-slate-500">Incidencias que ya resolviste</p>
      </div>

      {/* Resumen */}
      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4')}>
        <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="flex size-8 items-center justify-center rounded-lg bg-success-bg text-success-strong">
            <CheckCircle2 className="size-4" />
          </span>
          <span className="text-lg font-extrabold tabular-nums">{resueltas.length}</span> resueltas
        </p>
        {prioridades.map(([p, n]) => (
          <p key={p} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={cn('size-2.5 rounded-full', puntoPrioridad[p])} />
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">{n}</span>
            Prioridad {p.toLowerCase()}
          </p>
        ))}
        <div className="ml-auto hidden h-2.5 w-56 overflow-hidden rounded-full bg-slate-100 sm:flex" aria-hidden="true">
          {prioridades.map(([p, n]) => (
            <span key={p} style={{ flexGrow: n }} className={cn('h-full', puntoPrioridad[p])} />
          ))}
        </div>
      </motion.div>

      {/* Línea de tiempo por mes */}
      {Object.entries(porMes).map(([mes, lista], m) => (
        <motion.section key={mes} {...aparecer(m + 1)}>
          <h2 className="mb-3 flex items-center gap-3 text-sm font-bold text-slate-900">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-[3px] bg-brand-500" />
              {mes}
            </span>
            <span className="h-px flex-1 bg-brand-200" />
            <span className="text-xs font-semibold text-slate-500">
              {lista.length} {lista.length === 1 ? 'resuelta' : 'resueltas'}
            </span>
          </h2>
          <ol className="relative space-y-3 pl-8 before:absolute before:bottom-4 before:left-[11px] before:top-4 before:w-0.5 before:rounded-full before:bg-brand-200">
            {lista.map((inc) => (
              <li key={inc.id} className="relative">
                <span className="absolute -left-8 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white ring-4 ring-brand-50">
                  <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
                </span>
                <article className={cn(tarjeta, 'flex items-stretch overflow-hidden')}>
                  <IlustracionIncidencia categoria={inc.categoria} className="w-20 shrink-0 sm:w-24" />
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-2 p-4">
                    <div className="min-w-0 flex-1 basis-56">
                      <p className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">{inc.id}</span>
                        <span className="text-[11px] font-medium text-slate-400">{inc.categoria}</span>
                      </p>
                      <p className="mt-1.5 font-bold leading-snug text-slate-900">{inc.titulo}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" /> {inc.ubicacion}
                      </span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <CalendarDays className="size-3.5" /> {inc.fecha}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className={cn('size-2 rounded-full', puntoPrioridad[inc.prioridad])} />
                        {inc.prioridad}
                      </span>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </motion.section>
      ))}
    </div>
  )
}
