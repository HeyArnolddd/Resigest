import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Calendar, MapPin, Siren } from 'lucide-react'
import { Avatar } from '../../components/ui'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import Avance from '../../components/incidencias/Avance'
import { incidencias } from '../../data/mock'
import { estilosEstado, puntoEstado, puntoPrioridad } from '../../lib/incidencias'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const filtros = ['Todas', 'Nueva', 'En proceso', 'Resuelta']

export default function Incidencias() {
  const [filtro, setFiltro] = useState('Todas')
  const [soloAlta, setSoloAlta] = useState(false)

  const contar = (f) => (f === 'Todas' ? incidencias.length : incidencias.filter((i) => i.estado === f).length)
  const visible = incidencias.filter((i) => (filtro === 'Todas' || i.estado === filtro) && (!soloAlta || i.prioridad === 'Alta'))
  const resumen = filtros.slice(1).map((e) => [e, contar(e)])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incidencias</h1>
        <p className="mt-1 text-sm text-slate-500">Todas las solicitudes del conjunto y su avance</p>
      </div>

      {/* Resumen */}
      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4')}>
        <p className="text-sm font-bold text-slate-900">{incidencias.length} reportes</p>
        {resumen.map(([e, n]) => (
          <p key={e} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={cn('size-2.5 rounded-full', puntoEstado[e])} />
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">{n}</span>
            {e}
          </p>
        ))}
        <div className="ml-auto hidden h-2.5 w-56 overflow-hidden rounded-full bg-slate-100 sm:flex" aria-hidden="true">
          {resumen.map(([e, n]) => (
            <span key={e} style={{ flexGrow: n }} className={cn('h-full', puntoEstado[e])} />
          ))}
        </div>
      </motion.div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn(tarjeta, 'flex flex-wrap gap-1 p-1.5')} role="tablist" aria-label="Filtrar por estado">
          {filtros.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filtro === f}
              onClick={() => setFiltro(f)}
              className={cn(
                'relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                filtro === f ? 'text-white' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              {filtro === f && (
                <motion.span layoutId="filtro-admin-inc" className="absolute inset-0 rounded-xl bg-brand-600 shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{f}</span>
              <span className={cn('relative rounded-full px-1.5 text-[11px] font-bold tabular-nums', filtro === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500')}>
                {contar(f)}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={soloAlta}
          onClick={() => setSoloAlta((v) => !v)}
          className={cn(
            'flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold outline-none ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
            soloAlta ? 'bg-danger-bg text-danger-strong ring-red-200' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50',
          )}
        >
          <Siren className="size-3.5" /> Solo prioridad alta
        </button>
      </div>

      {visible.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((inc) => (
              <motion.article
                key={inc.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                className={cn(tarjeta, 'flex flex-col overflow-hidden sm:flex-row')}
              >
                <IlustracionIncidencia categoria={inc.categoria} className="h-28 shrink-0 sm:h-auto sm:w-32" />
                <div className="flex min-w-0 flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">{inc.id}</span>
                      <span className="text-[11px] font-medium text-slate-400">{inc.categoria}</span>
                    </span>
                    <span className={cn('whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', estilosEstado[inc.estado])}>{inc.estado}</span>
                  </div>
                  <h2 className="mt-2 font-bold leading-snug text-slate-900">{inc.titulo}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {inc.ubicacion}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" /> {inc.fecha}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={cn('size-2 rounded-full', puntoPrioridad[inc.prioridad])} />
                      Prioridad {inc.prioridad.toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <Avance estado={inc.estado} />
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Avatar nombre={inc.solicitante} size="sm" className="size-6 text-[10px]" />
                    Reportó <span className="font-semibold text-slate-700">{inc.solicitante}</span>
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className={cn(tarjeta, 'px-6 py-12 text-center')}>
          <p className="text-sm font-bold text-slate-900">Sin incidencias para mostrar</p>
          <p className="mt-1 text-xs text-slate-500">Cambia el filtro para ver otras solicitudes.</p>
        </div>
      )}
    </div>
  )
}
