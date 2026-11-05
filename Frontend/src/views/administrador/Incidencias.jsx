import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Calendar, CheckCircle2, MapPin, RotateCcw, Siren, UserCog, Wrench } from 'lucide-react'
import { ArchivoProtegido, Avatar, Button, EmptyState, Select } from '../../components/ui'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import Avance from '../../components/incidencias/Avance'
import { adminApi, useCarga } from '../../lib/admin'
import { estadoIncidencia, prioridadIncidencia } from '../../lib/labels'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const FILTROS = ['TODAS', ...Object.keys(estadoIncidencia)]
const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const codigo = (id) => `INC-${String(id).padStart(3, '0')}`

const cargarTodo = () => Promise.all([adminApi.incidencias(), adminApi.tecnicos()]).then(([incidencias, tecnicos]) => ({ incidencias, tecnicos }))

// El administrador asigna un técnico mientras la incidencia está abierta
function Asignacion({ incidencia, tecnicos, onAsignado }) {
  const [tecnicoId, setTecnicoId] = useState(incidencia.asignadoAId ? String(incidencia.asignadoAId) : '')
  const [trabajando, setTrabajando] = useState(false)
  const [error, setError] = useState('')

  if (!tecnicos.length) {
    return <p className="text-xs text-slate-500">Crea una cuenta de mantenimiento en Usuarios para poder asignar esta incidencia.</p>
  }

  const asignar = async () => {
    setTrabajando(true)
    setError('')
    try {
      await adminApi.asignarIncidencia(incidencia.id, Number(tecnicoId))
      onAsignado()
    } catch (e) {
      setError(e.message)
      setTrabajando(false)
    }
  }

  const sinCambios = !tecnicoId
  return (
    <div>
      <div className="flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Técnico para {codigo(incidencia.id)}</span>
          <Select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} className="h-9 text-sm">
            <option value="">Elige un técnico</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombreCompleto}
                {t.especialidad ? ` · ${t.especialidad}` : ''}
              </option>
            ))}
          </Select>
        </label>
        <Button size="sm" icon={UserCog} className="h-9" disabled={sinCambios || trabajando} onClick={asignar}>
          Asignar
        </Button>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger-strong">{error}</p>}
    </div>
  )
}

Asignacion.propTypes = { incidencia: PropTypes.object.isRequired, tecnicos: PropTypes.array.isRequired, onAsignado: PropTypes.func.isRequired }

export default function Incidencias() {
  const { datos, error, recargar } = useCarga(cargarTodo, 'admin:incidencias')
  const [filtro, setFiltro] = useState('TODAS')
  const [soloAlta, setSoloAlta] = useState(false)

  const encabezado = (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incidencias</h1>
      <p className="mt-1 text-sm text-slate-500">Reportes del conjunto, su avance y el técnico a cargo</p>
    </div>
  )

  if (error || !datos) {
    return (
      <div className="space-y-5">
        {encabezado}
        {error ? (
          <div className={tarjeta}>
            <EmptyState
              icon={AlertCircle}
              title="No se pudieron cargar las incidencias"
              description={error}
              action={
                <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                  Intentar de nuevo
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2" role="status" aria-label="Cargando incidencias">
            {[0, 1].map((i) => (
              <div key={i} className={cn(tarjeta, 'h-56 animate-pulse')} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const { incidencias, tecnicos } = datos
  const contar = (f) => (f === 'TODAS' ? incidencias.length : incidencias.filter((i) => i.estado === f).length)
  const visible = incidencias.filter((i) => (filtro === 'TODAS' || i.estado === filtro) && (!soloAlta || i.prioridad === 'ALTA'))
  const resumen = Object.entries(estadoIncidencia).map(([clave, e]) => [clave, e, contar(clave)])

  return (
    <div className="space-y-5">
      {encabezado}

      {incidencias.length === 0 ? (
        <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-col items-center gap-2 px-6 py-14 text-center')}>
          <span className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success-strong">
            <CheckCircle2 className="size-6" />
          </span>
          <p className="text-sm font-bold text-slate-900">No hay incidencias reportadas</p>
          <p className="max-w-sm text-xs text-slate-500">
            Cuando un residente o portería reporte un daño aparecerá aquí, y podrás asignarlo a un técnico de mantenimiento.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Resumen */}
          <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4')}>
            <p className="text-sm font-bold text-slate-900">{incidencias.length === 1 ? '1 reporte' : `${incidencias.length} reportes`}</p>
            {resumen.map(([clave, e, n]) => (
              <p key={clave} className="flex items-center gap-2 text-sm text-slate-600">
                <span className={cn('size-2.5 rounded-full', e.punto)} />
                <span className="text-lg font-extrabold text-slate-900 tabular-nums">{n}</span>
                {e.label}
              </p>
            ))}
          </motion.div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={cn(tarjeta, 'flex flex-wrap gap-1 p-1.5')} role="tablist" aria-label="Filtrar por estado">
              {FILTROS.map((f) => (
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
                  <span className="relative">{f === 'TODAS' ? 'Todas' : estadoIncidencia[f].label}</span>
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
                {visible.map((inc) => {
                  const estado = estadoIncidencia[inc.estado]
                  const prioridad = prioridadIncidencia[inc.prioridad]
                  return (
                    <motion.article
                      key={inc.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                      className={cn(tarjeta, 'flex flex-col overflow-hidden sm:flex-row')}
                    >
                      <IlustracionIncidencia categoria={inc.categoria ?? 'Otro'} className="h-28 shrink-0 sm:h-auto sm:w-32" />
                      <div className="flex min-w-0 flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex items-center gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">{codigo(inc.id)}</span>
                            {inc.categoria && <span className="text-[11px] font-medium text-slate-400">{inc.categoria}</span>}
                          </span>
                          <span className={cn('whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', estado.chip)}>{estado.label}</span>
                        </div>
                        <h2 className="mt-2 font-bold leading-snug text-slate-900">{inc.titulo}</h2>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{inc.descripcion}</p>
                        {inc.evidencias?.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {inc.evidencias.map((url) => (
                              <ArchivoProtegido key={url} url={url} alt={`Evidencia de ${inc.titulo}`} className="size-14" />
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          {inc.ubicacion && (
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3.5" /> {inc.ubicacion}
                            </span>
                          )}
                          {inc.fechaReporte && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5" /> {fmtFecha(inc.fechaReporte)}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <span className={cn('size-2 rounded-full', prioridad.punto)} />
                            Prioridad {prioridad.label.toLowerCase()}
                          </span>
                        </div>
                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <Avance estado={estado.paso} />
                        </div>
                        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <Avatar nombre={inc.reportadoPorNombre} size="sm" className="size-6 text-[10px]" />
                          Reportó <span className="font-semibold text-slate-700">{inc.reportadoPorNombre}</span>
                          {inc.apartamento && <span>· {inc.apartamento}</span>}
                        </p>
                        {inc.asignadoANombre && (
                          <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <Wrench className="size-3.5" /> A cargo de <span className="font-semibold text-slate-700">{inc.asignadoANombre}</span>
                          </p>
                        )}
                        {['RESUELTA', 'CERRADA'].includes(inc.estado) && inc.solucion && (
                          <div className="mt-3 flex gap-3 rounded-xl bg-success-bg px-3 py-2 text-xs text-success-strong">
                            {inc.fotoSolucionUrl && <ArchivoProtegido url={inc.fotoSolucionUrl} alt="Foto del trabajo terminado" className="size-14 shrink-0" />}
                            <p>
                              <span className="font-semibold">{inc.estado === 'CERRADA' ? 'Confirmada por el residente. ' : 'Esperando que el residente confirme. '}</span>
                              Solución: {inc.solucion}
                            </p>
                          </div>
                        )}
                        {inc.estado === 'EN_PROCESO' && inc.observacionConfirmacion && (
                          <p className="mt-3 rounded-xl bg-warning-bg px-3 py-2 text-xs text-warning-strong">
                            <span className="font-semibold">Reabierta por el residente:</span> {inc.observacionConfirmacion}
                          </p>
                        )}
                        {inc.estado === 'ABIERTA' && (
                          <div className="mt-3">
                            <Asignacion incidencia={inc} tecnicos={tecnicos} onAsignado={recargar} />
                          </div>
                        )}
                      </div>
                    </motion.article>
                  )
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className={cn(tarjeta, 'px-6 py-12 text-center')}>
              <p className="text-sm font-bold text-slate-900">Ninguna incidencia con este filtro</p>
              <p className="mt-1 text-xs text-slate-500">Cambia el filtro para ver otras solicitudes.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
