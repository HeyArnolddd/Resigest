import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CalendarDays, CheckCircle2, Clock, IdCard, MapPin, PackageCheck, PackageOpen, RotateCcw } from 'lucide-react'
import { ArchivoProtegido, Button, EmptyState } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import EscenaPaquetes from '../../components/inicio/EscenaPaquetes'
import IlustracionPaquete from '../../components/paquetes/IlustracionPaquete'
import { aparecer, tarjeta } from '../../lib/panel'
import { hora } from '../../lib/porteria'
import { fmtFechaCorta, residenteApi } from '../../lib/residente'
import { useSesion } from '../../lib/sesion'
import { useCarga } from '../../lib/useCarga'
import { useAhora } from '../../lib/useAhora'
import { cn } from '../../lib/utils'

const APERTURA = 6
const CIERRE = 22

// Código de barras decorativo derivado del número de guía (siempre el mismo para la misma guía)
function CodigoBarras({ guia }) {
  const barras = []
  let x = 0
  for (const ch of guia.repeat(2)) {
    const c = ch.charCodeAt(0)
    for (const w of [1 + (c % 3), 1 + ((c >> 2) % 2), 1 + ((c >> 3) % 3)]) {
      barras.push(<rect key={x} x={x} y="0" width={w} height="28" className="fill-slate-800" />)
      x += w + 1 + ((c + w) % 2)
    }
  }
  return (
    <svg viewBox={`0 0 ${x} 28`} preserveAspectRatio="none" className="h-8 w-full" aria-hidden="true">
      {barras}
    </svg>
  )
}

CodigoBarras.propTypes = { guia: PropTypes.string.isRequired }

// Paquete en portería como etiqueta de envío
function Etiqueta({ paquete, onRecogido, ocupado }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(tarjeta, 'flex flex-col overflow-hidden')}
    >
      <div className="flex items-center justify-between gap-3 bg-amber-50 px-5 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-warning-strong">
          <span className="size-2 rounded-full bg-warning" />
          En portería
        </span>
        <span className="font-mono text-[11px] font-semibold text-amber-700/70">#{String(paquete.id).padStart(4, '0')}</span>
      </div>

      <div className="flex gap-4 p-5">
        {paquete.fotoUrl ? (
          <ArchivoProtegido url={paquete.fotoUrl} alt={`Foto del paquete de ${paquete.empresa}`} className="size-24 shrink-0 rounded-xl" />
        ) : (
          <div className="flex size-24 shrink-0 items-end justify-center rounded-xl bg-amber-50/60 ring-1 ring-amber-100">
            <IlustracionPaquete descripcion={paquete.descripcion} className="w-full p-1.5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Remitente</p>
          <h3 className="truncate text-lg font-bold leading-tight text-slate-900">{paquete.empresa}</h3>
          <p className="mt-1 text-sm text-slate-600">{paquete.descripcion}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays className="size-3.5" /> Llegó el {fmtFechaCorta(paquete.fechaRecepcion)} a las {hora(paquete.fechaRecepcion)}
          </p>
        </div>
      </div>

      {/* Línea de corte de la etiqueta */}
      <div className="mx-5 border-t-2 border-dashed border-slate-200" />

      <div className="flex flex-wrap items-end gap-4 px-5 pb-5 pt-4">
        {paquete.guia && (
          <div className="min-w-[140px] flex-1">
            <CodigoBarras guia={paquete.guia} />
            <p className="mt-1 font-mono text-[11px] tracking-[0.2em] text-slate-500">{paquete.guia}</p>
          </div>
        )}
        <div className="flex flex-col items-end gap-1.5">
          <Button size="sm" icon={PackageCheck} disabled={ocupado} onClick={() => onRecogido(paquete)}>
            Ya lo recogí
          </Button>
          <p className="flex items-center gap-1 text-[11px] text-slate-500">
            <IdCard className="size-3.5 text-brand-600" /> Lleva tu documento
          </p>
        </div>
      </div>
    </motion.article>
  )
}

Etiqueta.propTypes = {
  paquete: PropTypes.shape({
    id: PropTypes.number.isRequired,
    empresa: PropTypes.string.isRequired,
    guia: PropTypes.string,
    descripcion: PropTypes.string,
    fechaRecepcion: PropTypes.string.isRequired,
    fotoUrl: PropTypes.string,
  }).isRequired,
  onRecogido: PropTypes.func.isRequired,
  ocupado: PropTypes.bool,
}

export default function Paquetes() {
  const { usuario } = useSesion()
  const { datos: lista, error, recargar } = useCarga(() => residenteApi.paquetes(usuario.apartamentoId), 'res:paquetes')
  const ahora = useAhora()

  const [ocupado, setOcupado] = useState(false)
  const [errorAccion, setErrorAccion] = useState('')

  // El residente confirma que ya lo recogió: deja de salirle como pendiente
  const recogido = async (paquete) => {
    setOcupado(true)
    setErrorAccion('')
    try {
      await residenteApi.confirmarRecogido(paquete.id)
      recargar()
    } catch (e) {
      setErrorAccion(e.message)
    } finally {
      setOcupado(false)
    }
  }

  const enPorteria = (lista ?? []).filter((p) => p.enPorteria)
  const entregados = (lista ?? []).filter((p) => !p.enPorteria)
  const abierta = ahora.getHours() >= APERTURA && ahora.getHours() < CIERRE

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Paquetes</h1>
        <p className="mt-1 text-sm text-slate-500">Correspondencia y paquetes recibidos en portería</p>
      </div>

      {/* Resumen de portería */}
      <motion.section {...aparecer(0)} className={cn(tarjeta, 'relative grid overflow-hidden sm:grid-cols-[1fr_minmax(0,320px)]')}>
        <div className="p-6">
          <p className="text-sm font-semibold text-brand-700">Te esperan en portería</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-5xl font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">{lista ? enPorteria.length : '–'}</span>
            <span className="text-base font-semibold text-slate-600">{enPorteria.length === 1 ? 'paquete' : 'paquetes'}</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            {enPorteria.length > 0
              ? 'Pasa por la portería principal con tu documento y confirma aquí cuando lo recojas.'
              : 'No tienes paquetes pendientes. Te avisaremos cuando llegue uno.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
                abierta ? 'bg-success-bg text-success-strong' : 'bg-slate-100 text-slate-600',
              )}
            >
              <span className={cn('size-2 rounded-full', abierta ? 'bg-success' : 'bg-slate-400')} />
              {abierta ? 'Portería abierta' : 'Portería cerrada'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              <Clock className="size-3.5" /> 06:00 – 22:00
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              <MapPin className="size-3.5" /> Portería principal
            </span>
          </div>
        </div>
        <div className="hidden items-end bg-brand-50 sm:flex">
          <EscenaPaquetes className="h-40 w-full" />
        </div>
      </motion.section>

      {error && (
        <div className={tarjeta}>
          <EmptyState
            icon={AlertCircle}
            title="No se pudieron cargar tus paquetes"
            description={error}
            action={
              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                Intentar de nuevo
              </Button>
            }
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Por recoger */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="size-2.5 rounded-[3px] bg-brand-500" />
            Por recoger
          </h2>
          {errorAccion && <p role="alert" className="mb-3 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-strong">{errorAccion}</p>}
          {!lista && !error ? (
            <div className={cn(tarjeta, 'h-48 animate-pulse')} role="status" aria-label="Cargando paquetes" />
          ) : enPorteria.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {enPorteria.map((p) => (
                  <Etiqueta key={p.id} paquete={p} onRecogido={recogido} ocupado={ocupado} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className={cn(tarjeta, 'flex flex-col items-center gap-2 px-6 py-10 text-center')}>
              <span className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success-strong">
                <CheckCircle2 className="size-6" />
              </span>
              <p className="text-sm font-bold text-slate-900">Nada por recoger</p>
              <p className="text-xs text-slate-500">No hay paquetes tuyos esperando en portería. Te avisaremos cuando llegue uno.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {/* Historial */}
          <motion.section {...aparecer(2)} className={cn(tarjeta, 'p-5')}>
            <Titulo>Ya recogidos</Titulo>
            {entregados.length > 0 ? (
              <ol className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-slate-200">
                <AnimatePresence initial={false}>
                  {entregados.map((p) => (
                    <motion.li
                      key={p.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative flex items-center gap-3"
                    >
                      <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-success-bg text-success-strong ring-4 ring-white">
                        <PackageOpen className="size-4" strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">{p.empresa}</p>
                        <p className="truncate text-xs text-slate-500">Lo recibió {p.entregadoA}</p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400 tabular-nums">{fmtFechaCorta(p.fechaEntrega)}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            ) : (
              <p className="mt-3 text-xs text-slate-500">Aquí verás los paquetes que ya recogiste.</p>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  )
}
