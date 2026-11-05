import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CalendarDays, Check, CheckCircle2, ClipboardList, MapPin, Paperclip, Play, RotateCcw } from 'lucide-react'
import { ArchivoProtegido, Avatar, Button, EmptyState, Field, Modal, Textarea } from '../../components/ui'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import Avance from '../../components/incidencias/Avance'
import { estilosEstado, incidenciasApi, puntoEstado, puntoPrioridad } from '../../lib/incidencias'
import { useCarga } from '../../lib/useCarga'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const FILTROS = ['Todas', 'Asignada', 'En proceso', 'Resuelta']
const etiquetaFiltro = { Asignada: 'Por empezar' }

export default function Incidencias() {
  const { datos: lista, error, recargar } = useCarga(incidenciasApi.asignadas)
  const [filtro, setFiltro] = useState('Todas')
  const [seleccionada, setSeleccionada] = useState(null)
  const [resolviendo, setResolviendo] = useState(false)
  const [solucion, setSolucion] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [trabajando, setTrabajando] = useState(false)
  const detalle = useRef(null)

  const incidencias = lista ?? []
  const visible = filtro === 'Todas' ? incidencias : incidencias.filter((i) => i.estado === filtro)
  const actual = incidencias.find((i) => i.id === seleccionada) ?? visible[0]
  const contar = (f) => (f === 'Todas' ? incidencias.length : incidencias.filter((i) => i.estado === f).length)

  const seleccionar = (id) => {
    setSeleccionada(id)
    setErrorAccion('')
    // En pantallas angostas el detalle queda debajo de la lista
    if (window.innerWidth < 1024) setTimeout(() => detalle.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const ejecutar = async (accion) => {
    setTrabajando(true)
    setErrorAccion('')
    try {
      await accion()
      setResolviendo(false)
      setSolucion('')
      recargar()
    } catch (e) {
      setErrorAccion(e.message)
    } finally {
      setTrabajando(false)
    }
  }
  const empezar = () => ejecutar(() => incidenciasApi.iniciar(actual.id))
  const resolver = () => {
    if (!solucion.trim()) {
      setErrorAccion('Cuenta brevemente qué hiciste para solucionarlo.')
      return
    }
    ejecutar(() => incidenciasApi.resolver(actual.id, solucion.trim()))
  }

  const encabezado = (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incidencias</h1>
      <p className="mt-1 text-sm text-slate-500">Los trabajos que la administración te asignó</p>
    </div>
  )

  if (error) {
    return (
      <div className="space-y-5">
        {encabezado}
        <div className={tarjeta}>
          <EmptyState
            icon={AlertCircle}
            title="No se pudieron cargar tus incidencias"
            description={error}
            action={
              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                Intentar de nuevo
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {encabezado}

      {/* Filtros con conteo */}
      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-2 p-2')} role="tablist" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
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
            <span className="relative">{etiquetaFiltro[f] ?? f}</span>
            <span className={cn('relative rounded-full px-1.5 text-[11px] font-bold tabular-nums', filtro === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
              {lista ? contar(f) : '–'}
            </span>
          </button>
        ))}
      </motion.div>

      {!lista ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]" role="status" aria-label="Cargando incidencias">
          <div className={cn(tarjeta, 'h-72 animate-pulse')} />
          <div className={cn(tarjeta, 'h-72 animate-pulse')} />
        </div>
      ) : incidencias.length === 0 ? (
        <div className={cn(tarjeta, 'flex flex-col items-center gap-2 px-6 py-14 text-center')}>
          <span className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success-strong">
            <ClipboardList className="size-6" />
          </span>
          <p className="text-sm font-bold text-slate-900">No tienes incidencias asignadas</p>
          <p className="max-w-sm text-xs text-slate-500">Cuando la administración te asigne un trabajo aparecerá aquí, y te llegará una notificación.</p>
        </div>
      ) : (
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
                      <p className="text-sm font-bold leading-snug text-slate-900">{inc.titulo}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {inc.ubicacion} · {inc.fecha}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <span className={cn('size-2 rounded-full', puntoPrioridad[inc.prioridad])} />
                          {inc.prioridad}
                        </span>
                        <span className={cn('whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1', estilosEstado[inc.estado])}>
                          {etiquetaFiltro[inc.estado] ?? inc.estado}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
            {visible.length === 0 && <li className={cn(tarjeta, 'px-5 py-10 text-center text-sm text-slate-500')}>No hay incidencias en este estado.</li>}
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
                        {actual.codigo} · {actual.categoria}
                      </span>
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ring-1', estilosEstado[actual.estado])}>
                        {etiquetaFiltro[actual.estado] ?? actual.estado}
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

                    <div className="mt-5 rounded-xl bg-slate-50 px-4 pb-3 pt-4 ring-1 ring-slate-100">
                      <Avance estado={actual.paso} />
                    </div>

                    <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{actual.descripcion}</p>

                    {actual.evidencias.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Paperclip className="size-3.5" /> Fotos que adjuntó quien reportó
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {actual.evidencias.map((url) => (
                            <ArchivoProtegido key={url} url={url} alt={`Evidencia de ${actual.titulo}`} className="size-24" />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                      <Avatar nombre={actual.solicitante} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500">Reportó</p>
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {actual.solicitante}
                          {actual.apartamento && <span className="font-normal text-slate-500"> · {actual.apartamento}</span>}
                        </p>
                      </div>
                    </div>

                    {errorAccion && !resolviendo && (
                      <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-strong">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        {errorAccion}
                      </p>
                    )}

                    {/* Acciones según el estado */}
                    {actual.estado === 'Asignada' && (
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-3.5 ring-1 ring-brand-100">
                        <p className="text-sm font-semibold text-brand-800">¿Vas a empezar este trabajo?</p>
                        <Button icon={Play} disabled={trabajando} onClick={empezar}>
                          Empezar trabajo
                        </Button>
                      </div>
                    )}
                    {actual.estado === 'En proceso' && (
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 p-3.5 ring-1 ring-brand-100">
                        <p className="text-sm font-semibold text-brand-800">¿Terminaste el trabajo?</p>
                        <Button icon={Check} onClick={() => setResolviendo(true)}>
                          Marcar como resuelta
                        </Button>
                      </div>
                    )}
                    {actual.estado === 'Resuelta' && (
                      <div className="mt-5 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-strong">
                        <p className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="size-4 shrink-0" /> Resuelta. Se le avisó a quien la reportó.
                        </p>
                        {actual.solucion && <p className="mt-1.5 pl-6 text-[13px]">{actual.solucion}</p>}
                      </div>
                    )}
                  </div>
                </motion.article>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <Modal
        open={resolviendo}
        onClose={() => setResolviendo(false)}
        title="Marcar como resuelta"
        subtitle={actual?.titulo}
        icon={CheckCircle2}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResolviendo(false)}>
              Cancelar
            </Button>
            <Button variant="success" icon={Check} disabled={trabajando} onClick={resolver}>
              {trabajando ? 'Guardando…' : 'Confirmar solución'}
            </Button>
          </>
        }
      >
        <Field label="¿Qué hiciste?" htmlFor="m-solucion" required error={errorAccion} hint="Quien reportó la incidencia verá este mensaje.">
          <Textarea
            id="m-solucion"
            value={solucion}
            onChange={(e) => {
              setSolucion(e.target.value)
              setErrorAccion('')
            }}
            placeholder="Ej. Se cambió el empaque de la llave y se revisó que no haya más goteo"
          />
        </Field>
      </Modal>
    </div>
  )
}
