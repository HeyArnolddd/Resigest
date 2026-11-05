import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import {
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  Droplets,
  FileCheck2,
  Hourglass,
  Landmark,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { Button, Field, Input, Modal, Select, UploadBox } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import { aparecer, tarjeta } from '../../lib/panel'
import IlustracionBilletera from '../../components/finanzas/IlustracionBilletera'
import TableroTiza from '../../components/finanzas/TableroTiza'
import { conceptoObligacion, estadoObligacion, estadoPago, metodoPago } from '../../lib/labels'
import { alinearTooltip, cn, formatCOP } from '../../lib/utils'
import { obligacionesApto, pagosApto, residente } from '../../data/mock'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const POR_PAGAR = ['PENDIENTE', 'VENCIDA']

const mesDe = (periodo) => MESES[Number(periodo.split('-')[1]) - 1]
const periodoLargo = (periodo) => `${mesDe(periodo)} ${periodo.split('-')[0]}`
const periodoCorto = (periodo) => mesDe(periodo).slice(0, 3)
const fechaCorta = (iso) => {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}
const diasHasta = (iso, ahora) => {
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  return Math.round((new Date(`${iso}T00:00:00`) - hoy) / 86400000)
}

// Colores por estado de obligación/pago. Estados reservados: nunca se reutilizan para series.
const estilos = {
  PAGADA: { pill: 'bg-brand-50 text-brand-700 ring-brand-200', punto: 'bg-brand-500' },
  APROBADO: { pill: 'bg-brand-50 text-brand-700 ring-brand-200', punto: 'bg-brand-500' },
  EN_VERIFICACION: { pill: 'bg-sky-50 text-sky-700 ring-sky-200', punto: 'bg-sky-500' },
  PENDIENTE: { pill: 'bg-warning-bg text-warning-strong ring-amber-200', punto: 'bg-warning' },
  VENCIDA: { pill: 'bg-danger-bg text-danger-strong ring-red-200', punto: 'bg-danger' },
  RECHAZADO: { pill: 'bg-danger-bg text-danger-strong ring-red-200', punto: 'bg-danger' },
  INICIADO: { pill: 'bg-slate-100 text-slate-600 ring-slate-200', punto: 'bg-slate-400' },
}

function Pill({ estado, etiqueta }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
        estilos[estado]?.pill,
      )}
    >
      <span className={cn('size-1.5 rounded-full', estilos[estado]?.punto)} />
      {etiqueta}
    </span>
  )
}

Pill.propTypes = { estado: PropTypes.string.isRequired, etiqueta: PropTypes.string.isRequired }

function IconoConcepto({ concepto, className }) {
  const agua = concepto === 'SERVICIO_PUBLICO'
  const Icono = agua ? Droplets : Landmark
  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-xl',
        agua ? 'bg-sky-50 text-sky-700' : 'bg-brand-50 text-brand-700',
        className,
      )}
    >
      <Icono className="size-5" />
    </span>
  )
}

IconoConcepto.propTypes = { concepto: PropTypes.string.isRequired, className: PropTypes.string }

// Anillo con el reparto del último año: pagado, en verificación, pendiente y vencido.
function AnilloAnual({ segmentos, total }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const hueco = 3
  const pagado = segmentos.find((s) => s.clave === 'PAGADA')?.valor ?? 0
  // Cada segmento empieza donde terminan los anteriores
  const visibles = segmentos
    .filter((s) => s.valor > 0)
    .map((s, i, arr) => ({
      ...s,
      inicio: arr.slice(0, i).reduce((t, x) => t + (x.valor / total) * circ, 0),
    }))
  return (
    <div className="relative mx-auto size-44">
      <svg viewBox="0 0 140 140" className="size-full -rotate-90">
        <circle cx="70" cy="70" r={r} strokeWidth="14" className="fill-none stroke-slate-100" />
        {visibles.map((s) => (
          <motion.circle
            key={s.clave}
            cx="70"
            cy="70"
            r={r}
            strokeWidth="14"
            strokeDasharray={`${Math.max((s.valor / total) * circ - hueco, 1)} ${circ}`}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: -s.inicio }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={cn('fill-none', s.trazo)}
          >
            <title>
              {s.etiqueta}: {formatCOP(s.valor)}
            </title>
          </motion.circle>
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
          {Math.round((pagado / total) * 100)}%
        </p>
        <p className="text-xs font-medium text-slate-500">pagado</p>
      </div>
    </div>
  )
}

AnilloAnual.propTypes = { segmentos: PropTypes.array.isRequired, total: PropTypes.number.isRequired }

// Barras apiladas por mes (administración + agua). Los meses con algo sin pagar van rayados.
function FacturacionMensual({ meses }) {
  const max = Math.max(...meses.map((m) => m.admin + m.agua))
  return (
    <div>
      <div className="flex h-44 items-end gap-1.5 sm:gap-2.5" role="img" aria-label="Facturación de los últimos doce meses">
        {meses.map((m, i) => {
          const total = m.admin + m.agua
          return (
            <div key={m.periodo} className="group relative flex h-full flex-1 flex-col justify-end">
              <span className={cn('pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg [@media(hover:hover)]:group-hover:block', alinearTooltip(i, meses.length))}>
                <span className="block font-bold capitalize">{periodoLargo(m.periodo)}</span>
                Administración {formatCOP(m.admin)}
                {m.agua > 0 && <span className="block">Agua {formatCOP(m.agua)}</span>}
                <span className="block font-semibold">{m.alDia ? 'Pagado' : 'Con saldo por pagar'}</span>
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(total / max) * 100}%` }}
                transition={{ delay: i * 0.03, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex flex-col gap-0.5 overflow-hidden rounded-t-md"
              >
                {m.agua > 0 && (
                  <span style={{ flexGrow: m.agua }} className="block bg-sky-400 group-hover:bg-sky-500" />
                )}
                <span style={{ flexGrow: m.admin }} className="block bg-brand-400 group-hover:bg-brand-500" />
                {!m.alDia && (
                  <span className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.55)_0_3px,transparent_3px_7px)]" />
                )}
              </motion.div>
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5 border-t border-slate-100 pt-1.5 sm:gap-2.5">
        {/* En celular no caben 12 meses: se muestra uno sí y uno no */}
        {meses.map((m, i) => (
          <span
            key={m.periodo}
            className={cn('min-w-0 flex-1 text-center text-[11px] capitalize text-slate-500', i % 2 === 0 && 'max-sm:invisible')}
          >
            {periodoCorto(m.periodo)}
          </span>
        ))}
      </div>
    </div>
  )
}

FacturacionMensual.propTypes = { meses: PropTypes.array.isRequired }

function Sparkline({ valores }) {
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const puntos = valores.map((v, i) => [(i / (valores.length - 1)) * 100, 34 - ((v - min) / (max - min || 1)) * 28])
  const linea = puntos.map(([x, y]) => `${x},${y}`).join(' ')
  const [ux, uy] = puntos.at(-1)
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-12 w-full overflow-visible" aria-hidden="true">
      <polygon points={`0,40 ${linea} 100,40`} className="fill-sky-100" />
      <polyline points={linea} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" className="fill-none stroke-sky-500" />
      <circle cx={ux} cy={uy} r="2.5" className="fill-sky-600" />
    </svg>
  )
}

Sparkline.propTypes = { valores: PropTypes.array.isRequired }

export default function Finanzas() {
  const ahora = new Date()
  const [lista, setLista] = useState(obligacionesApto)
  const [pagos, setPagos] = useState(pagosApto)
  const [filtro, setFiltro] = useState('todas')
  const [verTodo, setVerTodo] = useState(false)

  // Pago en línea (simulación de Wompi)
  const [aPagar, setAPagar] = useState(null)
  const [pasoWompi, setPasoWompi] = useState('revisar')
  const [medio, setMedio] = useState('PSE')

  // Reporte de transferencia
  const [modalManual, setModalManual] = useState(false)
  const [manualId, setManualId] = useState('')
  const [manualEnviado, setManualEnviado] = useState(false)

  const porPagar = lista.filter((o) => POR_PAGAR.includes(o.estado))
  const enVerificacion = lista.filter((o) => o.estado === 'EN_VERIFICACION')
  const saldo = porPagar.reduce((t, o) => t + o.saldoPendiente, 0)
  const proxima = [...porPagar].sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento)).at(-1)
  const vencidas = porPagar.filter((o) => o.estado === 'VENCIDA')

  const suma = (estado) => lista.filter((o) => o.estado === estado).reduce((t, o) => t + o.montoTotal, 0)
  const totalAnual = lista.reduce((t, o) => t + o.montoTotal, 0)
  const segmentos = [
    { clave: 'PAGADA', etiqueta: 'Pagado', valor: suma('PAGADA'), trazo: 'stroke-brand-500', punto: 'bg-brand-500' },
    { clave: 'EN_VERIFICACION', etiqueta: 'En verificación', valor: suma('EN_VERIFICACION'), trazo: 'stroke-sky-500', punto: 'bg-sky-500' },
    { clave: 'PENDIENTE', etiqueta: 'Pendiente', valor: suma('PENDIENTE'), trazo: 'stroke-warning', punto: 'bg-warning' },
    { clave: 'VENCIDA', etiqueta: 'Vencido', valor: suma('VENCIDA'), trazo: 'stroke-danger', punto: 'bg-danger' },
  ]

  const periodos = [...new Set(lista.map((o) => o.periodo))].sort().slice(-12)
  const meses = periodos.map((periodo) => {
    const delMes = lista.filter((o) => o.periodo === periodo)
    const de = (concepto) => delMes.filter((o) => o.concepto === concepto).reduce((t, o) => t + o.montoTotal, 0)
    return {
      periodo,
      admin: de('CUOTA_ADMINISTRACION'),
      agua: de('SERVICIO_PUBLICO'),
      alDia: delMes.every((o) => o.estado === 'PAGADA'),
    }
  })
  const promedio = Math.round(meses.reduce((t, m) => t + m.admin + m.agua, 0) / meses.length)

  const porConcepto = ['CUOTA_ADMINISTRACION', 'SERVICIO_PUBLICO'].map((concepto) => ({
    concepto,
    valor: lista.filter((o) => o.concepto === concepto).reduce((t, o) => t + o.montoTotal, 0),
  }))
  const recibosAgua = lista.filter((o) => o.concepto === 'SERVICIO_PUBLICO')
  const ultimoAgua = recibosAgua.at(-1)
  const variacionAgua = Math.round(((ultimoAgua.montoTotal - recibosAgua.at(-2).montoTotal) / recibosAgua.at(-2).montoTotal) * 100)

  const historial = [...lista]
    .reverse()
    .filter((o) =>
      filtro === 'todas' ? true : filtro === 'porPagar' ? o.estado !== 'PAGADA' : o.estado === 'PAGADA',
    )

  const abrirWompi = (obligaciones) => {
    setAPagar(obligaciones)
    setPasoWompi('revisar')
    setMedio('PSE')
  }

  const simularPago = () => {
    setPasoWompi('procesando')
    setTimeout(() => {
      const ids = aPagar.map((o) => o.id)
      setLista((l) => l.map((o) => (ids.includes(o.id) ? { ...o, estado: 'PAGADA', saldoPendiente: 0 } : o)))
      setPagos((p) => [
        ...aPagar.map((o, i) => ({
          id: Math.max(...p.map((x) => x.id)) + 1 + i,
          metodo: 'WOMPI',
          monto: o.montoTotal,
          estado: 'APROBADO',
          fecha: `${ahora.toISOString().slice(0, 10)}T${ahora.toTimeString().slice(0, 8)}`,
          obligacionId: o.id,
          referencia: `PAGO-${(o.id * 7919).toString(36).toUpperCase()}`,
        })),
        ...p,
      ])
      setPasoWompi('exito')
    }, 1400)
  }

  const abrirManual = (id) => {
    setManualId(String(id ?? porPagar[0]?.id ?? ''))
    setManualEnviado(false)
    setModalManual(true)
  }

  const enviarManual = () => {
    const o = lista.find((x) => String(x.id) === manualId)
    if (!o) return
    setLista((l) => l.map((x) => (x.id === o.id ? { ...x, estado: 'EN_VERIFICACION' } : x)))
    setPagos((p) => [
      {
        id: Math.max(...p.map((x) => x.id)) + 1,
        metodo: 'TRANSFERENCIA',
        monto: o.montoTotal,
        estado: 'EN_VERIFICACION',
        fecha: `${ahora.toISOString().slice(0, 10)}T${ahora.toTimeString().slice(0, 8)}`,
        obligacionId: o.id,
        referencia: 'TRF-NUEVA',
      },
      ...p,
    ])
    setManualEnviado(true)
  }

  const totalAPagar = aPagar?.reduce((t, o) => t + o.saldoPendiente, 0) ?? 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finanzas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Estado de cuenta de {residente.torre} · Apartamento {residente.apto}
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <ShieldCheck className="size-4 text-brand-600" />
          Pagos protegidos con Wompi
        </p>
      </div>

      {/* Tarjeta de cuenta + resumen anual */}
      <div className="grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.section
          {...aparecer(0)}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-700 p-6 text-white sm:p-7 lg:col-span-8"
        >
          <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <path d="M0 170 L400 40 L400 80 L0 210 Z" className="fill-white/[0.04]" />
            <circle cx="40" cy="-10" r="70" className="fill-brand-500/40" />
          </svg>
          <IlustracionBilletera className="pointer-events-none absolute -bottom-2 right-2 hidden w-72 sm:block lg:w-80" />

          <div className="relative max-w-md">
            <div className="flex items-center gap-3">
              <span className="h-7 w-10 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 shadow-inner" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-100">Saldo por pagar</p>
            </div>
            <p className="mt-3 text-5xl font-extrabold tracking-tight tabular-nums">{formatCOP(saldo)}</p>
            <p className="mt-2 text-sm text-brand-50">
              {porPagar.length === 0
                ? 'Estás al día. ¡Gracias por pagar a tiempo!'
                : `${porPagar.length} obligaci${porPagar.length === 1 ? 'ón' : 'ones'} por pagar${vencidas.length ? `, ${vencidas.length} vencida${vencidas.length === 1 ? '' : 's'}` : ''}.`}
            </p>
            {proxima && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20">
                <CalendarClock className="size-3.5" />
                La cuota de {mesDe(proxima.periodo)} vence el {fechaCorta(proxima.fechaVencimiento)}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!porPagar.length}
                onClick={() => abrirWompi(porPagar)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-lg shadow-brand-950/25 outline-none transition-colors hover:bg-brand-50 focus-visible:ring-4 focus-visible:ring-white/40 disabled:opacity-60"
              >
                <CreditCard className="size-4" />
                Pagar todo en línea
              </button>
              <button
                type="button"
                disabled={!porPagar.length}
                onClick={() => abrirManual()}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white outline-none backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
              >
                <ArrowLeftRight className="size-4" />
                Reportar transferencia
              </button>
            </div>
            <p className="mt-6 font-mono text-xs tracking-[0.2em] text-brand-100/80">
              {residente.nombre.toUpperCase()} · T2 · 304
            </p>
          </div>
        </motion.section>

        <motion.section {...aparecer(1)} className={cn(tarjeta, 'flex flex-col p-6 lg:col-span-4')}>
          <Titulo accion={<span className="text-xs font-medium text-slate-400">Últimos 12 meses</span>}>Tu año en pagos</Titulo>
          <div className="mt-4">
            <AnilloAnual segmentos={segmentos} total={totalAnual} />
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
            {segmentos.map((s) => (
              <li key={s.clave}>
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={cn('size-2.5 rounded-sm', s.punto)} />
                  {s.etiqueta}
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">{formatCOP(s.valor)}</p>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      {/* Facturación mensual + por concepto */}
      <div className="grid gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.section {...aparecer(2)} className={cn(tarjeta, 'p-6 lg:col-span-8')}>
          <Titulo
            accion={
              <div className="flex gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-brand-400" /> Administración
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-sky-400" /> Agua
                </span>
                <span className="hidden items-center gap-1.5 sm:flex">
                  <span className="size-2.5 rounded-sm bg-brand-400 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.6)_0_2px,transparent_2px_4px)]" />
                  Sin pagar
                </span>
              </div>
            }
          >
            Facturación por mes
          </Titulo>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-xs text-slate-500">Promedio mensual</p>
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{formatCOP(promedio)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total facturado</p>
              <p className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{formatCOP(totalAnual)}</p>
            </div>
          </div>
          <div className="mt-6">
            <FacturacionMensual meses={meses} />
          </div>
        </motion.section>

        <motion.section {...aparecer(3)} className={cn(tarjeta, 'flex flex-col p-6 lg:col-span-4')}>
          <Titulo>¿En qué se va tu dinero?</Titulo>
          <ul className="mt-5 space-y-4">
            {porConcepto.map((c) => {
              const pct = Math.round((c.valor / totalAnual) * 100)
              const agua = c.concepto === 'SERVICIO_PUBLICO'
              return (
                <li key={c.concepto}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-semibold text-slate-800">{conceptoObligacion[c.concepto]}</span>
                    <span className="text-xs font-bold text-slate-600 tabular-nums">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className={cn('h-full rounded-full', agua ? 'bg-sky-400' : 'bg-brand-400')}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 tabular-nums">{formatCOP(c.valor)} en el año</p>
                </li>
              )
            })}
          </ul>
          <div className="mt-auto pt-5">
            <div className="rounded-xl bg-sky-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
                    <Droplets className="size-3.5" /> Último recibo de agua
                  </p>
                  <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    {formatCOP(ultimoAgua.montoTotal)}
                  </p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-bold',
                    variacionAgua > 0 ? 'bg-warning-bg text-warning-strong' : 'bg-brand-50 text-brand-700',
                  )}
                >
                  {variacionAgua > 0 ? '▲' : '▼'} {Math.abs(variacionAgua)}%
                </span>
              </div>
              <Sparkline valores={recibosAgua.map((o) => o.montoTotal)} />
              <p className="text-[11px] text-slate-500">Últimos {recibosAgua.length} recibos · se cobra cada dos meses</p>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Por pagar + pagos recientes */}
      <div className="grid items-start gap-5 lg:grid-cols-12 [&>*]:min-w-0">
        <motion.section {...aparecer(4)} className={cn(tarjeta, 'p-6 lg:col-span-7')}>
          <Titulo accion={<span className="text-xs font-medium text-slate-400">{porPagar.length + enVerificacion.length} abiertas</span>}>
            Por pagar
          </Titulo>
          {porPagar.length + enVerificacion.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-xl bg-brand-50 p-8 text-center">
              <CheckCircle2 className="size-10 text-brand-600" />
              <p className="text-sm font-bold text-slate-900">Estás al día</p>
              <p className="text-xs text-slate-500">No tienes obligaciones pendientes.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {[...porPagar, ...enVerificacion]
                .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento))
                .map((o) => {
                  const dias = diasHasta(o.fechaVencimiento, ahora)
                  return (
                    <li
                      key={o.id}
                      className={cn(
                        'flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center',
                        o.estado === 'VENCIDA' ? 'border-red-200 bg-danger-bg/40' : 'border-slate-200',
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <IconoConcepto concepto={o.concepto} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">
                            {conceptoObligacion[o.concepto]} <span className="font-medium capitalize text-slate-500">· {mesDe(o.periodo)}</span>
                          </p>
                          <p
                            className={cn(
                              'mt-0.5 text-xs',
                              o.estado === 'VENCIDA' ? 'font-semibold text-danger-strong' : 'text-slate-500',
                            )}
                          >
                            {o.estado === 'EN_VERIFICACION'
                              ? 'La administración está revisando tu comprobante'
                              : dias < 0
                                ? `Venció hace ${-dias} día${dias === -1 ? '' : 's'} · ${fechaCorta(o.fechaVencimiento)}`
                                : dias === 0
                                  ? 'Vence hoy'
                                  : `Vence en ${dias} días · ${fechaCorta(o.fechaVencimiento)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="text-right">
                          <p className="text-base font-extrabold text-slate-900 tabular-nums">{formatCOP(o.montoTotal)}</p>
                          <Pill estado={o.estado} etiqueta={estadoObligacion[o.estado].label} />
                        </div>
                        {o.estado === 'EN_VERIFICACION' ? (
                          <span className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600" title="En verificación">
                            <Hourglass className="size-4" />
                          </span>
                        ) : (
                          <Button size="sm" onClick={() => abrirWompi([o])}>
                            Pagar
                          </Button>
                        )}
                      </div>
                    </li>
                  )
                })}
            </ul>
          )}
        </motion.section>

        <motion.section {...aparecer(5)} className={cn(tarjeta, 'p-6 lg:col-span-5')}>
          <Titulo>Pagos recientes</Titulo>
          <ol className="mt-4">
            {pagos.slice(0, 5).map((p, i, arr) => {
              const o = lista.find((x) => x.id === p.obligacionId)
              const Icono = p.metodo === 'WOMPI' ? CreditCard : ArrowLeftRight
              return (
                <li key={p.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < arr.length - 1 && <span className="absolute bottom-0 left-[19px] top-10 w-px bg-slate-200" aria-hidden="true" />}
                  <span
                    className={cn(
                      'relative flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white',
                      p.estado === 'APROBADO' ? 'bg-brand-600 text-white' : 'bg-sky-100 text-sky-700',
                    )}
                  >
                    <Icono className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {o ? `${conceptoObligacion[o.concepto]} · ${mesDe(o.periodo)}` : 'Pago'}
                      </p>
                      <p className="shrink-0 text-sm font-bold text-slate-900 tabular-nums">{formatCOP(p.monto)}</p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-slate-500">
                        {metodoPago[p.metodo]} · {fechaCorta(p.fecha)} · <span className="font-mono">{p.referencia}</span>
                      </p>
                      {p.estado === 'APROBADO' ? (
                        <button
                          type="button"
                          aria-label="Descargar comprobante"
                          title="Descargar comprobante (PDF)"
                          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 outline-none transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <Download className="size-3.5" />
                        </button>
                      ) : (
                        <Pill estado={p.estado} etiqueta={estadoPago[p.estado].label} />
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </motion.section>
      </div>

      {/* Historial en tablero de tiza */}
      <motion.section {...aparecer(6)}>
        <TableroTiza
          obligaciones={historial}
          filtro={filtro}
          onFiltro={setFiltro}
          verTodo={verTodo}
          onVerTodo={() => setVerTodo(!verTodo)}
          onPagar={(o) => abrirWompi([o])}
        />
      </motion.section>

      {/* Pago en línea */}
      <Modal
        open={Boolean(aPagar)}
        onClose={() => setAPagar(null)}
        title="Pagar en línea"
        subtitle="Pasarela Wompi · entorno de demostración"
        icon={CreditCard}
        footer={
          pasoWompi === 'exito' ? (
            <Button onClick={() => setAPagar(null)}>Listo</Button>
          ) : pasoWompi === 'revisar' ? (
            <>
              <Button variant="secondary" onClick={() => setAPagar(null)}>
                Cancelar
              </Button>
              <Button onClick={simularPago}>Pagar {formatCOP(totalAPagar)}</Button>
            </>
          ) : null
        }
      >
        {pasoWompi === 'revisar' && aPagar && (
          <div className="space-y-4">
            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50">
              {aPagar.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="text-slate-600">
                    {conceptoObligacion[o.concepto]} · <span className="capitalize">{periodoLargo(o.periodo)}</span>
                  </span>
                  <span className="font-semibold text-slate-900 tabular-nums">{formatCOP(o.saldoPendiente)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">Total</span>
                <span className="text-lg font-extrabold text-brand-700 tabular-nums">{formatCOP(totalAPagar)}</span>
              </li>
            </ul>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Medio de pago</p>
              <div className="grid grid-cols-3 gap-2">
                {['PSE', 'Tarjeta crédito', 'Nequi'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMedio(m)}
                    aria-pressed={medio === m}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                      medio === m
                        ? 'border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500'
                        : 'border-slate-300 text-slate-700 hover:border-brand-300',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <ShieldCheck className="size-3.5" /> No se realizan cobros reales en este prototipo
            </p>
          </div>
        )}
        {pasoWompi === 'procesando' && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="size-10 animate-spin text-brand-600" />
            <p className="text-sm font-medium text-slate-600">Conectando con Wompi y procesando el pago…</p>
          </div>
        )}
        {pasoWompi === 'exito' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="size-12 text-brand-600" />
            <p className="text-base font-bold text-slate-900">¡Pago aprobado!</p>
            <p className="max-w-xs text-sm text-slate-500">
              Tus obligaciones quedaron pagadas. El comprobante está en Pagos recientes y te llega por correo.
            </p>
          </div>
        )}
      </Modal>

      {/* Reporte de transferencia */}
      <Modal
        open={modalManual}
        onClose={() => setModalManual(false)}
        title="Reportar transferencia"
        subtitle="La administración valida el comprobante en 1 a 2 días hábiles"
        icon={FileCheck2}
        footer={
          manualEnviado ? (
            <Button onClick={() => setModalManual(false)}>Listo</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setModalManual(false)}>
                Cancelar
              </Button>
              <Button onClick={enviarManual} disabled={!manualId}>
                Enviar reporte
              </Button>
            </>
          )
        }
      >
        {manualEnviado ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-11 text-brand-600" />
            <p className="text-base font-bold text-slate-900">Reporte enviado</p>
            <p className="max-w-xs text-sm text-slate-500">
              Verás la obligación como “En verificación” hasta que la administración apruebe el comprobante.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="¿Qué estás pagando?" required>
              <Select value={manualId} onChange={(e) => setManualId(e.target.value)}>
                {porPagar.map((o) => (
                  <option key={o.id} value={o.id}>
                    {conceptoObligacion[o.concepto]} · {periodoLargo(o.periodo)} · {formatCOP(o.montoTotal)}
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Banco o medio" required>
                <Select defaultValue="Bancolombia">
                  <option>Bancolombia</option>
                  <option>Banco de Bogotá</option>
                  <option>Davivienda</option>
                  <option>Nequi</option>
                  <option>Daviplata</option>
                </Select>
              </Field>
              <Field label="Fecha de la transferencia" required>
                <Input type="date" defaultValue={ahora.toISOString().slice(0, 10)} />
              </Field>
            </div>
            <Field label="Número de referencia" required>
              <Input placeholder="Ej. CMS-8842210" />
            </Field>
            <Field label="Comprobante" required hint="PDF o imagen del comprobante">
              <UploadBox hint="Adjuntar comprobante de pago" />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}
