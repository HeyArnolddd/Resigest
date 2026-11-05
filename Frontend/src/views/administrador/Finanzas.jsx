import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, CalendarDays, Check, FileSearch, Hash, Landmark, X } from 'lucide-react'
import { Avatar, Button, Field, Modal, Textarea } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import { GraficoRecaudo } from '../../components/admin/Graficos'
import { carteraConjunto, pagosManuales, recaudoMensual } from '../../data/mock'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn, formatCOP } from '../../lib/utils'

const PENDIENTE = 'Pendiente revisión'
const millones = (v) => `$${v.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`

// Color del banco para reconocerlo de un vistazo
const colorBanco = {
  Bancolombia: 'bg-yellow-300 text-yellow-950',
  Nequi: 'bg-fuchsia-600 text-white',
  Daviplata: 'bg-red-600 text-white',
  'Banco de Bogotá': 'bg-blue-700 text-white',
}

function Sello({ estado }) {
  const aprobado = estado === 'Aprobada'
  return (
    <motion.span
      initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
      animate={{ scale: 1, opacity: 1, rotate: -12 }}
      transition={{ type: 'spring', stiffness: 380, damping: 18 }}
      className={cn(
        'pointer-events-none absolute right-4 top-14 rounded-lg border-[3px] px-3 py-1 text-sm font-black uppercase tracking-widest',
        aprobado ? 'border-success text-success' : 'border-danger text-danger',
      )}
    >
      {aprobado ? 'Aprobado' : 'Rechazado'}
    </motion.span>
  )
}

Sello.propTypes = { estado: PropTypes.string.isRequired }

function Recibo({ pago, onRevisar }) {
  const pendiente = pago.estado === PENDIENTE
  return (
    <motion.article layout className="relative">
      <div className={cn('relative overflow-hidden', tarjeta, !pendiente && 'opacity-90')}>
        <div className="flex items-center justify-between gap-2 px-4 pt-4">
          <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-bold', colorBanco[pago.banco] ?? 'bg-slate-600 text-white')}>{pago.banco}</span>
          <span className="font-mono text-[11px] font-semibold text-slate-400">{pago.id}</span>
        </div>
        <p className="px-4 pt-3 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{formatCOP(pago.valor)}</p>
        <p className="px-4 text-xs text-slate-500">Cuota de administración</p>

        <div className="mx-4 my-3 border-t-2 border-dashed border-slate-200" />

        <div className="flex items-center gap-2.5 px-4">
          <Avatar nombre={pago.residente} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{pago.residente}</p>
            <p className="text-xs text-slate-500">
              {pago.apartamento} · {pago.fecha}
            </p>
          </div>
        </div>

        <div className="px-4 pb-4 pt-4">
          {pendiente ? (
            <Button size="sm" icon={FileSearch} onClick={() => onRevisar(pago)} className="w-full">
              Revisar comprobante
            </Button>
          ) : (
            <p className={cn('text-center text-xs font-semibold', pago.estado === 'Aprobada' ? 'text-success-strong' : 'text-danger-strong')}>
              {pago.estado === 'Aprobada' ? 'Abonado a la cuenta del apartamento' : 'Se notificó el motivo al residente'}
            </p>
          )}
        </div>

        {!pendiente && <Sello estado={pago.estado} />}
      </div>
    </motion.article>
  )
}

Recibo.propTypes = {
  pago: PropTypes.shape({
    id: PropTypes.string.isRequired,
    residente: PropTypes.string.isRequired,
    apartamento: PropTypes.string.isRequired,
    valor: PropTypes.number.isRequired,
    fecha: PropTypes.string.isRequired,
    banco: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired,
  }).isRequired,
  onRevisar: PropTypes.func.isRequired,
}

// Vista previa simulada del comprobante
function Comprobante({ pago }) {
  return (
    <div className="mx-auto w-full max-w-xs rotate-[-1deg] rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-bold', colorBanco[pago.banco] ?? 'bg-slate-600 text-white')}>{pago.banco}</span>
        <Check className="size-5 rounded-full bg-success p-1 text-white" strokeWidth={3} />
      </div>
      <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">Transferencia exitosa</p>
      <p className="text-center text-2xl font-extrabold text-slate-900 tabular-nums">{formatCOP(pago.valor)}</p>
      <dl className="mt-3 space-y-1 border-t border-dashed border-slate-200 pt-3 text-[11px]">
        {[
          ['Para', 'Conjunto Los Robles'],
          ['Referencia', pago.numeroConsignacion],
          ['Fecha', pago.fecha],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-slate-400">{k}</dt>
            <dd className="font-semibold text-slate-700">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 truncate text-center text-[10px] text-slate-400">{pago.comprobante}</p>
    </div>
  )
}

Comprobante.propTypes = { pago: PropTypes.object.isRequired }

export default function Finanzas() {
  const [lista, setLista] = useState(pagosManuales)
  const [revisado, setRevisado] = useState(null)
  const [modalRechazo, setModalRechazo] = useState(false)

  const decidir = (estado) => {
    setLista(lista.map((p) => (p.id === revisado.id ? { ...p, estado } : p)))
    setRevisado(null)
    setModalRechazo(false)
  }

  const pendientes = lista.filter((p) => p.estado === PENDIENTE)
  const porRevisar = pendientes.reduce((s, p) => s + p.valor, 0)
  const aprobados = lista.filter((p) => p.estado === 'Aprobada').length
  const ordenados = [...pendientes, ...lista.filter((p) => p.estado !== PENDIENTE)]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finanzas</h1>
        <p className="mt-1 text-sm text-slate-500">Recaudo del conjunto y pagos manuales por revisar</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Resumen */}
        <motion.section {...aparecer(0)} className={cn(tarjeta, 'grid grid-cols-2 gap-3 p-5 lg:grid-cols-1')}>
          {[
            ['Por revisar', formatCOP(porRevisar), `${pendientes.length} comprobantes`, 'bg-warning'],
            ['Aprobados hoy', String(aprobados), 'Pagos abonados', 'bg-success'],
            ['Cartera en mora', formatCOP(carteraConjunto.saldoMora), `${carteraConjunto.enMora} apartamentos`, 'bg-danger'],
            ['Recaudo de sep', millones(recaudoMensual.at(-1).valor), 'Cuotas de administración', 'bg-brand-500'],
          ].map(([etiqueta, valor, sub, punto]) => (
            <div key={etiqueta} className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
              <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className={cn('size-2 rounded-full', punto)} />
                {etiqueta}
              </p>
              <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 tabular-nums">{valor}</p>
              <p className="text-[11px] text-slate-400">{sub}</p>
            </div>
          ))}
        </motion.section>

        <motion.section {...aparecer(1)} className={cn(tarjeta, 'flex flex-col p-5 lg:col-span-2')}>
          <Titulo>Recaudo mensual</Titulo>
          <p className="mt-0.5 text-xs text-slate-500">Recaudado frente a lo facturado · cuotas de administración</p>
          <GraficoRecaudo datos={recaudoMensual} formato={millones} className="mt-4 min-h-64 flex-1" />
        </motion.section>
      </div>

      {/* Pagos manuales */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="size-2.5 rounded-[3px] bg-brand-500" />
          Pagos manuales
          {pendientes.length > 0 && (
            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs font-bold text-warning-strong">{pendientes.length} por revisar</span>
          )}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {ordenados.map((p) => (
              <Recibo key={p.id} pago={p} onRevisar={setRevisado} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <Modal
        open={Boolean(revisado) && !modalRechazo}
        onClose={() => setRevisado(null)}
        title="Revisar pago manual"
        subtitle={revisado?.id}
        icon={FileSearch}
        size="lg"
        footer={
          <>
            <Button variant="danger" onClick={() => setModalRechazo(true)} icon={X}>
              Rechazar
            </Button>
            <Button variant="success" onClick={() => decidir('Aprobada')} icon={Check}>
              Aprobar pago
            </Button>
          </>
        }
      >
        {revisado && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center rounded-xl bg-slate-100 p-5">
              <Comprobante pago={revisado} />
            </div>
            <dl className="space-y-3 text-sm">
              {[
                [Avatar, 'Residente', revisado.residente],
                [Building2, 'Apartamento', revisado.apartamento],
                [Landmark, 'Banco', revisado.banco],
                [Hash, 'N.º consignación', revisado.numeroConsignacion],
                [CalendarDays, 'Fecha', revisado.fecha],
              ].map(([Icono, k, v]) => (
                <div key={k} className="flex items-center gap-3">
                  {Icono === Avatar ? (
                    <Avatar nombre={revisado.residente} size="sm" />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Icono className="size-4" />
                    </span>
                  )}
                  <div>
                    <dt className="text-[11px] text-slate-500">{k}</dt>
                    <dd className="font-semibold text-slate-800">{v}</dd>
                  </div>
                </div>
              ))}
              <div className="rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
                <dt className="text-[11px] text-brand-700">Valor reportado</dt>
                <dd className="text-xl font-extrabold text-brand-800 tabular-nums">{formatCOP(revisado.valor)}</dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>

      <Modal
        open={modalRechazo}
        onClose={() => setModalRechazo(false)}
        title="Rechazar pago"
        subtitle={revisado ? `${revisado.residente} · ${formatCOP(revisado.valor)}` : ''}
        icon={X}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalRechazo(false)}>
              Volver
            </Button>
            <Button variant="danger" onClick={() => decidir('Rechazada')}>
              Confirmar rechazo
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Motivo del rechazo" required>
            <Textarea placeholder="Ej. El comprobante no coincide con el valor de la obligación…" />
          </Field>
          <p className="text-xs text-slate-500">El residente recibirá una notificación con el motivo del rechazo.</p>
        </div>
      </Modal>
    </div>
  )
}
