import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Ban, CalendarDays, Check, CheckCircle2, MapPin, Paperclip, Play, X } from 'lucide-react'
import { Avatar, Button, Field, Modal, Textarea } from '../../components/ui'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import Avance from '../../components/incidencias/Avance'
import { estilosEstado, puntoEstado, puntoPrioridad } from '../../lib/incidencias'
import { incidencias } from '../../data/mock'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const filtros = ['Todas', 'Nueva', 'En proceso', 'Resuelta']

export default function Incidencias() {
  const [lista, setLista] = useState(incidencias)
  const [filtro, setFiltro] = useState('Todas')
  const [seleccionada, setSeleccionada] = useState(incidencias[0]?.id)
  const [modalRechazo, setModalRechazo] = useState(false)
  const detalle = useRef(null)

  const visible = filtro === 'Todas' ? lista : lista.filter((i) => i.estado === filtro)
  const actual = lista.find((i) => i.id === seleccionada) || lista[0]
  const contar = (f) => (f === 'Todas' ? lista.length : lista.filter((i) => i.estado === f).length)

  const cambiarEstado = (estado) => setLista(lista.map((i) => (i.id === actual.id ? { ...i, estado } : i)))
  const rechazar = () => {
    cambiarEstado('Rechazada')
    setModalRechazo(false)
  }

  const seleccionar = (id) => {
    setSeleccionada(id)
    // En pantallas angostas el detalle queda debajo de la lista
    if (window.innerWidth < 1024) setTimeout(() => detalle.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incidencias</h1>
        <p className="mt-1 text-sm text-slate-500">Gestión de solicitudes de los residentes</p>
      </div>

      {/* Filtros con conteo */}
      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-2 p-2')} role="tablist" aria-label="Filtrar por estado">
        {filtros.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filtro === f}
            onClick={() => setFiltro(f)}
            className={cn(
              'relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
              filtro === f ? 'text-white' : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            {filtro === f && (
              <motion.span layoutId="filtro-mant" className="absolute inset-0 rounded-xl bg-brand-600 shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            {f !== 'Todas' && <span className={cn('relative size-2 rounded-full', puntoEstado[f], filtro === f && 'ring-2 ring-white/60')} />}
            <span className="relative">{f}</span>
            <span
              className={cn(
                'relative rounded-full px-1.5 text-[11px] font-bold tabular-nums',
                filtro === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
              )}
            >
              {contar(f)}
            </span>
          </button>
        ))}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* Lista */}
        <ul className="space-y-2.5 lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto lg:p-1 lg:pr-2">
          {visible.map((inc) => {
            const activa = actual?.id === inc.id
            return (
              <li key={inc.id}>
                <button
                  type="button"
                  onClick={() => seleccionar(inc.id)}
                  aria-current={activa}
                  className={cn(
                    tarjeta,
                    'flex w-full items-stretch overflow-hidden text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
                    activa ? 'ring-2 ring-brand-500' : 'hover:-translate-y-0.5',
                  )}
                >
                  <IlustracionIncidencia categoria={inc.categoria} className="w-20 shrink-0" />
                  <div className="min-w-0 flex-1 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold leading-snug text-slate-900">{inc.titulo}</p>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {inc.ubicacion} · {inc.fecha}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <span className={cn('size-2 rounded-full', puntoPrioridad[inc.prioridad])} />
                        {inc.prioridad}
                      </span>
                      <span className={cn('whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', estilosEstado[inc.estado])}>
                        {inc.estado}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
          {visible.length === 0 && (
            <li className={cn(tarjeta, 'px-5 py-10 text-center text-sm text-slate-500')}>No hay incidencias en este estado.</li>
          )}
        </ul>

        {/* Detalle */}
        <div ref={detalle} className="scroll-mt-4">
          <AnimatePresence mode="wait">
            {actual && (
              <motion.article
                key={actual.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className={cn(tarjeta, 'overflow-hidden')}
              >
                <div className="relative">
                  <IlustracionIncidencia categoria={actual.categoria} className="h-40 w-full" />
                  <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-white/90 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 shadow-sm">
                      {actual.id} · {actual.categoria}
                    </span>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ring-1', estilosEstado[actual.estado])}>
                      {actual.estado}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h2 className="text-xl font-bold leading-snug tracking-tight text-slate-900">{actual.titulo}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {actual.ubicacion}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" /> {actual.fecha}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={cn('size-2 rounded-full', puntoPrioridad[actual.prioridad])} />
                      Prioridad {actual.prioridad.toLowerCase()}
                    </span>
                  </div>

                  {actual.estado === 'Rechazada' ? (
                    <p className="mt-5 flex items-center gap-2 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-strong">
                      <Ban className="size-4 shrink-0" /> Rechazaste esta solicitud. Se notificó al residente.
                    </p>
                  ) : (
                    <div className="mt-5 rounded-xl bg-slate-50 px-4 pb-3 pt-4 ring-1 ring-slate-100">
                      <Avance estado={actual.estado} />
                    </div>
                  )}

                  <p className="mt-5 text-sm leading-relaxed text-slate-700">{actual.descripcion}</p>

                  {actual.evidencia && (
                    <div className="mt-5">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Paperclip className="size-3.5" /> Evidencia adjunta
                      </p>
                      <div className="flex gap-3">
                        {[0, 1].map((n) => (
                          <div
                            key={n}
                            className={cn(
                              'flex size-24 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200',
                              n ? 'rotate-2' : '-rotate-2',
                            )}
                          >
                            <IlustracionIncidencia categoria={actual.categoria} className="size-full rounded-lg" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <Avatar nombre={actual.solicitante} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500">Reportó</p>
                      <p className="truncate text-sm font-semibold text-slate-800">{actual.solicitante}</p>
                    </div>
                  </div>

                  {/* Acciones según el estado */}
                  {actual.estado === 'Nueva' && (
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      <Button variant="secondary" icon={X} onClick={() => setModalRechazo(true)}>
                        Rechazar solicitud
                      </Button>
                      <Button icon={Play} onClick={() => cambiarEstado('En proceso')}>
                        Aceptar y empezar
                      </Button>
                    </div>
                  )}
                  {actual.estado === 'En proceso' && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-3.5 ring-1 ring-brand-100">
                      <p className="text-sm font-semibold text-brand-800">¿Terminaste el trabajo?</p>
                      <Button icon={Check} onClick={() => cambiarEstado('Resuelta')}>
                        Marcar como resuelta
                      </Button>
                    </div>
                  )}
                  {actual.estado === 'Resuelta' && (
                    <p className="mt-5 flex items-center gap-2 rounded-xl bg-success-bg px-4 py-3 text-sm font-medium text-success-strong">
                      <CheckCircle2 className="size-4 shrink-0" /> Resuelta. El residente confirmará si quedó solucionada.
                    </p>
                  )}
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        open={modalRechazo}
        onClose={() => setModalRechazo(false)}
        title="Rechazar solicitud"
        subtitle={actual?.titulo}
        icon={Ban}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalRechazo(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={rechazar}>
              Confirmar rechazo
            </Button>
          </>
        }
      >
        <Field label="Motivo del rechazo" hint="El residente verá este mensaje">
          <Textarea placeholder="Ej. No corresponde a zonas comunes, debe gestionarlo el propietario…" />
        </Field>
      </Modal>
    </div>
  )
}
