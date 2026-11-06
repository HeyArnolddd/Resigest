import { useEffect, useMemo, useState } from 'react'
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

// El nombre de la torre puede venir solo como número ("1")
const nombreTorre = (nombre) => (/^\d+$/.test(nombre) ? `Torre ${nombre}` : nombre)

const ordenarApartamentos = (a, b) =>
  a.torreNombre.localeCompare(b.torreNombre, 'es', { numeric: true }) || a.numero.localeCompare(b.numero, 'es', { numeric: true })

// Genera la cuota del mes para todos los apartamentos activos o solo para los elegidos,
// cada uno con el valor general o con uno propio. Si un apartamento ya la tiene, no la duplica.
function GenerarCuotas({ apartamentos, onClose, onGenerado }) {
  const hoy = new Date()
  const periodoActual = hoy.toISOString().slice(0, 7)
  const [datos, setDatos] = useState({ concepto: 'CUOTA_ADMINISTRACION', periodo: periodoActual, monto: '', fechaVencimiento: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  // ¿Para quiénes? 'todos' o 'elegir'. elegidos: { [apartamentoId]: valor propio ('' = valor general) }
  const [para, setPara] = useState('todos')
  const [elegidos, setElegidos] = useState(null)
  const [residentes, setResidentes] = useState(null)

  const activos = useMemo(() => apartamentos.filter((a) => a.activo).sort(ordenarApartamentos), [apartamentos])
  useEffect(() => {
    adminApi
      .residentes()
      .then(setResidentes)
      .catch(() => setResidentes([]))
  }, [])
  const ocupantes = useMemo(() => {
    const mapa = {}
    for (const r of residentes ?? []) {
      if (r.apartamentoId) (mapa[r.apartamentoId] ??= []).push(r.nombreCompleto)
    }
    return mapa
  }, [residentes])
  const habitados = activos.filter((a) => ocupantes[a.id])
  const torres = useMemo(() => {
    const grupos = new Map()
    for (const a of activos) {
      if (!grupos.has(a.torreNombre)) grupos.set(a.torreNombre, [])
      grupos.get(a.torreNombre).push(a)
    }
    return [...grupos.entries()]
  }, [activos])

  const cambiar = (campo) => (e) => {
    setDatos((d) => ({ ...d, [campo]: e.target.value }))
    setErrores((x) => ({ ...x, [campo]: undefined }))
  }

  const seleccionar = (lista) => setElegidos(Object.fromEntries(lista.map((a) => [a.id, elegidos?.[a.id] ?? ''])))
  const elegirPara = (valor) => {
    setPara(valor)
    setErrores((x) => ({ ...x, apartamentos: undefined }))
    // Al empezar a elegir, se marcan los apartamentos con residentes (o todos si aún no hay)
    if (valor === 'elegir' && elegidos === null) seleccionar(habitados.length ? habitados : activos)
  }
  const alternar = (id) =>
    setElegidos((actual) => {
      const nuevo = { ...actual }
      if (id in nuevo) delete nuevo[id]
      else nuevo[id] = ''
      return nuevo
    })
  const alternarTorre = (lista, todas) =>
    setElegidos((actual) => {
      const nuevo = { ...actual }
      for (const a of lista) {
        if (todas) delete nuevo[a.id]
        else nuevo[a.id] ??= ''
      }
      return nuevo
    })
  const valorPropio = (id, valor) => setElegidos((actual) => ({ ...actual, [id]: valor }))

  const general = Number(datos.monto) > 0 ? Number(datos.monto) : 0
  const destino =
    para === 'todos'
      ? activos.map((a) => ({ id: a.id, valor: general }))
      : Object.entries(elegidos ?? {}).map(([id, v]) => ({ id: Number(id), valor: v === '' ? general : Number(v) }))
  const total = destino.reduce((t, d) => t + (d.valor || 0), 0)

  const generar = async (e) => {
    e.preventDefault()
    const encontrados = {}
    if (!datos.periodo) encontrados.periodo = 'Elige el mes de la cuota.'
    if (!(Number(datos.monto) > 0)) encontrados.monto = 'Escribe un valor mayor que cero.'
    if (!datos.fechaVencimiento) encontrados.fechaVencimiento = 'Elige la fecha límite de pago.'
    else if (new Date(`${datos.fechaVencimiento}T23:59`) <= hoy) encontrados.fechaVencimiento = 'La fecha límite debe ser posterior a hoy.'
    if (para === 'elegir') {
      if (!destino.length) encontrados.apartamentos = 'Elige al menos un apartamento.'
      else if (Object.values(elegidos).some((v) => v !== '' && !(Number(v) > 0)))
        encontrados.apartamentos = 'Los valores propios deben ser mayores que cero (o déjalos vacíos para usar el valor general).'
    }
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setGuardando(true)
    setErrorGeneral('')
    try {
      const creadas = await adminApi.generarObligaciones({
        ...datos,
        monto: Number(datos.monto),
        apartamentos:
          para === 'elegir'
            ? Object.entries(elegidos).map(([id, v]) => ({ apartamentoId: Number(id), monto: v === '' ? null : Number(v) }))
            : undefined,
      })
      const omitidas = destino.length - creadas.length
      const concepto = conceptoObligacion[datos.concepto].toLowerCase()
      const mes = nombrePeriodo(datos.periodo).toLowerCase()
      onGenerado(
        creadas.length
          ? `Se generaron ${creadas.length} ${creadas.length === 1 ? 'cuota' : 'cuotas'} de ${concepto} para ${mes}.${
              omitidas > 0 ? ` ${omitidas} ${omitidas === 1 ? 'apartamento ya la tenía' : 'apartamentos ya la tenían'}.` : ''
            }`
          : `${para === 'todos' ? 'Todos los apartamentos' : 'Los apartamentos elegidos'} ya tenían esa cuota para ${mes}. No se generó ninguna nueva.`,
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
      size="lg"
      title="Generar cuotas"
      subtitle="Elige el cobro, para quiénes es y cuánto paga cada uno"
      icon={FilePlus2}
      footer={
        <>
          <p className="mr-auto hidden text-xs text-slate-500 sm:block">
            {destino.length} {destino.length === 1 ? 'cuota' : 'cuotas'}
            {general > 0 && <> · total {formatCOP(total)}</>}
          </p>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={ID_FORM} disabled={guardando}>
            {guardando ? 'Generando…' : `Generar ${destino.length} ${destino.length === 1 ? 'cuota' : 'cuotas'}`}
          </Button>
        </>
      }
    >
      <form id={ID_FORM} onSubmit={generar} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Concepto" htmlFor="c-concepto" required>
            <Select id="c-concepto" value={datos.concepto} onChange={cambiar('concepto')}>
              {Object.entries(conceptoObligacion).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mes" htmlFor="c-periodo" required error={errores.periodo}>
            <Input id="c-periodo" type="month" value={datos.periodo} onChange={cambiar('periodo')} />
          </Field>
          <Field
            label="Valor general"
            htmlFor="c-monto"
            required
            error={errores.monto}
            hint={para === 'elegir' ? 'Se usa en los apartamentos sin valor propio.' : 'El mismo valor para cada apartamento.'}
          >
            <Input id="c-monto" type="number" min="1" step="1000" inputMode="numeric" value={datos.monto} onChange={cambiar('monto')} placeholder="Ej. 350000" />
          </Field>
          <Field label="Fecha límite de pago" htmlFor="c-vence" required error={errores.fechaVencimiento} hint="Después de esta fecha la cuota queda vencida.">
            <Input id="c-vence" type="date" value={datos.fechaVencimiento} onChange={cambiar('fechaVencimiento')} />
          </Field>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-800">¿Para quiénes es la cuota?</legend>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Para quiénes es la cuota">
            {[
              { clave: 'todos', titulo: `Todos los apartamentos (${activos.length})`, texto: 'Mismo valor para todo el conjunto.' },
              { clave: 'elegir', titulo: 'Elegir apartamentos', texto: 'Solo algunos, y con un valor propio si lo necesitas.' },
            ].map(({ clave, titulo, texto }) => {
              const activa = para === clave
              return (
                <button
                  key={clave}
                  type="button"
                  role="radio"
                  aria-checked={activa}
                  onClick={() => elegirPara(clave)}
                  className={cn(
                    'flex flex-col gap-1 rounded-xl border p-3.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                    activa ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 hover:border-brand-300',
                  )}
                >
                  <span className="text-sm font-bold text-slate-900">{titulo}</span>
                  <span className="text-xs text-slate-500">{texto}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        {para === 'elegir' && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Marcar:</span>
              {[
                ['Con residentes', habitados],
                ['Todos', activos],
                ['Ninguno', []],
              ].map(([etiqueta, lista]) => (
                <button
                  key={etiqueta}
                  type="button"
                  onClick={() => seleccionar(lista)}
                  className="rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-700 outline-none transition-colors hover:border-brand-400 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {etiqueta}
                  {lista.length > 0 && ` (${lista.length})`}
                </button>
              ))}
              {residentes === null && <span className="text-slate-400">Cargando residentes…</span>}
            </div>

            <div className="max-h-80 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200">
              {torres.map(([torre, lista]) => {
                const marcados = lista.filter((a) => a.id in (elegidos ?? {})).length
                const todas = marcados === lista.length
                return (
                  <section key={torre}>
                    <label className="sticky top-0 z-10 flex cursor-pointer items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2">
                      <input
                        type="checkbox"
                        checked={todas}
                        ref={(el) => {
                          if (el) el.indeterminate = marcados > 0 && !todas
                        }}
                        onChange={() => alternarTorre(lista, todas)}
                        className="size-4 accent-brand-600"
                      />
                      <span className="text-sm font-bold text-slate-800">{nombreTorre(torre)}</span>
                      <span className="ml-auto text-xs text-slate-500">
                        {marcados} de {lista.length}
                      </span>
                    </label>
                    <ul className="divide-y divide-slate-100">
                      {lista.map((a) => {
                        const marcado = a.id in (elegidos ?? {})
                        const nombres = ocupantes[a.id]
                        return (
                          <li key={a.id} className={cn('flex items-center gap-3 px-4 py-2', !marcado && 'opacity-60')}>
                            <input
                              id={`apto-${a.id}`}
                              type="checkbox"
                              checked={marcado}
                              onChange={() => alternar(a.id)}
                              className="size-4 shrink-0 accent-brand-600"
                            />
                            <label htmlFor={`apto-${a.id}`} className="min-w-0 flex-1 cursor-pointer">
                              <span className="block text-sm font-semibold text-slate-800">Apto {a.numero}</span>
                              <span className="block truncate text-xs text-slate-500">
                                {nombres ? nombres.join(', ') : residentes === null ? '…' : 'Sin residentes'}
                              </span>
                            </label>
                            <div className="relative w-32 shrink-0">
                              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-slate-400">$</span>
                              <Input
                                type="number"
                                min="1"
                                step="1000"
                                inputMode="numeric"
                                aria-label={`Valor para el apartamento ${a.numero} de ${nombreTorre(torre)}`}
                                disabled={!marcado}
                                value={elegidos?.[a.id] ?? ''}
                                onChange={(e) => valorPropio(a.id, e.target.value)}
                                placeholder={general ? general.toLocaleString('es-CO') : 'General'}
                                title="Déjalo vacío para usar el valor general"
                                className="h-8 pl-6 pr-2 text-right text-xs tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
            <p className={cn('text-xs', errores.apartamentos ? 'font-medium text-danger-strong' : 'text-slate-500')} role={errores.apartamentos ? 'alert' : undefined}>
              {errores.apartamentos ?? 'Deja vacío el valor para usar el valor general, o escribe uno propio para ese apartamento.'}
            </p>
          </div>
        )}

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

GenerarCuotas.propTypes = { apartamentos: PropTypes.arrayOf(PropTypes.object).isRequired, onClose: PropTypes.func.isRequired, onGenerado: PropTypes.func.isRequired }

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

      {modal?.tipo === 'generar' && <GenerarCuotas apartamentos={apartamentos} onClose={() => setModal(null)} onGenerado={terminar} />}
      {modal?.tipo === 'revisar' && <RevisarPago pago={modal.pago} onClose={() => setModal(null)} onDecidido={terminar} />}
    </div>
  )
}
