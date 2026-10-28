import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Bell,
  CalendarPlus,
  CalendarRange,
  Check,
  Clock,
  CreditCard,
  Megaphone,
  Package,
  TriangleAlert,
  Wrench,
} from 'lucide-react'
import { StatusBadge } from '../../components/ui'
import { Titulo, VerMas } from '../../components/ui/Panel'
import { aparecer, tarjeta } from '../../lib/panel'
import CiudadBanner from '../../components/inicio/CiudadBanner'
import EscenaPaquetes from '../../components/inicio/EscenaPaquetes'
import IlustracionZona from '../../components/reservas/IlustracionZona'
import { estadoReserva } from '../../lib/labels'
import { alinearTooltip, cn, esDeNoche, formatCOP, saludo } from '../../lib/utils'
import { useAhora } from '../../lib/useAhora'
import { colorZona } from '../../lib/zonas'
import {
  incidencias,
  notificaciones,
  obligaciones,
  paquetes,
  reservasAgenda,
  residente,
  saldoPendiente,
} from '../../data/mock'

const MI_APARTAMENTO_ID = 12
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const PASOS_INCIDENCIA = ['Nueva', 'En proceso', 'Resuelta']

const fechaLarga = (d) => `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
const horaCorta = (d) => d.toTimeString().slice(0, 5)

function faltan(fecha, ahora) {
  const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const dias = Math.round((new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()) - inicioHoy) / 86400000)
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
}

// Cuotas de los últimos meses: barra por mes, verde si está pagada y ámbar si sigue pendiente.
function CuotasRecientes({ lista }) {
  const max = Math.max(...lista.map((o) => o.valor))
  return (
    <div>
      <div className="flex h-20 items-end gap-3" role="img" aria-label="Cuotas de los últimos seis meses">
        {lista.map((o, i) => {
          const pagada = o.estado === 'Pagada'
          return (
            <div key={o.id} className="group relative flex h-full flex-1 flex-col justify-end">
              <span className={cn('pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg [@media(hover:hover)]:group-hover:block', alinearTooltip(i, lista.length))}>
                {o.periodo} · {formatCOP(o.valor)} · {o.estado}
              </span>
              <motion.span
                initial={{ height: 0 }}
                animate={{ height: `${(o.valor / max) * 100}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'block w-full rounded-t-[4px]',
                  pagada ? 'bg-brand-400 group-hover:bg-brand-500' : 'bg-warning group-hover:bg-warning-strong',
                )}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-3 border-t border-slate-100 pt-1.5">
        {lista.map((o) => (
          <span key={o.id} className="flex-1 text-center text-[11px] text-slate-500">
            {o.periodo.split(' ')[0]}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand-400" /> Pagada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-warning" /> Pendiente
        </span>
      </div>
    </div>
  )
}

CuotasRecientes.propTypes = { lista: PropTypes.array.isRequired }

function Indicador({ icono: Icono, tono, etiqueta, valor, detalle, onClick, children, indice }) {
  return (
    <motion.button
      {...aparecer(indice)}
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        tarjeta,
        'group flex flex-col p-5 text-left outline-none transition-shadow hover:shadow-[0_1px_2px_rgb(15_23_42/0.04),0_16px_36px_-14px_rgb(15_23_42/0.25)] focus-visible:ring-2 focus-visible:ring-brand-500',
      )}
    >
      <div className="flex w-full items-start justify-between">
        <span className={cn('flex size-10 items-center justify-center rounded-xl', tono)}>
          <Icono className="size-5" strokeWidth={2} />
        </span>
        <ArrowRight className="size-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600" />
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{etiqueta}</p>
      <p className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">{valor}</p>
      <p className="mt-0.5 text-xs text-slate-500">{detalle}</p>
      {children && <div className="mt-4 w-full">{children}</div>}
    </motion.button>
  )
}

Indicador.propTypes = {
  icono: PropTypes.elementType.isRequired,
  tono: PropTypes.string.isRequired,
  etiqueta: PropTypes.string.isRequired,
  valor: PropTypes.node.isRequired,
  detalle: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  indice: PropTypes.number,
}

function PasosIncidencia({ estado }) {
  const actual = PASOS_INCIDENCIA.indexOf(estado)
  return (
    <ol className="flex items-center gap-1" aria-label={`Estado: ${estado}`}>
      {PASOS_INCIDENCIA.map((paso, i) => (
        <li key={paso} className="flex items-center gap-1">
          <span
            title={paso}
            className={cn(
              'flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
              i < actual && 'bg-brand-600 text-white',
              i === actual && (estado === 'Resuelta' ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-700 ring-2 ring-brand-500'),
              i > actual && 'bg-slate-100 text-slate-400',
            )}
          >
            {i < actual || estado === 'Resuelta' ? <Check className="size-3" strokeWidth={3} /> : i + 1}
          </span>
          {i < PASOS_INCIDENCIA.length - 1 && (
            <span className={cn('h-0.5 w-4 rounded-full', i < actual ? 'bg-brand-600' : 'bg-slate-200')} />
          )}
        </li>
      ))}
    </ol>
  )
}

PasosIncidencia.propTypes = { estado: PropTypes.string.isRequired }

const iconoNotificacion = {
  paquete: { icono: Package, punto: 'bg-teal-600', tono: 'text-teal-700' },
  reserva: { icono: CalendarRange, punto: 'bg-violet-600', tono: 'text-violet-700' },
  incidencia: { icono: Wrench, punto: 'bg-warning', tono: 'text-warning-strong' },
  comunicado: { icono: Megaphone, punto: 'bg-sky-600', tono: 'text-sky-700' },
}

const etiquetaTipo = {
  paquete: 'Paquetes',
  reserva: 'Reservas',
  incidencia: 'Incidencias',
  comunicado: 'Comunicados',
}

// Agrupa las notificaciones en Hoy / Ayer / Anteriores según su fecha ("Hoy · 10:04", "Ayer", "08/09/2026").
function agruparPorDia(lista) {
  const grupos = new Map()
  for (const n of lista) {
    const dia = n.fecha.startsWith('Hoy') ? 'Hoy' : n.fecha.startsWith('Ayer') ? 'Ayer' : 'Anteriores'
    grupos.set(dia, [...(grupos.get(dia) ?? []), n])
  }
  return [...grupos]
}

export default function Inicio({ onNavigate }) {
  const ahora = useAhora()
  // De noche entre las 6 p. m. y las 6 a. m., igual que el saludo; se revisa cada minuto.
  // `?modo=dia|noche` lo fuerza para revisar el mockup.
  const modo = new URLSearchParams(window.location.search).get('modo')
  const noche = modo ? modo === 'noche' : esDeNoche(ahora)
  const primerNombre = residente.nombre.split(' ')[0]

  const misReservas = reservasAgenda
    .filter(
      (r) =>
        r.apartamentoId === MI_APARTAMENTO_ID &&
        ['APROBADA', 'PENDIENTE'].includes(r.estado) &&
        new Date(r.fechaFin) > ahora,
    )
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
  const proxima = misReservas[0]
  const color = proxima && colorZona(proxima.zonaComunId)

  const pendientes = obligaciones.filter((o) => o.estado === 'Pendiente')
  const cuotas = [...obligaciones].reverse()
  const misIncidencias = incidencias.filter((i) => i.solicitante === residente.nombre)
  const abiertas = misIncidencias.filter((i) => i.estado !== 'Resuelta')
  const enPorteria = paquetes.filter((p) => p.estado === 'Ha llegado')
  const sinLeer = notificaciones.filter((n) => !n.leida).length

  return (
    <div className="space-y-5">
      {/* Banner + estado de cuenta */}
      <div className="grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.section
          {...aparecer(0)}
          className="relative flex min-h-80 flex-col overflow-hidden rounded-2xl bg-brand-700 text-white sm:min-h-72 lg:col-span-8"
        >
          <CiudadBanner noche={noche} className="pointer-events-none absolute inset-0 h-full w-full" />
          {/* Velo para que el texto se lea sobre la ciudad */}
          <div
            className={cn(
              'pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent',
              noche ? 'from-brand-950/85 via-brand-950/50' : 'from-brand-800/80 via-brand-800/40',
            )}
          />
          <div className="relative flex flex-1 flex-col p-6 sm:p-7">
            <div className="flex flex-1 flex-col">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-100 first-letter:uppercase">
                {fechaLarga(ahora)}
              </p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                {saludo(ahora)}, {primerNombre}
              </h1>
              <p className="mt-1 text-sm text-brand-50">
                {residente.torre} · Apartamento {residente.apto}
              </p>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/90 sm:max-w-[46%]">
                {enPorteria.length > 0 && `Tienes ${enPorteria.length} paquete${enPorteria.length === 1 ? '' : 's'} por recoger`}
                {enPorteria.length > 0 && proxima ? ' y tu ' : proxima ? 'Tu ' : ''}
                {proxima &&
                  `próxima reserva es ${faltan(new Date(proxima.fechaInicio), ahora).toLowerCase()} en ${/^(Piscina|Zona)/.test(proxima.zonaComunNombre) ? 'la' : 'el'} ${proxima.zonaComunNombre}`}
                {(enPorteria.length > 0 || proxima) && '.'}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => onNavigate('reservas')}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-700 shadow-lg shadow-brand-900/20 outline-none transition-colors hover:bg-brand-50 focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  <CalendarPlus className="size-4" /> Reservar zona
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('incidencias')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white outline-none backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                >
                  <TriangleAlert className="size-4" /> Reportar incidencia
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section {...aparecer(1)} className={cn(tarjeta, 'flex flex-col p-6 lg:col-span-4')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('finanzas')}>Detalle</VerMas>}>Estado de cuenta</Titulo>
          <p className="mt-4 text-xs font-medium text-slate-500">Saldo pendiente</p>
          <p className="text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">{formatCOP(saldoPendiente)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-warning-strong">
            <Clock className="size-3.5" />
            {pendientes.length} cuotas por pagar · la más antigua venció el {pendientes.at(-1)?.vencimiento}
          </p>
          <div className="mt-5 flex-1">
            <CuotasRecientes lista={cuotas} />
          </div>
          <button
            type="button"
            onClick={() => onNavigate('finanzas')}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white outline-none transition-colors hover:bg-brand-700 focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            <CreditCard className="size-4" /> Pagar ahora
          </button>
        </motion.section>
      </div>

      {/* Indicadores */}
      <div className="grid gap-5 sm:grid-cols-3 [&>*]:min-w-0">
        <Indicador
          indice={2}
          icono={CalendarRange}
          tono="bg-violet-50 text-violet-700"
          etiqueta="Reservas próximas"
          valor={misReservas.length}
          detalle={
            misReservas.some((r) => r.estado === 'PENDIENTE')
              ? `${misReservas.filter((r) => r.estado === 'PENDIENTE').length} esperando aprobación`
              : 'Todas aprobadas'
          }
          onClick={() => onNavigate('reservas')}
        >
          <div className="flex flex-wrap gap-1.5">
            {misReservas.slice(0, 3).map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                <span className={cn('size-2 rounded-full', colorZona(r.zonaComunId).punto)} />
                {r.zonaComunNombre} · {new Date(r.fechaInicio).getDate()}/{new Date(r.fechaInicio).getMonth() + 1}
              </span>
            ))}
          </div>
        </Indicador>
        <Indicador
          indice={3}
          icono={Package}
          tono="bg-teal-50 text-teal-700"
          etiqueta="Paquetes en portería"
          valor={enPorteria.length}
          detalle="Recógelos con tu documento"
          onClick={() => onNavigate('paquetes')}
        >
          <div className="flex gap-1.5">
            {enPorteria.map((p) => (
              <span key={p.id} className="flex size-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Package className="size-3.5" />
              </span>
            ))}
          </div>
        </Indicador>
        <Indicador
          indice={4}
          icono={Wrench}
          tono="bg-warning-bg text-warning-strong"
          etiqueta="Incidencias abiertas"
          valor={abiertas.length}
          detalle={`${misIncidencias.length - abiertas.length} resuelta${misIncidencias.length - abiertas.length === 1 ? '' : 's'} de ${misIncidencias.length} reportadas`}
          onClick={() => onNavigate('incidencias')}
        >
          <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
            {PASOS_INCIDENCIA.map((paso) => {
              const n = misIncidencias.filter((i) => i.estado === paso).length
              if (!n) return null
              return (
                <span
                  key={paso}
                  style={{ flexGrow: n }}
                  className={cn(
                    paso === 'Nueva' && 'bg-brand-300',
                    paso === 'En proceso' && 'bg-warning',
                    paso === 'Resuelta' && 'bg-brand-600',
                  )}
                />
              )
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
            {PASOS_INCIDENCIA.map((paso) => (
              <span key={paso} className="flex items-center gap-1">
                <span
                  className={cn(
                    'size-2 rounded-full',
                    paso === 'Nueva' && 'bg-brand-300',
                    paso === 'En proceso' && 'bg-warning',
                    paso === 'Resuelta' && 'bg-brand-600',
                  )}
                />
                {paso} {misIncidencias.filter((i) => i.estado === paso).length}
              </span>
            ))}
          </div>
        </Indicador>
      </div>

      {/* Próxima reserva + incidencias */}
      <div className="grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.section {...aparecer(5)} className={cn(tarjeta, 'flex flex-col overflow-hidden lg:col-span-5')}>
          <div className="px-6 pt-6">
            <Titulo accion={<VerMas onClick={() => onNavigate('reservas')}>Mis reservas</VerMas>}>Próxima reserva</Titulo>
          </div>
          {proxima ? (
            <div className="flex flex-1 flex-col p-6 pt-4">
              <div className="relative overflow-hidden rounded-xl bg-slate-50">
                <IlustracionZona nombre={proxima.zonaComunNombre} className="h-36 w-full" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
                  {faltan(new Date(proxima.fechaInicio), ahora)}
                </span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <span className={cn('size-2.5 shrink-0 rounded-full', color.punto)} />
                    {proxima.zonaComunNombre}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500 first-letter:uppercase">
                    {fechaLarga(new Date(proxima.fechaInicio))} · {horaCorta(new Date(proxima.fechaInicio))} –{' '}
                    {horaCorta(new Date(proxima.fechaFin))}
                  </p>
                </div>
                <StatusBadge status={estadoReserva[proxima.estado].label} tone={estadoReserva[proxima.estado].tone} />
              </div>
              {misReservas.length > 1 && (
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  {misReservas.slice(1, 3).map((r) => (
                    <li key={r.id} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className={cn('size-2 shrink-0 rounded-full', colorZona(r.zonaComunId).punto)} />
                      <span className="font-semibold text-slate-800">{r.zonaComunNombre}</span>
                      <span className="truncate first-letter:uppercase">· {fechaLarga(new Date(r.fechaInicio))}</span>
                      <span className="ml-auto shrink-0">{estadoReserva[r.estado].label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-sm text-slate-500">No tienes reservas próximas.</p>
              <VerMas onClick={() => onNavigate('reservas')}>Reservar una zona</VerMas>
            </div>
          )}
        </motion.section>

        <motion.section {...aparecer(6)} className={cn(tarjeta, 'flex flex-col p-6 lg:col-span-7')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('incidencias')}>Ver todas</VerMas>}>Tus incidencias</Titulo>
          <ul className="mb-4 mt-4 divide-y divide-slate-100">
            {misIncidencias.slice(0, 3).map((i) => (
              <li key={i.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{i.titulo}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {i.id} · {i.categoria} · {i.fecha}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PasosIncidencia estado={i.estado} />
                  <StatusBadge status={i.estado} className="w-24 text-xs" />
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onNavigate('incidencias')}
            className="mt-auto flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 p-4 text-left outline-none transition-colors hover:border-brand-300 hover:bg-brand-50/50 focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <TriangleAlert className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-800">¿Algo no funciona?</span>
              <span className="block text-xs text-slate-500">Reporta una falla en tu apartamento o en las zonas comunes.</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-slate-400" />
          </button>
        </motion.section>
      </div>

      {/* Notificaciones + paquetes */}
      <div className="grid items-start gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.section {...aparecer(7)} className={cn(tarjeta, 'p-6 lg:col-span-7')}>
          <Titulo
            accion={
              sinLeer > 0 && (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{sinLeer} sin leer</span>
              )
            }
          >
            Novedades
          </Titulo>
          <div className="mt-5 space-y-5">
            {agruparPorDia(notificaciones.slice(0, 4)).map(([dia, lista]) => (
              <div key={dia}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{dia}</p>
                <ol className="relative">
                  {lista.map((n, i) => {
                    const { icono: Icono, punto, tono } = iconoNotificacion[n.tipo] ?? {
                      icono: Bell,
                      punto: 'bg-slate-500',
                      tono: 'text-slate-600',
                    }
                    const hora = n.fecha.split('·')[1]?.trim()
                    return (
                      <li key={n.id} className="relative flex gap-4 pb-3 last:pb-0">
                        {i < lista.length - 1 && (
                          <span className="absolute bottom-0 left-[17px] top-9 w-px bg-slate-200" aria-hidden="true" />
                        )}
                        <span
                          className={cn(
                            'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white',
                            punto,
                          )}
                        >
                          <Icono className="size-4" />
                        </span>
                        <div
                          className={cn(
                            'min-w-0 flex-1 rounded-xl px-3.5 py-2.5',
                            n.leida ? 'bg-slate-50' : 'bg-brand-50/60 ring-1 ring-brand-100',
                          )}
                        >
                          <div className="flex flex-col-reverse gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                            <p className={cn('text-sm text-slate-900', n.leida ? 'font-semibold' : 'font-bold')}>
                              {n.titulo}
                              {!n.leida && (
                                <span className="ml-2 rounded-full bg-brand-600 px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">
                                  Nuevo
                                </span>
                              )}
                            </p>
                            <span className="shrink-0 text-[11px] font-medium text-slate-400">
                              <span className={cn('font-semibold', tono)}>{etiquetaTipo[n.tipo]}</span>
                              {' · '}
                              {hora ?? (dia === 'Anteriores' ? n.fecha.slice(0, 5) : 'Ayer')}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{n.detalle}</p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section {...aparecer(8)} className={cn(tarjeta, 'flex flex-col overflow-hidden lg:col-span-5')}>
          <div className="px-6 pt-6">
            <Titulo accion={<VerMas onClick={() => onNavigate('paquetes')}>Ver paquetes</VerMas>}>Te esperan en portería</Titulo>
          </div>
          <div className="relative mx-6 mt-4 overflow-hidden rounded-xl bg-brand-50">
            <EscenaPaquetes className="h-32 w-full" />
            <div className="absolute left-4 top-3">
              <p className="text-3xl font-extrabold leading-none tracking-tight text-brand-800 tabular-nums">
                {enPorteria.length}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-brand-700">
                {enPorteria.length === 1 ? 'paquete' : 'paquetes'}
              </p>
            </div>
          </div>
          {enPorteria.length > 0 ? (
            <ul className="mt-4 space-y-2.5 px-6">
              {enPorteria.map((p) => (
                <li key={p.id} className="flex overflow-hidden rounded-xl border border-slate-200">
                  <div className="min-w-0 flex-1 px-4 py-3">
                    <p className="text-sm font-bold text-slate-800">{p.empresa}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{p.descripcion}</p>
                  </div>
                  <div className="relative flex shrink-0 flex-col items-end justify-center border-l-2 border-dashed border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="absolute -left-[7px] -top-[7px] size-3 rounded-full border border-slate-200 bg-white" aria-hidden="true" />
                    <span className="absolute -bottom-[7px] -left-[7px] size-3 rounded-full border border-slate-200 bg-white" aria-hidden="true" />
                    <span className="font-mono text-[11px] font-semibold text-slate-700">{p.guia}</span>
                    <span className="mt-0.5 text-[11px] text-slate-400">Llegó el {p.fecha.slice(0, 5)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 px-6 text-center text-sm text-slate-500">No tienes paquetes por recoger.</p>
          )}
          <div className="mt-auto p-6 pt-4">
            <p className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="size-3.5 shrink-0 text-brand-600" />
              Portería atiende las 24 horas. Lleva tu documento para reclamar.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

Inicio.propTypes = {
  onNavigate: PropTypes.func.isRequired,
}
