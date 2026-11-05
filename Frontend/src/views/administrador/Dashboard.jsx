import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { AlertCircle, ArrowRight, CalendarRange, CheckCircle2, FileCheck2, RotateCcw, TrendingUp, TriangleAlert, Users, Wallet } from 'lucide-react'
import { Button } from '../../components/ui'
import { Titulo, VerMas } from '../../components/ui/Panel'
import EscenaConjunto from '../../components/login/EscenaConjunto'
import { Anillo, GraficoRecaudo, Sparkline } from '../../components/admin/Graficos'
import { adminApi, cartera, millones, recaudoPorPeriodo, useCarga } from '../../lib/admin'
import { estadoIncidencia, nombrePeriodo } from '../../lib/labels'
import { aparecer, tarjeta } from '../../lib/panel'
import { useAhora } from '../../lib/useAhora'
import { cn, formatCOP, saludo } from '../../lib/utils'
import { useSesion } from '../../lib/sesion'
import { colorZona } from '../../lib/zonas'

const fechaCorta = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })

function Indicador({ icono: Icono, etiqueta, valor, detalle, tono, onClick, indice, children }) {
  return (
    <motion.button
      type="button"
      {...aparecer(indice)}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        tarjeta,
        'group flex flex-col p-4 text-left outline-none transition-shadow hover:shadow-[0_1px_2px_rgb(15_23_42/0.04),0_18px_36px_-16px_rgb(0_101_43/0.3)] focus-visible:ring-2 focus-visible:ring-brand-500',
      )}
    >
      <span className="flex items-center justify-between">
        <span className={cn('flex size-9 items-center justify-center rounded-lg', tono)}>
          <Icono className="size-4" strokeWidth={2} />
        </span>
        <ArrowRight className="size-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600" />
      </span>
      <span className="mt-3 text-xs font-medium text-slate-500">{etiqueta}</span>
      <span className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{valor}</span>
      <span className="text-[11px] text-slate-400">{detalle}</span>
      {children}
    </motion.button>
  )
}

Indicador.propTypes = {
  icono: PropTypes.elementType.isRequired,
  etiqueta: PropTypes.string.isRequired,
  valor: PropTypes.string.isRequired,
  detalle: PropTypes.string.isRequired,
  tono: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  indice: PropTypes.number.isRequired,
  children: PropTypes.node,
}

// Mensaje dentro de una tarjeta cuando todavía no hay datos
function SinDatos({ children, accion }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 px-5 py-8 text-center">
      <p className="max-w-xs text-sm text-slate-500">{children}</p>
      {accion}
    </div>
  )
}

SinDatos.propTypes = { children: PropTypes.node, accion: PropTypes.node }

const cargarTodo = () =>
  Promise.all([
    adminApi.apartamentos(),
    adminApi.residentes(),
    adminApi.obligaciones(),
    adminApi.pagosPorValidar(),
    adminApi.reservas(),
    adminApi.incidencias(),
    adminApi.zonas(),
  ]).then(([apartamentos, residentes, obligaciones, pagos, reservas, incidencias, zonas]) => ({
    apartamentos,
    residentes,
    obligaciones,
    pagos,
    reservas,
    incidencias,
    zonas,
  }))

function Esqueleto() {
  return (
    <div className="space-y-5" role="status" aria-label="Cargando el resumen">
      <div className="h-44 animate-pulse rounded-2xl bg-brand-100" />
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={cn(tarjeta, 'h-32 animate-pulse')} />
        ))}
      </div>
      <div className={cn(tarjeta, 'h-72 animate-pulse')} />
    </div>
  )
}

export default function Dashboard({ onNavigate }) {
  const { usuario } = useSesion()
  const ahora = useAhora()
  const fecha = ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  const { datos, error, recargar } = useCarga(cargarTodo)

  const encabezado = (
    <>
      <p className="text-sm font-medium text-brand-100 first-letter:uppercase">{fecha}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{saludo(ahora)}, {usuario.nombreCompleto.split(' ')[0]}</h1>
    </>
  )

  if (error) {
    return (
      <div className={cn(tarjeta, 'flex flex-col items-center gap-3 px-6 py-12 text-center')}>
        <AlertCircle className="size-8 text-danger" />
        <p className="text-sm font-bold text-slate-900">No se pudo cargar el resumen del conjunto</p>
        <p className="max-w-sm text-xs text-slate-500">{error}</p>
        <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar}>
          Intentar de nuevo
        </Button>
      </div>
    )
  }
  if (!datos) return <Esqueleto />

  const { apartamentos, residentes, obligaciones, pagos, reservas, incidencias, zonas } = datos
  const torres = new Set(apartamentos.map((a) => a.torreId)).size
  const habitados = new Set(residentes.map((r) => r.apartamentoId)).size

  const recaudo = recaudoPorPeriodo(obligaciones).map((r) => ({ ...r, mes: nombrePeriodo(r.periodo, true) }))
  const ultimo = recaudo.at(-1)
  const penultimo = recaudo.at(-2)
  const variacion = ultimo && penultimo?.valor ? Math.round(((ultimo.valor - penultimo.valor) / penultimo.valor) * 100) : null
  const estadoCartera = cartera(obligaciones, apartamentos.length)

  const reservasPendientes = reservas.filter((r) => r.estado === 'PENDIENTE')
  const activas = incidencias.filter((i) => i.estado !== 'RESUELTA')
  const altas = activas.filter((i) => i.prioridad === 'ALTA').length

  // Reservas aprobadas por zona en el mes actual
  const mesActual = ahora.toISOString().slice(0, 7)
  const usoZonas = zonas
    .map((z) => ({ ...z, total: reservas.filter((r) => r.zonaComunId === z.id && r.estado === 'APROBADA' && r.fechaInicio.startsWith(mesActual)).length }))
    .sort((a, b) => b.total - a.total)
  const maxUso = Math.max(1, ...usoZonas.map((z) => z.total))

  const porEstado = Object.entries(estadoIncidencia).map(([clave, e]) => [clave, e, incidencias.filter((i) => i.estado === clave).length])

  return (
    <div className="space-y-5">
      {/* Encabezado con la escena del conjunto */}
      <motion.section {...aparecer(0)} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-[0_18px_40px_-20px_rgb(0_80_35/0.6)]">
        <EscenaConjunto className="absolute inset-x-0 bottom-0 h-full w-full opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/50 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-6 p-6 pb-24 sm:pb-28">
          <div>
            {encabezado}
            <p className="mt-1 text-sm text-brand-100">
              Conjunto Residencial Los Robles · {torres} {torres === 1 ? 'torre' : 'torres'} · {apartamentos.length} apartamentos
            </p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur-sm">
            {ultimo ? (
              <>
                <p className="text-xs text-brand-100">Recaudo de {nombrePeriodo(ultimo.periodo).toLowerCase()}</p>
                <p className="flex items-baseline gap-2 text-2xl font-extrabold tabular-nums">
                  {millones(ultimo.valor)}
                  {variacion !== null && (
                    <span className="flex items-center gap-0.5 rounded-full bg-lime-300/20 px-1.5 py-0.5 text-xs font-bold text-lime-200">
                      <TrendingUp className="size-3" /> {variacion > 0 ? '+' : ''}
                      {variacion}%
                    </span>
                  )}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-brand-100">Recaudo</p>
                <p className="text-sm font-semibold">Aún no hay cuotas generadas</p>
              </>
            )}
          </div>
        </div>
      </motion.section>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5 [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
        <Indicador
          indice={1}
          icono={Users}
          etiqueta="Residentes"
          valor={String(residentes.length)}
          detalle={`${habitados} de ${apartamentos.length} aptos habitados`}
          tono="bg-brand-50 text-brand-700"
          onClick={() => onNavigate('usuarios')}
        />
        <Indicador
          indice={2}
          icono={Wallet}
          etiqueta={`Recaudo · ${recaudo.length || 0} ${recaudo.length === 1 ? 'mes' : 'meses'}`}
          valor={millones(recaudo.reduce((s, r) => s + r.valor, 0))}
          detalle={variacion !== null ? `${variacion > 0 ? '+' : ''}${variacion}% vs ${penultimo.mes.toLowerCase()}` : 'Sin meses para comparar'}
          tono="bg-success-bg text-success-strong"
          onClick={() => onNavigate('finanzas')}
        >
          {recaudo.length > 1 && <Sparkline valores={recaudo.map((r) => r.valor)} className="mt-2 text-success" />}
        </Indicador>
        <Indicador
          indice={3}
          icono={FileCheck2}
          etiqueta="Pagos por revisar"
          valor={String(pagos.length)}
          detalle={pagos.length ? formatCOP(pagos.reduce((s, p) => s + Number(p.monto), 0)) : 'Ninguno pendiente'}
          tono="bg-warning-bg text-warning-strong"
          onClick={() => onNavigate('finanzas')}
        />
        <Indicador
          indice={4}
          icono={CalendarRange}
          etiqueta="Reservas por aprobar"
          valor={String(reservasPendientes.length)}
          detalle={reservasPendientes.length ? `Próxima: ${fechaCorta(reservasPendientes[0].fechaInicio)}` : 'Ninguna pendiente'}
          tono="bg-violet-50 text-violet-600"
          onClick={() => onNavigate('reservas')}
        />
        <Indicador
          indice={5}
          icono={TriangleAlert}
          etiqueta="Incidencias activas"
          valor={String(activas.length)}
          detalle={activas.length ? `${altas} con prioridad alta` : 'Ningún reporte abierto'}
          tono="bg-danger-bg text-danger-strong"
          onClick={() => onNavigate('incidencias')}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recaudo mensual */}
        <motion.section {...aparecer(6)} className={cn(tarjeta, 'flex flex-col p-5 lg:col-span-2')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('finanzas')}>Finanzas</VerMas>}>Recaudo mensual</Titulo>
          <p className="mt-0.5 text-xs text-slate-500">Recaudado frente a lo facturado</p>
          {recaudo.length ? (
            <GraficoRecaudo datos={recaudo} formato={millones} className="mt-4 h-64" />
          ) : (
            <div className="mt-4 flex h-64">
              <SinDatos
                accion={
                  <Button size="sm" variant="outline" onClick={() => onNavigate('finanzas')}>
                    Generar cuotas del mes
                  </Button>
                }
              >
                Todavía no se han generado cuotas. Cuando las generes, aquí verás cuánto se facturó y cuánto se ha recaudado cada mes.
              </SinDatos>
            </div>
          )}
        </motion.section>

        {/* Cartera */}
        <motion.section {...aparecer(7)} className={cn(tarjeta, 'flex flex-col p-5')}>
          <Titulo>Cartera del conjunto</Titulo>
          {obligaciones.length && apartamentos.length ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4">
              <Anillo valor={estadoCartera.alDia} total={estadoCartera.apartamentos} className="size-40">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                  {Math.round((estadoCartera.alDia / estadoCartera.apartamentos) * 100)}%
                </span>
                <span className="text-xs text-slate-500">al día</span>
              </Anillo>
              <dl className="grid w-full grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-brand-50/70 py-2.5">
                  <dd className="text-lg font-extrabold text-brand-700 tabular-nums">{estadoCartera.alDia}</dd>
                  <dt className="text-[11px] font-medium text-slate-500">Aptos al día</dt>
                </div>
                <div className="rounded-xl bg-slate-50 py-2.5">
                  <dd className="text-lg font-extrabold text-slate-700 tabular-nums">{estadoCartera.enMora}</dd>
                  <dt className="text-[11px] font-medium text-slate-500">En mora · {formatCOP(estadoCartera.saldoMora)}</dt>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-4 flex flex-1">
              <SinDatos>Cuando haya cuotas generadas verás qué apartamentos están al día y cuáles en mora.</SinDatos>
            </div>
          )}
        </motion.section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Uso de zonas comunes */}
        <motion.section {...aparecer(8)} className={cn(tarjeta, 'p-5')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('reservas')}>Agenda</VerMas>}>Uso de zonas comunes</Titulo>
          <p className="mt-0.5 text-xs text-slate-500">Reservas aprobadas este mes</p>
          {zonas.length ? (
            <ul className="mt-4 space-y-3">
              {usoZonas.map((z, i) => (
                <li key={z.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-700">
                      <span className={cn('size-2.5 rounded-full', colorZona(z.id).punto)} />
                      {z.nombre}
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">{z.total}</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className={cn('h-full rounded-full', colorZona(z.id).punto)}
                      initial={{ width: 0 }}
                      animate={{ width: `${(z.total / maxUso) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500">El conjunto no tiene zonas comunes registradas.</p>
          )}
        </motion.section>

        {/* Incidencias por estado */}
        <motion.section {...aparecer(9)} className={cn(tarjeta, 'flex flex-col p-5')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('incidencias')}>Ver todas</VerMas>}>Incidencias</Titulo>
          <p className="mt-0.5 text-xs text-slate-500">
            {incidencias.length === 1 ? '1 reporte en total' : `${incidencias.length} reportes en total`}
          </p>
          <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full bg-slate-100">
            {porEstado.map(([clave, e, n]) => (
              <motion.span
                key={clave}
                className={cn('h-full first:rounded-l-full last:rounded-r-full', e.punto)}
                initial={{ flexGrow: 0 }}
                animate={{ flexGrow: n }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                title={`${e.label}: ${n}`}
              />
            ))}
          </div>
          <ul className="mt-4 space-y-2.5">
            {porEstado.map(([clave, e, n]) => (
              <li key={clave} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={cn('size-2.5 rounded-full', e.punto)} />
                  {e.label}
                </span>
                <span className="font-bold text-slate-900 tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4">
            {altas ? (
              <p className="rounded-xl bg-danger-bg px-3 py-2.5 text-xs font-medium text-danger-strong">
                {altas === 1 ? '1 incidencia activa con prioridad alta' : `${altas} incidencias activas con prioridad alta`}
              </p>
            ) : (
              <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-500">Sin incidencias de prioridad alta</p>
            )}
          </div>
        </motion.section>

        {/* Por aprobar */}
        <motion.section {...aparecer(10)} className={cn(tarjeta, 'flex flex-col p-5')}>
          <Titulo>Por aprobar</Titulo>
          {reservasPendientes.length || pagos.length ? (
            <ul className="mt-3 space-y-2">
              {reservasPendientes.slice(0, 3).map((r) => (
                <li key={`r-${r.id}`}>
                  <button
                    type="button"
                    onClick={() => onNavigate('reservas')}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span className="flex w-11 shrink-0 flex-col overflow-hidden rounded-lg bg-white text-center ring-1 ring-slate-200">
                      <span className={cn('py-0.5 text-[9px] font-bold uppercase text-white', colorZona(r.zonaComunId).punto)}>
                        {new Date(r.fechaInicio).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className="py-0.5 text-sm font-extrabold text-slate-900">{new Date(r.fechaInicio).getDate()}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">{r.zonaComunNombre}</span>
                      <span className="block truncate text-xs text-slate-500">{r.apartamento}</span>
                    </span>
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">Reserva</span>
                  </button>
                </li>
              ))}
              {pagos.slice(0, 2).map((p) => (
                <li key={`p-${p.id}`}>
                  <button
                    type="button"
                    onClick={() => onNavigate('finanzas')}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                      <FileCheck2 className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-800">{formatCOP(Number(p.monto))}</span>
                      <span className="block truncate text-xs text-slate-500">{p.apartamento}</span>
                    </span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pago</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-success-bg text-success-strong">
                <CheckCircle2 className="size-5" />
              </span>
              <p className="text-sm font-bold text-slate-900">Nada pendiente</p>
              <p className="max-w-[16rem] text-xs text-slate-500">Las reservas y los pagos que reporten los residentes aparecerán aquí.</p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  )
}

Dashboard.propTypes = { onNavigate: PropTypes.func.isRequired }
