import { useState } from 'react'
import { CalendarRange, Check, X } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  StatusBadge,
  Table,
  Textarea,
} from '../../components/ui'
import CalendarioReservas from '../../components/reservas/CalendarioReservas'
import { estadoReserva } from '../../lib/labels'
import { cn } from '../../lib/utils'
import { colorZona } from '../../lib/zonas'
import { reservasAgenda, zonas } from '../../data/mock'

const fmtFecha = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtHorario = (r) => `${r.fechaInicio.slice(11, 16)} – ${r.fechaFin.slice(11, 16)}`

function Zona({ r }) {
  return (
    <span className="inline-flex items-center gap-2 font-medium">
      <span className={cn('size-2.5 shrink-0 rounded-full', colorZona(r.zonaComunId).punto)} />
      {r.zonaComunNombre}
    </span>
  )
}

export default function Reservas() {
  const [lista, setLista] = useState(reservasAgenda)
  const [detalle, setDetalle] = useState(null)
  const [rechazo, setRechazo] = useState(null)

  const pendientes = lista
    .filter((r) => r.estado === 'PENDIENTE')
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))

  const cambiarEstado = (id, estado) => setLista(lista.map((r) => (r.id === id ? { ...r, estado } : r)))

  const aprobar = (r) => {
    cambiarEstado(r.id, 'APROBADA')
    setDetalle(null)
  }
  const pedirRechazo = (r) => {
    setDetalle(null)
    setRechazo(r)
  }
  const rechazar = () => {
    cambiarEstado(rechazo.id, 'RECHAZADA')
    setRechazo(null)
  }

  const estadoDetalle = detalle && estadoReserva[detalle.estado]

  return (
    <div>
      <PageHeader
        title="Reservas"
        subtitle="Agenda de zonas comunes y solicitudes por aprobar"
        actions={
          pendientes.length > 0 && (
            <span className="rounded-full bg-warning-bg px-3 py-1.5 text-xs font-bold text-warning-strong">
              {pendientes.length} por aprobar
            </span>
          )
        }
      />

      <Card className="p-4 sm:p-5">
        <CalendarioReservas reservas={lista} zonas={zonas} onSelect={setDetalle} />
      </Card>

      <Card className="mt-6">
        <CardHeader title="Solicitudes por aprobar" subtitle="Ordenadas por fecha de uso" />
        {pendientes.length ? (
          <div className="pt-2">
            <Table
              rowKey="id"
              data={pendientes}
              columns={[
                {
                  key: 'residente',
                  header: 'Residente',
                  render: (r) => (
                    <div>
                      <p className="font-semibold text-slate-800">{r.residente}</p>
                      <p className="text-xs text-slate-500">{r.apartamento}</p>
                    </div>
                  ),
                },
                { key: 'zona', header: 'Zona', render: (r) => <Zona r={r} /> },
                { key: 'fecha', header: 'Fecha', render: (r) => fmtFecha(r.fechaInicio) },
                { key: 'horario', header: 'Horario', render: fmtHorario },
                {
                  key: 'acciones',
                  header: 'Acción',
                  align: 'right',
                  render: (r) => (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="success" icon={Check} onClick={() => aprobar(r)}>
                        Aprobar
                      </Button>
                      <Button size="sm" variant="secondary" icon={X} onClick={() => pedirRechazo(r)}>
                        Rechazar
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Check}
              title="No hay solicitudes por aprobar"
              description="Las nuevas reservas de los residentes aparecerán aquí."
            />
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(detalle)}
        onClose={() => setDetalle(null)}
        title="Detalle de la reserva"
        subtitle={detalle ? `${detalle.residente} · ${detalle.apartamento}` : ''}
        icon={CalendarRange}
        footer={
          detalle?.estado === 'PENDIENTE' ? (
            <>
              <Button variant="secondary" icon={X} onClick={() => pedirRechazo(detalle)}>
                Rechazar
              </Button>
              <Button variant="success" icon={Check} onClick={() => aprobar(detalle)}>
                Aprobar reserva
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setDetalle(null)}>
              Cerrar
            </Button>
          )
        }
      >
        {detalle && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Zona</dt>
              <dd className="mt-1">
                <Zona r={detalle} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Estado</dt>
              <dd className="mt-1">
                <StatusBadge status={estadoDetalle.label} tone={estadoDetalle.tone} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Fecha</dt>
              <dd className="mt-1 font-medium text-slate-800">{fmtFecha(detalle.fechaInicio)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Horario</dt>
              <dd className="mt-1 font-medium text-slate-800">{fmtHorario(detalle)}</dd>
            </div>
          </dl>
        )}
      </Modal>

      <Modal
        open={Boolean(rechazo)}
        onClose={() => setRechazo(null)}
        title="Justificar rechazo"
        subtitle={rechazo ? `${rechazo.residente} · ${rechazo.zonaComunNombre} · ${fmtFecha(rechazo.fechaInicio)}` : ''}
        icon={X}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRechazo(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={rechazar}>
              Rechazar reserva
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Motivo del rechazo" required>
            <Textarea placeholder="Ej. La zona estará en mantenimiento ese día" />
          </Field>
          <p className="text-xs text-slate-500">El residente recibirá una notificación con este motivo.</p>
        </div>
      </Modal>
    </div>
  )
}
