import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Building2, CalendarDays, Check, CheckCircle2, FilePlus2, FileSearch, Hash, Receipt, RotateCcw, X } from 'lucide-react'
import { ArchivoProtegido, Button, EmptyState, Field, Input, Modal, Select, StatusBadge, Table, Textarea } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import { GraficoRecaudo } from '../../components/admin/Graficos'
import { adminApi, cartera, millones, recaudoPorPeriodo, useCarga } from '../../lib/admin'
import { conceptoObligacion, estadoObligacion, nombrePeriodo } from '../../lib/labels'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn, formatCOP } from '../../lib/utils'

const fmtFecha = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const ID_FORM = 'generar-cuotas'

const cargarTodo = () =>
  Promise.all([adminApi.obligaciones(), adminApi.pagosPorValidar(), adminApi.apartamentos()]).then(([obligaciones, pagos, apartamentos]) => ({
    obligaciones,
    pagos,
    apartamentos,
  }))

function Recibo({ pago, onRevisar }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={cn(tarjeta, 'relative overflow-hidden')}>
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <span className="rounded-md bg-slate-700 px-2 py-0.5 text-[11px] font-bold text-white">Transferencia</span>
        <span className="font-mono text-[11px] font-semibold text-slate-400">#{pago.id}</span>
      </div>
      <p className="px-4 pt-3 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{formatCOP(Number(pago.monto))}</p>
      <p className="px-4 text-xs text-slate-500">
        {conceptoObligacion[pago.concepto]} · {nombrePeriodo(pago.periodo)}
      </p>
      <div className="mx-4 my-3 border-t-2 border-dashed border-slate-200" />
      <p className="flex items-center gap-2 px-4 text-sm font-semibold text-slate-800">
        <Building2 className="size-4 text-slate-400" /> {pago.apartamento}
      </p>
      <p className="px-4 pl-10 text-xs text-slate-500">Reportado el {fmtFecha(pago.fecha)}</p>
      <div className="px-4 pb-4 pt-4">
        <Button size="sm" icon={FileSearch} onClick={() => onRevisar(pago)} className="w-full">
          Revisar pago
        </Button>
      </div>
    </motion.article>
  )
}

Recibo.propTypes = { pago: PropTypes.object.isRequired, onRevisar: PropTypes.func.isRequired }

// Genera la cuota del periodo para todos los apartamentos activos. Si ya existe, no la duplica.
function GenerarCuotas({ apartamentos, onClose, onGenerado }) {
  const hoy = new Date()
  const periodoActual = hoy.toISOString().slice(0, 7)
  const [datos, setDatos] = useState({ concepto: 'CUOTA_ADMINISTRACION', periodo: periodoActual, monto: '', fechaVencimiento: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const cambiar = (campo) => (e) => {
    setDatos((d) => ({ ...d, [campo]: e.target.value }))
    setErrores((x) => ({ ...x, [campo]: undefined }))
  }

  const generar = async (e) => {
    e.preventDefault()
    const encontrados = {}
    if (!datos.periodo) encontrados.periodo = 'Elige el mes de la cuota.'
    if (!(Number(datos.monto) > 0)) encontrados.monto = 'Escribe un valor mayor que cero.'
    if (!datos.fechaVencimiento) encontrados.fechaVencimiento = 'Elige la fecha límite de pago.'
    else if (new Date(`${datos.fechaVencimiento}T23:59`) <= hoy) encontrados.fechaVencimiento = 'La fecha límite debe ser posterior a hoy.'
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setGuardando(true)
    setErrorGeneral('')
    try {
      const creadas = await adminApi.generarObligaciones({ ...datos, monto: Number(datos.monto) })
      onGenerado(
        creadas.length
          ? `Se generaron ${creadas.length} ${creadas.length === 1 ? 'cuota' : 'cuotas'} de ${conceptoObligacion[datos.concepto].toLowerCase()} para ${nombrePeriodo(datos.periodo).toLowerCase()}.`
          : `Todos los apartamentos ya tenían esa cuota para ${nombrePeriodo(datos.periodo).toLowerCase()}. No se generó ninguna nueva.`,
      )
    } catch (err) {
      if (Object.keys(err.erroresCampo).length) setErrores(err.erroresCampo)
      else setErrorGeneral(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Generar cuotas"
      subtitle={`Se crea una cuota para cada uno de los ${apartamentos} apartamentos del conjunto`}
      icon={FilePlus2}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={ID_FORM} disabled={guardando}>
            {guardando ? 'Generando…' : 'Generar cuotas'}
          </Button>
        </>
      }
    >
      <form id={ID_FORM} onSubmit={generar} noValidate className="space-y-4">
        <Field label="Concepto" htmlFor="c-concepto" required>
          <Select id="c-concepto" value={datos.concepto} onChange={cambiar('concepto')}>
            {Object.entries(conceptoObligacion).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mes" htmlFor="c-periodo" required error={errores.periodo}>
            <Input id="c-periodo" type="month" value={datos.periodo} onChange={cambiar('periodo')} />
          </Field>
          <Field label="Valor por apartamento" htmlFor="c-monto" required error={errores.monto}>
            <Input id="c-monto" type="number" min="1" step="1000" inputMode="numeric" value={datos.monto} onChange={cambiar('monto')} placeholder="Ej. 350000" />
          </Field>
        </div>
        <Field label="Fecha límite de pago" htmlFor="c-vence" required error={errores.fechaVencimiento} hint="Después de esta fecha la cuota queda vencida.">
          <Input id="c-vence" type="date" value={datos.fechaVencimiento} onChange={cambiar('fechaVencimiento')} />
        </Field>
        {errorGeneral && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger-strong">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {errorGeneral}
          </p>
        )}
      </form>
    </Modal>
  )
}

GenerarCuotas.propTypes = { apartamentos: PropTypes.number.isRequired, onClose: PropTypes.func.isRequired, onGenerado: PropTypes.func.isRequired }

function RevisarPago({ pago, onClose, onDecidido }) {
  const [rechazando, setRechazando] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)

  const decidir = async (aprobar) => {
    if (!aprobar && !motivo.trim()) {
      setError('Escribe el motivo para que el residente sepa qué corregir.')
      return
    }
    setTrabajando(true)
    setError('')
    try {
      await adminApi.validarPago(pago.id, aprobar, aprobar ? null : motivo.trim())
      onDecidido(aprobar ? `Pago de ${pago.apartamento} aprobado y abonado a su cuenta.` : `Pago de ${pago.apartamento} rechazado. Se notificó el motivo.`)
    } catch (e) {
      setError(e.message)
      setTrabajando(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={rechazando ? 'Rechazar pago' : 'Revisar pago'}
      subtitle={`${pago.apartamento} · ${formatCOP(Number(pago.monto))}`}
      icon={rechazando ? X : FileSearch}
      size={rechazando ? 'md' : 'lg'}
      footer={
        rechazando ? (
          <>
            <Button variant="secondary" onClick={() => setRechazando(false)}>
              Volver
            </Button>
            <Button variant="danger" disabled={trabajando} onClick={() => decidir(false)}>
              Confirmar rechazo
            </Button>
          </>
        ) : (
          <>
            <Button variant="danger" icon={X} onClick={() => setRechazando(true)}>
              Rechazar
            </Button>
            <Button variant="success" icon={Check} disabled={trabajando} onClick={() => decidir(true)}>
              Aprobar pago
            </Button>
          </>
        )
      }
    >
      {rechazando ? (
        <Field label="Motivo del rechazo" htmlFor="p-motivo" required error={error} hint="El residente recibirá una notificación con este motivo.">
          <Textarea id="p-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. El valor de la transferencia no coincide con la cuota" />
        </Field>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500">Comprobante adjunto</p>
          {pago.urlComprobante ? (
            <ArchivoProtegido url={pago.urlComprobante} alt={`Comprobante de ${pago.apartamento}`} className="aspect-[3/4] w-full rounded-xl" />
          ) : (
            <p className="flex aspect-[3/4] items-center justify-center rounded-xl bg-slate-50 px-4 text-center text-xs text-slate-500">Este pago no trae comprobante.</p>
          )}
          {pago.urlComprobante && <p className="text-[11px] text-slate-400">Toca el comprobante para verlo en grande.</p>}
        </div>
        <dl className="space-y-3 text-sm">
          {[
            [Building2, 'Apartamento', pago.apartamento],
            [Receipt, 'Cuota', `${conceptoObligacion[pago.concepto]} · ${nombrePeriodo(pago.periodo)}`],
            [CalendarDays, 'Fecha del reporte', fmtFecha(pago.fecha)],
            [Hash, 'Referencia', pago.referencia ?? 'Sin referencia'],
          ].map(([Icono, k, v]) => (
            <div key={k} className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <Icono className="size-4" />
              </span>
              <div>
                <dt className="text-[11px] text-slate-500">{k}</dt>
                <dd className="font-semibold text-slate-800">{v}</dd>
              </div>
            </div>
          ))}
          <div className="rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
            <dt className="text-[11px] text-brand-700">Valor reportado</dt>
            <dd className="text-xl font-extrabold text-brand-800 tabular-nums">{formatCOP(Number(pago.monto))}</dd>
          </div>
          {error && <p className="text-sm font-medium text-danger-strong">{error}</p>}
        </dl>
        </div>
      )}
    </Modal>
  )
}

RevisarPago.propTypes = { pago: PropTypes.object.isRequired, onClose: PropTypes.func.isRequired, onDecidido: PropTypes.func.isRequired }

export default function Finanzas() {
  const { datos, error, recargar } = useCarga(cargarTodo, 'admin:finanzas')
  const [modal, setModal] = useState(null)
  const [aviso, setAviso] = useState('')
  const [periodoTabla, setPeriodoTabla] = useState('')

  const terminar = (mensaje) => {
    setModal(null)
    setAviso(mensaje)
    recargar()
  }

  const encabezado = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finanzas</h1>
        <p className="mt-1 text-sm text-slate-500">Cuotas del conjunto, recaudo y pagos por revisar</p>
      </div>
      {datos && (
        <Button icon={FilePlus2} onClick={() => setModal({ tipo: 'generar' })} disabled={!datos.apartamentos.length}>
          Generar cuotas
        </Button>
      )}
    </div>
  )

  if (error) {
    return (
      <div className="space-y-5">
        {encabezado}
        <div className={tarjeta}>
          <EmptyState
            icon={AlertCircle}
            title="No se pudo cargar la información financiera"
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

  if (!datos) {
    return (
      <div className="space-y-5" role="status" aria-label="Cargando finanzas">
        {encabezado}
        <div className="grid gap-5 lg:grid-cols-3">
          <div className={cn(tarjeta, 'h-72 animate-pulse')} />
          <div className={cn(tarjeta, 'h-72 animate-pulse lg:col-span-2')} />
        </div>
      </div>
    )
  }

  const { obligaciones, pagos, apartamentos } = datos
  const recaudo = recaudoPorPeriodo(obligaciones).map((r) => ({ ...r, mes: nombrePeriodo(r.periodo, true) }))
  const ultimo = recaudo.at(-1)
  const estadoCartera = cartera(obligaciones, apartamentos.length)
  const porRevisar = pagos.reduce((s, p) => s + Number(p.monto), 0)

  const periodos = [...new Set(obligaciones.map((o) => o.periodo))].sort().reverse()
  const periodo = periodoTabla || periodos[0]
  const cuotas = obligaciones.filter((o) => o.periodo === periodo).sort((a, b) => a.apartamento.localeCompare(b.apartamento))

  const columnas = [
    { key: 'apartamento', header: 'Apartamento', render: (o) => <span className="font-semibold text-slate-800">{o.apartamento}</span> },
    { key: 'concepto', header: 'Concepto', render: (o) => conceptoObligacion[o.concepto] },
    { key: 'monto', header: 'Valor', align: 'right', render: (o) => <span className="tabular-nums">{formatCOP(Number(o.montoTotal))}</span> },
    { key: 'saldo', header: 'Saldo', align: 'right', render: (o) => <span className="tabular-nums">{formatCOP(Number(o.saldoPendiente))}</span> },
    { key: 'vence', header: 'Vence', render: (o) => fmtFecha(`${o.fechaVencimiento}T12:00`) },
    {
      key: 'estado',
      header: 'Estado',
      render: (o) => <StatusBadge status={estadoObligacion[o.estado].label} tone={estadoObligacion[o.estado].tone} />,
    },
  ]

  return (
    <div className="space-y-5">
      {encabezado}

      <AnimatePresence>
        {aviso && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-strong ring-1 ring-green-200"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="flex-1 font-medium">{aviso}</span>
            <button type="button" onClick={() => setAviso('')} aria-label="Cerrar aviso" className="rounded p-1 hover:bg-white/60">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Resumen */}
        <motion.section {...aparecer(0)} className={cn(tarjeta, 'grid grid-cols-2 gap-3 p-5 lg:grid-cols-1')}>
          {[
            ['Por revisar', formatCOP(porRevisar), pagos.length === 1 ? '1 pago reportado' : `${pagos.length} pagos reportados`, 'bg-warning'],
            ['Facturado', ultimo ? millones(ultimo.facturado) : '—', ultimo ? nombrePeriodo(ultimo.periodo) : 'Sin cuotas generadas', 'bg-slate-400'],
            ['Recaudado', ultimo ? millones(ultimo.valor) : '—', ultimo ? nombrePeriodo(ultimo.periodo) : 'Sin cuotas generadas', 'bg-brand-500'],
            ['Cartera en mora', formatCOP(estadoCartera.saldoMora), estadoCartera.enMora === 1 ? '1 apartamento' : `${estadoCartera.enMora} apartamentos`, 'bg-danger'],
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
          <p className="mt-0.5 text-xs text-slate-500">Recaudado frente a lo facturado</p>
          {recaudo.length ? (
            <GraficoRecaudo datos={recaudo} formato={millones} className="mt-4 min-h-64 flex-1" />
          ) : (
            <div className="mt-4 flex min-h-64 flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 px-6 text-center">
              <p className="max-w-sm text-sm text-slate-500">
                Todavía no hay cuotas. Genera la cuota de administración del mes y aquí verás cuánto se facturó y cuánto se ha recaudado.
              </p>
              <Button size="sm" variant="outline" icon={FilePlus2} onClick={() => setModal({ tipo: 'generar' })} disabled={!apartamentos.length}>
                Generar cuotas
              </Button>
            </div>
          )}
        </motion.section>
      </div>

      {/* Pagos por revisar */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="size-2.5 rounded-[3px] bg-brand-500" />
          Pagos por revisar
          {pagos.length > 0 && <span className="rounded-full bg-warning-bg px-2 py-0.5 text-xs font-bold text-warning-strong">{pagos.length}</span>}
        </h2>
        {pagos.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {pagos.map((p) => (
                <Recibo key={p.id} pago={p} onRevisar={(pago) => setModal({ tipo: 'revisar', pago })} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className={cn(tarjeta, 'flex flex-col items-center gap-2 px-6 py-10 text-center')}>
            <span className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success-strong">
              <CheckCircle2 className="size-6" />
            </span>
            <p className="text-sm font-bold text-slate-900">No hay pagos por revisar</p>
            <p className="text-xs text-slate-500">Cuando un residente reporte una transferencia aparecerá aquí para que la apruebes.</p>
          </div>
        )}
      </section>

      {/* Cuotas por apartamento */}
      {periodos.length > 0 && (
        <motion.section {...aparecer(2)} className={cn(tarjeta, 'overflow-hidden')}>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
            <Titulo>Cuotas por apartamento</Titulo>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              Mes
              <Select value={periodo} onChange={(e) => setPeriodoTabla(e.target.value)} className="h-8 w-44 text-xs">
                {periodos.map((p) => (
                  <option key={p} value={p}>
                    {nombrePeriodo(p)}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <Table columns={columnas} data={cuotas} />
        </motion.section>
      )}

      {modal?.tipo === 'generar' && <GenerarCuotas apartamentos={apartamentos.length} onClose={() => setModal(null)} onGenerado={terminar} />}
      {modal?.tipo === 'revisar' && <RevisarPago pago={modal.pago} onClose={() => setModal(null)} onDecidido={terminar} />}
    </div>
  )
}
