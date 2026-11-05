import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Building2, CalendarDays, CalendarRange, Check, CheckCircle2, Clock, RotateCcw, X } from 'lucide-react'
import { Button, EmptyState, Field, Modal, StatusBadge, Textarea } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import CalendarioReservas from '../../components/reservas/CalendarioReservas'
import IlustracionZona from '../../components/reservas/IlustracionZona'
import { adminApi, useCarga } from '../../lib/admin'
import { estadoReserva } from '../../lib/labels'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'
import { colorZona } from '../../lib/zonas'

const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
const fmtHorario = (r) => `${r.fechaInicio.slice(11, 16)} – ${r.fechaFin.slice(11, 16)}`

// El calendario muestra quién reservó; la reserva solo trae el apartamento
const cargarTodo = () =>
  Promise.all([adminApi.zonas(), adminApi.reservas()]).then(([zonas, reservas]) => ({
    zonas: zonas.filter((z) => z.activa),
    reservas: reservas.map((r) => ({ ...r, residente: r.apartamento })),
  }))

function Solicitud({ reserva, onAprobar, onRechazar, onVer, ocupado }) {
  const color = colorZona(reserva.zonaComunId)
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn(tarjeta, 'flex flex-col overflow-hidden')}
    >
      <button type="button" onClick={() => onVer(reserva)} className="relative h-28 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500" aria-label={`Ver detalle de ${reserva.zonaComunNombre}`}>
        <IlustracionZona nombre={reserva.zonaComunNombre} />
        <span className={cn('absolute left-3 top-3 rounded-md px-2 py-0.5 text-[11px] font-bold shadow-sm', color.solido)}>{reserva.zonaComunNombre}</span>
      </button>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Building2 className="size-4 text-slate-400" /> {reserva.apartamento}
        </p>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <span className="flex items-center gap-1 first-letter:uppercase">
            <CalendarDays className="size-3.5 text-slate-400" /> {fmtFecha(reserva.fechaInicio)}
          </span>
          <span className="flex items-center gap-1 tabular-nums">
            <Clock className="size-3.5 text-slate-400" /> {fmtHorario(reserva)}
          </span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" icon={X} disabled={ocupado} onClick={() => onRechazar(reserva)}>
            Rechazar
          </Button>
          <Button size="sm" icon={Check} disabled={ocupado} onClick={() => onAprobar(reserva)}>
            Aprobar
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

Solicitud.propTypes = {
  reserva: PropTypes.object.isRequired,
  onAprobar: PropTypes.func.isRequired,
  onRechazar: PropTypes.func.isRequired,
  onVer: PropTypes.func.isRequired,
  ocupado: PropTypes.bool,
}

export default function Reservas() {
  const { datos, error, recargar } = useCarga(cargarTodo, 'admin:reservas')
  const [detalle, setDetalle] = useState(null)
  const [rechazo, setRechazo] = useState(null)
  const [motivo, setMotivo] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const [trabajando, setTrabajando] = useState(false)

  const encabezado = (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reservas</h1>
      <p className="mt-1 text-sm text-slate-500">Agenda de zonas comunes y solicitudes por aprobar</p>
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
              title="No se pudieron cargar las reservas"
              description={error}
              action={
                <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                  Intentar de nuevo
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-5" role="status" aria-label="Cargando reservas">
            <div className={cn(tarjeta, 'h-16 animate-pulse')} />
            <div className={cn(tarjeta, 'h-96 animate-pulse')} />
          </div>
        )}
      </div>
    )
  }

  const { zonas, reservas } = datos
  const pendientes = reservas.filter((r) => r.estado === 'PENDIENTE').sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
  const aprobadas = reservas.filter((r) => r.estado === 'APROBADA')
  const masUsada = zonas
    .map((z) => [z.nombre, aprobadas.filter((r) => r.zonaComunId === z.id).length])
    .sort((a, b) => b[1] - a[1])[0]

  const ejecutar = async (accion) => {
    setTrabajando(true)
    setErrorAccion('')
    try {
      await accion()
      setDetalle(null)
      setRechazo(null)
      setMotivo('')
      recargar()
    } catch (e) {
      setErrorAccion(e.message)
    } finally {
      setTrabajando(false)
    }
  }
  const aprobar = (r) => ejecutar(() => adminApi.aprobarReserva(r.id))
  const pedirRechazo = (r) => {
    setDetalle(null)
    setErrorAccion('')
    setRechazo(r)
  }
  const rechazar = () => {
    if (!motivo.trim()) {
      setErrorAccion('Escribe el motivo para que el residente sepa por qué.')
      return
    }
    ejecutar(() => adminApi.rechazarReserva(rechazo.id, motivo.trim()))
  }

  const estadoDetalle = detalle && estadoReserva[detalle.estado]

  return (
    <div className="space-y-5">
      {encabezado}

      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4')}>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <span className="size-2.5 rounded-full bg-warning" />
          <span className="text-lg font-extrabold text-slate-900 tabular-nums">{pendientes.length}</span> por aprobar
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <span className="size-2.5 rounded-full bg-success" />
          <span className="text-lg font-extrabold text-slate-900 tabular-nums">{aprobadas.length}</span> aprobadas
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <span className="size-2.5 rounded-full bg-brand-500" />
          Zona más usada: <span className="font-bold text-slate-900">{masUsada?.[1] ? masUsada[0] : 'todavía ninguna'}</span>
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 sm:ml-auto">
          {zonas.map((z) => (
            <span key={z.id} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className={cn('size-2 rounded-full', colorZona(z.id).punto)} />
              {z.nombre}
            </span>
          ))}
        </div>
      </motion.div>

      {errorAccion && !rechazo && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-strong">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {errorAccion}
        </p>
      )}

      {/* Solicitudes */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="size-2.5 rounded-[3px] bg-brand-500" />
          Solicitudes por aprobar
        </h2>
        {pendientes.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {pendientes.map((r) => (
                <Solicitud key={r.id} reserva={r} ocupado={trabajando} onAprobar={aprobar} onRechazar={pedirRechazo} onVer={setDetalle} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className={cn(tarjeta, 'flex flex-col items-center gap-2 px-6 py-10 text-center')}>
            <span className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success-strong">
              <CheckCircle2 className="size-6" />
            </span>
            <p className="text-sm font-bold text-slate-900">No hay solicitudes por aprobar</p>
            <p className="text-xs text-slate-500">Las reservas que hagan los residentes aparecerán aquí.</p>
          </div>
        )}
      </section>

      <motion.section {...aparecer(1)} className={cn(tarjeta, 'p-4 sm:p-5')}>
        <Titulo>Agenda de zonas comunes</Titulo>
        {zonas.length ? (
          <CalendarioReservas reservas={reservas} zonas={zonas} onSelect={setDetalle} className="mt-4" />
        ) : (
          <p className="mt-4 text-sm text-slate-500">El conjunto no tiene zonas comunes registradas.</p>
        )}
      </motion.section>

      <Modal
        open={Boolean(detalle)}
        onClose={() => setDetalle(null)}
        title="Detalle de la reserva"
        subtitle={detalle?.apartamento}
        icon={CalendarRange}
        footer={
          detalle?.estado === 'PENDIENTE' ? (
            <>
              <Button variant="secondary" icon={X} onClick={() => pedirRechazo(detalle)}>
                Rechazar
              </Button>
              <Button icon={Check} disabled={trabajando} onClick={() => aprobar(detalle)}>
                Aprobar reserva
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setDetalle(null)}>
              Cerrar
            </Button>
          )
        }
      >
        {detalle && (
          <div className="space-y-4">
            <div className="h-36 overflow-hidden rounded-xl">
              <IlustracionZona nombre={detalle.zonaComunNombre} />
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Zona</dt>
                <dd className="mt-1 flex items-center gap-2 font-medium text-slate-800">
                  <span className={cn('size-2.5 rounded-full', colorZona(detalle.zonaComunId).punto)} />
                  {detalle.zonaComunNombre}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Estado</dt>
                <dd className="mt-1">
                  <StatusBadge status={estadoDetalle.label} tone={estadoDetalle.tone} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fecha</dt>
                <dd className="mt-1 font-medium text-slate-800 first-letter:uppercase">{fmtFecha(detalle.fechaInicio)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Horario</dt>
                <dd className="mt-1 font-medium text-slate-800 tabular-nums">{fmtHorario(detalle)}</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(rechazo)}
        onClose={() => setRechazo(null)}
        title="Justificar rechazo"
        subtitle={rechazo ? `${rechazo.apartamento} · ${rechazo.zonaComunNombre} · ${fmtFecha(rechazo.fechaInicio)}` : ''}
        icon={X}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRechazo(null)}>
              Cancelar
            </Button>
            <Button variant="danger" disabled={trabajando} onClick={rechazar}>
              Rechazar reserva
            </Button>
          </>
        }
      >
        <Field label="Motivo del rechazo" htmlFor="r-motivo" required error={errorAccion} hint="El residente recibirá una notificación con este motivo.">
          <Textarea id="r-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. La zona estará en mantenimiento ese día" />
        </Field>
      </Modal>
    </div>
  )
}
