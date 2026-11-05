import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { ArrowRight, CalendarRange, FileCheck2, TrendingUp, TriangleAlert, Users, Wallet } from 'lucide-react'
import { Titulo, VerMas } from '../../components/ui/Panel'
import EscenaConjunto from '../../components/login/EscenaConjunto'
import { Anillo, GraficoRecaudo, Sparkline } from '../../components/admin/Graficos'
import { carteraConjunto, incidencias, pagosManuales, recaudoMensual, reservasAgenda, zonas } from '../../data/mock'
import { puntoEstado } from '../../lib/incidencias'
import { aparecer, tarjeta } from '../../lib/panel'
import { useAhora } from '../../lib/useAhora'
import { cn, formatCOP, saludo } from '../../lib/utils'
import { colorZona } from '../../lib/zonas'

const millones = (v) => `$${v.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`
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

export default function Dashboard({ onNavigate }) {
  const ahora = useAhora()
  const fecha = ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  const pagosPendientes = pagosManuales.filter((p) => p.estado === 'Pendiente revisión')
  const reservasPendientes = reservasAgenda
    .filter((r) => r.estado === 'PENDIENTE')
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))
  const activas = incidencias.filter((i) => ['Nueva', 'En proceso'].includes(i.estado))
  const ultimo = recaudoMensual.at(-1)
  const penultimo = recaudoMensual.at(-2)
  const variacion = Math.round(((ultimo.valor - penultimo.valor) / penultimo.valor) * 100)

  // Reservas aprobadas por zona
  const usoZonas = zonas
    .map((z) => ({ ...z, total: reservasAgenda.filter((r) => r.zonaComunId === z.id && r.estado === 'APROBADA').length }))
    .sort((a, b) => b.total - a.total)
  const maxUso = Math.max(...usoZonas.map((z) => z.total))

  const porEstado = ['Nueva', 'En proceso', 'Resuelta'].map((e) => [e, incidencias.filter((i) => i.estado === e).length])

  return (
    <div className="space-y-5">
      {/* Encabezado con la escena del conjunto */}
      <motion.section {...aparecer(0)} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-[0_18px_40px_-20px_rgb(0_80_35/0.6)]">
        <EscenaConjunto className="absolute inset-x-0 bottom-0 h-full w-full opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-900/50 to-transparent" />
        <div className="relative flex flex-wrap items-end justify-between gap-6 p-6 pb-24 sm:pb-28">
          <div>
            <p className="text-sm font-medium text-brand-100 first-letter:uppercase">{fecha}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{saludo(ahora)}, Andrea</h1>
            <p className="mt-1 text-sm text-brand-100">Conjunto Residencial Los Robles · 3 torres · 120 apartamentos</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur-sm">
            <p className="text-xs text-brand-100">Recaudo de {ultimo.mes.toLowerCase()}</p>
            <p className="flex items-baseline gap-2 text-2xl font-extrabold tabular-nums">
              {millones(ultimo.valor)}
              <span className="flex items-center gap-0.5 rounded-full bg-lime-300/20 px-1.5 py-0.5 text-xs font-bold text-lime-200">
                <TrendingUp className="size-3" /> +{variacion}%
              </span>
            </p>
          </div>
        </div>
      </motion.section>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5 [&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1">
        <Indicador indice={1} icono={Users} etiqueta="Residentes" valor="128" detalle="3 torres · 120 aptos" tono="bg-brand-50 text-brand-700" onClick={() => onNavigate('residentes')} />
        <Indicador indice={2} icono={Wallet} etiqueta="Recaudo · 6 meses" valor={millones(recaudoMensual.reduce((s, r) => s + r.valor, 0))} detalle={`${variacion > 0 ? '+' : ''}${variacion}% vs ${penultimo.mes.toLowerCase()}`} tono="bg-success-bg text-success-strong" onClick={() => onNavigate('finanzas')}>
          <Sparkline valores={recaudoMensual.map((r) => r.valor)} className="mt-2 text-success" />
        </Indicador>
        <Indicador indice={3} icono={FileCheck2} etiqueta="Pagos por revisar" valor={String(pagosPendientes.length)} detalle={formatCOP(pagosPendientes.reduce((s, p) => s + p.valor, 0))} tono="bg-warning-bg text-warning-strong" onClick={() => onNavigate('finanzas')} />
        <Indicador indice={4} icono={CalendarRange} etiqueta="Reservas por aprobar" valor={String(reservasPendientes.length)} detalle={`Próxima: ${fechaCorta(reservasPendientes[0]?.fechaInicio ?? new Date())}`} tono="bg-violet-50 text-violet-600" onClick={() => onNavigate('reservas')} />
        <Indicador indice={5} icono={TriangleAlert} etiqueta="Incidencias activas" valor={String(activas.length)} detalle={`${activas.filter((i) => i.prioridad === 'Alta').length} con prioridad alta`} tono="bg-danger-bg text-danger-strong" onClick={() => onNavigate('incidencias')} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recaudo mensual */}
        <motion.section {...aparecer(6)} className={cn(tarjeta, 'flex flex-col p-5 lg:col-span-2')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('finanzas')}>Finanzas</VerMas>}>Recaudo mensual</Titulo>
          <p className="mt-0.5 text-xs text-slate-500">Recaudado frente a lo facturado · cuotas de administración</p>
          <GraficoRecaudo datos={recaudoMensual} formato={millones} className="mt-4 h-64" />
        </motion.section>

        {/* Cartera */}
        <motion.section {...aparecer(7)} className={cn(tarjeta, 'flex flex-col p-5')}>
          <Titulo>Cartera del conjunto</Titulo>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4">
            <Anillo valor={carteraConjunto.alDia} total={carteraConjunto.apartamentos} className="size-40">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                {Math.round((carteraConjunto.alDia / carteraConjunto.apartamentos) * 100)}%
              </span>
              <span className="text-xs text-slate-500">al día</span>
            </Anillo>
            <dl className="grid w-full grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-brand-50/70 py-2.5">
                <dd className="text-lg font-extrabold text-brand-700 tabular-nums">{carteraConjunto.alDia}</dd>
                <dt className="text-[11px] font-medium text-slate-500">Aptos al día</dt>
              </div>
              <div className="rounded-xl bg-slate-50 py-2.5">
                <dd className="text-lg font-extrabold text-slate-700 tabular-nums">{carteraConjunto.enMora}</dd>
                <dt className="text-[11px] font-medium text-slate-500">En mora · {formatCOP(carteraConjunto.saldoMora)}</dt>
              </div>
            </dl>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Uso de zonas comunes */}
        <motion.section {...aparecer(8)} className={cn(tarjeta, 'p-5')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('reservas')}>Agenda</VerMas>}>Uso de zonas comunes</Titulo>
          <p className="mt-0.5 text-xs text-slate-500">Reservas aprobadas este mes</p>
          <ul className="mt-4 space-y-3">
            {usoZonas.map((z, i) => (
              <li key={z.id} className="group">
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
        </motion.section>

        {/* Incidencias por estado */}
        <motion.section {...aparecer(9)} className={cn(tarjeta, 'flex flex-col p-5')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('incidencias')}>Ver todas</VerMas>}>Incidencias</Titulo>
          <p className="mt-0.5 text-xs text-slate-500">{incidencias.length} reportes en total</p>
          <div className="mt-4 flex h-3 gap-0.5 overflow-hidden rounded-full">
            {porEstado.map(([e, n]) => (
              <motion.span
                key={e}
                className={cn('h-full first:rounded-l-full last:rounded-r-full', puntoEstado[e])}
                initial={{ flexGrow: 0 }}
                animate={{ flexGrow: n }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                title={`${e}: ${n}`}
              />
            ))}
          </div>
          <ul className="mt-4 space-y-2.5">
            {porEstado.map(([e, n]) => (
              <li key={e} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={cn('size-2.5 rounded-full', puntoEstado[e])} />
                  {e}
                </span>
                <span className="font-bold text-slate-900 tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4">
            <p className="rounded-xl bg-danger-bg px-3 py-2.5 text-xs font-medium text-danger-strong">
              {activas.filter((i) => i.prioridad === 'Alta').length} incidencias activas con prioridad alta
            </p>
          </div>
        </motion.section>

        {/* Por aprobar */}
        <motion.section {...aparecer(10)} className={cn(tarjeta, 'p-5')}>
          <Titulo>Por aprobar</Titulo>
          <ul className="mt-3 space-y-2">
            {reservasPendientes.slice(0, 3).map((r) => (
              <li key={r.id}>
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
                    <span className="block truncate text-xs text-slate-500">{r.residente}</span>
                  </span>
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">Reserva</span>
                </button>
              </li>
            ))}
            {pagosPendientes.slice(0, 2).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onNavigate('finanzas')}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
                    <FileCheck2 className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">{formatCOP(p.valor)}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {p.residente} · {p.banco}
                    </span>
                  </span>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pago</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  )
}

Dashboard.propTypes = { onNavigate: PropTypes.func.isRequired }
