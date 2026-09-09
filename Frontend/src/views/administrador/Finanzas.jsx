import { useState } from 'react'
import { Check, FileDown, FileSearch, X } from 'lucide-react'
import { Button, Card, Field, Modal, PageHeader, StatusBadge, Table, Textarea } from '../../components/ui'
import { formatCOP } from '../../lib/utils'
import { pagosManuales } from '../../data/mock'

export default function Finanzas() {
  const [lista, setLista] = useState(pagosManuales)
  const [revisado, setRevisado] = useState(null)
  const [modalRechazo, setModalRechazo] = useState(false)

  const abrir = (p) => setRevisado(p)

  const aprobar = () => {
    if (!revisado) return
    setLista(lista.map((p) => (p.id === revisado.id ? { ...p, estado: 'Aprobada' } : p)))
    setRevisado(null)
  }

  const pedirRechazo = () => setModalRechazo(true)

  const rechazar = () => {
    setModalRechazo(false)
    setLista(lista.map((p) => (p.id === revisado.id ? { ...p, estado: 'Rechazada' } : p)))
    setRevisado(null)
  }

  const pendientes = lista.filter((p) => p.estado === 'Pendiente revisión').length

  return (
    <div>
      <PageHeader
        title="Finanzas"
        subtitle="Revisión de pagos manuales reportados"
        actions={
          <span className="rounded-full bg-warning-bg px-3 py-1.5 text-xs font-bold text-warning-strong">
            {pendientes} {pendientes === 1 ? 'pago' : 'pagos'} por revisar
          </span>
        }
      />

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={lista}
            columns={[
              { key: 'residente', header: 'Residente', render: (r) => <span className="font-semibold text-slate-800">{r.residente}</span> },
              { key: 'apartamento', header: 'Apartamento' },
              { key: 'valor', header: 'Valor', align: 'right', render: (r) => <span className="font-medium">{formatCOP(r.valor)}</span> },
              { key: 'fecha', header: 'Fecha' },
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
              {
                key: 'acciones',
                header: '',
                align: 'right',
                render: (r) =>
                  r.estado === 'Pendiente revisión' ? (
                    <Button size="sm" variant="outline" icon={FileSearch} onClick={() => abrir(r)}>
                      Revisar
                    </Button>
                  ) : null,
              },
            ]}
          />
        </div>
      </Card>

      <Modal
        open={Boolean(revisado)}
        onClose={() => setRevisado(null)}
        title="Revisar pago manual"
        subtitle={revisado?.id}
        icon={FileSearch}
        size="lg"
        footer={
          revisado?.estado === 'Pendiente revisión' ? (
            <>
              <Button variant="danger" onClick={pedirRechazo} icon={X}>
                Rechazar
              </Button>
              <Button variant="success" onClick={aprobar} icon={Check}>
                Aprobar
              </Button>
            </>
          ) : (
            <Button onClick={() => setRevisado(null)}>Cerrar</Button>
          )
        }
      >
        {revisado && (
          <div className="space-y-5">
            <div>
              <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <FileDown className="h-3.5 w-3.5" /> Comprobante
              </p>
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                <div className="text-center">
                  <FileDown className="mx-auto h-6 w-6 text-slate-400" />
                  <p className="mt-2 text-xs font-medium text-slate-500">{revisado.comprobante}</p>
                  <p className="text-xs text-slate-400">Vista previa del documento (simulación)</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Información del pago</p>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500">Banco</dt><dd className="font-semibold text-slate-800">{revisado.banco}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">N.º consignación</dt><dd className="font-mono text-xs font-semibold text-slate-800">{revisado.numeroConsignacion}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Valor</dt><dd className="font-bold text-brand-700">{formatCOP(revisado.valor)}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Fecha</dt><dd className="font-semibold text-slate-800">{revisado.fecha}</dd></div>
                </dl>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Datos del residente</p>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-slate-500">Nombre</dt><dd className="font-semibold text-slate-800">{revisado.residente}</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-500">Apartamento</dt><dd className="font-semibold text-slate-800">{revisado.apartamento}</dd></div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modalRechazo}
        onClose={() => setModalRechazo(false)}
        title="Rechazar pago"
        subtitle="Justificación requerida"
        icon={X}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalRechazo(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={rechazar}>
              Confirmar rechazo
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Motivo del rechazo" required>
            <Textarea placeholder="Ej. El comprobante no coincide con el valor de la obligación…" />
          </Field>
          <p className="text-xs text-slate-500">
            El residente recibirá una notificación con el motivo del rechazo.
          </p>
        </div>
      </Modal>
    </div>
  )
}