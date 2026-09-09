import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button, Card, Field, Modal, PageHeader, StatusBadge, Table, Textarea } from '../../components/ui'
import { reservasPendientes } from '../../data/mock'

export default function Reservas() {
  const [lista, setLista] = useState(reservasPendientes)
  const [modalRechazo, setModalRechazo] = useState(false)
  const [objetivo, setObjetivo] = useState(null)

  const aprobar = (id) => setLista(lista.map((r) => (r.id === id ? { ...r, estado: 'Aprobada' } : r)))
  const pedirRechazo = (r) => {
    setObjetivo(r)
    setModalRechazo(true)
  }
  const rechazar = () => {
    setLista(lista.map((r) => (r.id === objetivo.id ? { ...r, estado: 'Rechazada' } : r)))
    setModalRechazo(false)
  }

  return (
    <div>
      <PageHeader
        title="Reservas"
        subtitle="Aprobación de solicitudes de zonas comunes"
        actions={
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
            {lista.filter((r) => r.estado === 'Pendiente').length} pendientes
          </span>
        }
      />

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={lista}
            columns={[
              { key: 'residente', header: 'Residente', render: (r) => (
                <div>
                  <p className="font-semibold text-slate-800">{r.residente}</p>
                  <p className="text-xs text-slate-500">{r.apartamento}</p>
                </div>
              )},
              { key: 'zona', header: 'Zona', render: (r) => <span className="font-medium">{r.zona}</span> },
              { key: 'fecha', header: 'Fecha' },
              { key: 'horario', header: 'Horario' },
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
              {
                key: 'acciones',
                header: 'Acción',
                align: 'right',
                render: (r) =>
                  r.estado === 'Pendiente' ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="success" icon={Check} onClick={() => aprobar(r.id)}>
                        Aprobar
                      </Button>
                      <Button size="sm" variant="secondary" icon={X} onClick={() => pedirRechazo(r)}>
                        Rechazar
                      </Button>
                    </div>
                  ) : null,
              },
            ]}
          />
        </div>
      </Card>

      <Modal
        open={modalRechazo}
        onClose={() => setModalRechazo(false)}
        title="Justificar rechazo"
        subtitle={objetivo ? `${objetivo.residente} · ${objetivo.zona}` : ''}
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
            <Textarea placeholder="Ej. La zona ya está reservada para esa fecha…" />
          </Field>
          <p className="text-xs text-slate-500">
            El residente recibirá una notificación con la justificación.
          </p>
        </div>
      </Modal>
    </div>
  )
}