import { useState } from 'react'
import {
  CheckCircle2,
  CreditCard,
  Download,
  FileCheck2,
  HandCoins,
  Loader2,
  Wallet,
} from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Table,
  UploadBox,
} from '../../components/ui'
import { formatCOP } from '../../lib/utils'
import { obligaciones, saldoPendiente } from '../../data/mock'

export default function Finanzas() {
  const [modalWompi, setModalWompi] = useState(false)
  const [pasoWompi, setPasoWompi] = useState('revisar')
  const [modalPago, setModalPago] = useState(false)
  const [obligacionSel, setObligacionSel] = useState('')
  const [modalManual, setModalManual] = useState(false)
  const [manualEnviado, setManualEnviado] = useState(false)

  const pendientes = obligaciones.filter((o) => o.estado === 'Pendiente')
  const pagadas = obligaciones.filter((o) => o.estado === 'Pagada')

  const abrirWompi = () => {
    setPasoWompi('revisar')
    setModalWompi(true)
  }

  const simularPago = () => {
    setPasoWompi('procesando')
    setTimeout(() => setPasoWompi('exito'), 1400)
  }

  const abrirPago = (id) => {
    setObligacionSel(id || pendientes[0]?.id || '')
    setManualEnviado(false)
    setModalPago(true)
  }

  return (
    <div>
      <PageHeader
        title="Finanzas"
        subtitle="Estado de cuenta y obligaciones del apartamento"
      />

      <Card className="border-brand-100 bg-gradient-to-br from-brand-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-5 p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <Wallet className="h-6 w-6" strokeWidth={2} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Saldo pendiente
              </p>
              <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
                {formatCOP(saldoPendiente)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {pendientes.length} obligaciones sin pagar · Torre 2 · Apto 304
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={abrirWompi} icon={CreditCard}>
              Pagar con Wompi
            </Button>
            <Button variant="secondary" onClick={() => abrirPago()} icon={HandCoins}>
              Pagar obligación
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setManualEnviado(false)
                setModalManual(true)
              }}
              icon={FileCheck2}
            >
              Reportar pago manual
            </Button>
            <Button variant="ghost" icon={Download} iconRight>
              Comprobante PDF
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Historial de obligaciones"
            subtitle="Cuotas de administración y otros conceptos"
          />
          <div className="pt-2">
            <Table
              rowKey="id"
              data={obligaciones}
              columns={[
                { key: 'concepto', header: 'Concepto', render: (r) => <p className="font-semibold text-slate-800">{r.concepto}</p> },
                { key: 'periodo', header: 'Periodo' },
                { key: 'valor', header: 'Valor', align: 'right', render: (r) => <span className="font-medium">{formatCOP(r.valor)}</span> },
                { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
                {
                  key: 'acciones',
                  header: '',
                  align: 'right',
                  render: (r) =>
                    r.estado === 'Pendiente' ? (
                      <Button variant="outline" size="sm" onClick={() => abrirPago(r.id)}>
                        Pagar
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" icon={Download} onClick={abrirWompi}>
                        Por Wompi
                      </Button>
                    ),
                },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Resumen del periodo" subtitle="Últimos periodos" />
            <div className="px-5 py-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-medium text-slate-500">Por pagar</span>
                <span className="text-sm font-bold text-warning-strong">{formatCOP(saldoPendiente)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="text-xs font-medium text-slate-500">Pagado en 2026</span>
                <span className="text-sm font-bold text-success-strong">
                  {formatCOP(pagadas.reduce((a, o) => a + o.valor, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-xs font-medium text-slate-500">Obligaciones {pagadas.length + pendientes.length}</span>
                <span className="text-sm font-bold text-slate-800">{pagadas.length} pagadas · {pendientes.length} por pagar</span>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-900">Pago con Wompi</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Simulación del flujo de pago electrónico. En el prototipo no se realizan transacciones reales.
            </p>
            <Button className="mt-3 w-full" variant="outline" onClick={abrirWompi}>
              Ver cómo funciona
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        open={modalWompi}
        onClose={() => setModalWompi(false)}
        title="Pagar con Wompi"
        subtitle="Simulación del proceso de pago"
        icon={CreditCard}
        footer={
          pasoWompi === 'exito' ? (
            <Button onClick={() => setModalWompi(false)}>Listo</Button>
          ) : pasoWompi === 'revisar' ? (
            <>
              <Button variant="secondary" onClick={() => setModalWompi(false)}>
                Cancelar
              </Button>
              <Button onClick={simularPago}>Simular pago</Button>
            </>
          ) : null
        }
      >
        {pasoWompi === 'revisar' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Cuota de administración · Sep 2026</span>
                <span className="font-bold text-slate-900">{formatCOP(160000)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-semibold text-slate-700">Total a pagar</span>
                <span className="text-base font-extrabold text-brand-700">{formatCOP(160000)}</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-semibold text-slate-800">Método de pago</p>
              <div className="flex gap-2">
                {['PSE', 'Tarjeta de crédito', 'Tarjeta débito'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-3 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-400 hover:bg-brand-50"
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">
              Redirigimos a la pasarela Wompi · Entorno de demostración
            </p>
          </div>
        )}
        {pasoWompi === 'procesando' && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="h-10 w-10 animate-spin text-brand-600" strokeWidth={2} />
            <p className="text-sm font-medium text-slate-600">Conectando con Wompi y procesando el pago…</p>
          </div>
        )}
        {pasoWompi === 'exito' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={2} />
            <p className="text-base font-bold text-slate-900">Pago procesado (simulación)</p>
            <p className="max-w-xs text-sm text-slate-500">
              La obligación quedará como pagada y recibirás tu comprobante por correo.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={modalPago}
        onClose={() => setModalPago(false)}
        title="Pagar obligación"
        subtitle="Selecciona la obligación que deseas cancelar"
        icon={HandCoins}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalPago(false)}>
              Cancelar
            </Button>
            <Button onClick={abrirWompi}>Pagar con Wompi</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Obligación" required>
            <Select value={obligacionSel} onChange={(e) => setObligacionSel(e.target.value)}>
              <option value="">Selecciona un periodo</option>
              {pendientes.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.concepto} · {o.periodo}
                </option>
              ))}
            </Select>
          </Field>
          {obligacionSel && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Valor a pagar</span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatCOP(pendientes.find((o) => o.id === obligacionSel)?.valor || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={modalManual}
        onClose={() => setModalManual(false)}
        title="Reportar pago manual"
        subtitle="Reporta una consignación o transferencia realizada"
        icon={FileCheck2}
        footer={
          manualEnviado ? (
            <Button onClick={() => setModalManual(false)}>Listo</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setModalManual(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setManualEnviado(true)}>Enviar reporte</Button>
            </>
          )
        }
      >
        {manualEnviado ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-11 w-11 text-success" strokeWidth={2} />
            <p className="text-base font-bold text-slate-900">Reporte enviado</p>
            <p className="max-w-xs text-sm text-slate-500">
              La administración validará el comprobante y actualizará tu estado de cuenta.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Banco o medio" required>
                <Select defaultValue="Bancolombia">
                  <option>Bancolombia</option>
                  <option>Banco de Bogotá</option>
                  <option>Nequi</option>
                  <option>Daviplata</option>
                  <option>Otro</option>
                </Select>
              </Field>
              <Field label="Fecha" required>
                <Input type="date" defaultValue="2026-09-09" />
              </Field>
            </div>
            <Field label="Número de consignación / referencia" required>
              <Input placeholder="Ej. CMS-8842210" />
            </Field>
            <Field label="Comprobante" required hint="Adjunta el comprobante del pago realizado">
              <UploadBox hint="Adjuntar comprobante de pago" />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}