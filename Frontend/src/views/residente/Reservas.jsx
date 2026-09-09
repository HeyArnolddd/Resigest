import { useState } from 'react'
import { CalendarRange, CheckCircle2, Clock, Users } from 'lucide-react'
import {
  Button,
  Calendar,
  Card,
  CardHeader,
  Modal,
  PageHeader,
  StatusBadge,
  Table,
} from '../../components/ui'
import { cn } from '../../lib/utils'
import { reservas, zonasComunes } from '../../data/mock'

function primerDiaConReserva(lista) {
  const hoy = new Date()
  const futuras = lista
    .map((r) => r.fecha)
    .filter((fecha) => {
      const [d, m, y] = fecha.split('/').map(Number)
      return new Date(y, m - 1, d) >= hoy
    })
  return futuras[0] ?? lista[0]?.fecha ?? ''
}

function DetalleDia({ fecha, reservas }) {
  return (
    <div className="border-t border-slate-100 px-5 py-4">
      <p className="text-2xs font-semibold uppercase tracking-wide text-slate-400">
        Reservas del {fecha}
      </p>
      {reservas.length ? (
        <ul className="mt-2 space-y-2">
          {reservas.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{r.zona}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {r.horario}
                </p>
              </div>
              <StatusBadge status={r.estado} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">
          Sin reservas ese día. Selecciona una zona y un horario para solicitar.
        </p>
      )}
    </div>
  )
}

function ZonaSelector({ zonas, seleccion, onSeleccionar }) {
  return (
    <Card>
      <CardHeader title="Zona común" subtitle="Selecciona la zona y el horario" />
      <div className="px-5 py-4">
        <div className="space-y-2">
          {zonas.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => onSeleccionar(z.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                seleccion === z.id
                  ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-200'
                  : 'border-slate-200 hover:bg-slate-50',
              )}
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{z.nombre}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <Users className="h-3 w-3" /> {z.capacidad}
                </p>
              </div>
              <CalendarRange className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}

function HorarioSelector({ zona, seleccion, onSeleccionar }) {
  return (
    <Card>
      <CardHeader title="Horarios" subtitle={zona?.nombre} />
      <div className="grid gap-2 px-5 py-4">
        {zona?.horarios.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => onSeleccionar(h)}
            className={cn(
              'flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
              seleccion === h
                ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-200'
                : 'border-slate-200 hover:bg-slate-50',
            )}
          >
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Clock className="h-4 w-4 text-slate-400" />
              {h}
            </span>
            <span className="text-xs font-semibold text-success">Disponible</span>
          </button>
        ))}
        {!seleccion && (
          <p className="pt-1 text-xs text-slate-400">Selecciona un horario para continuar.</p>
        )}
      </div>
    </Card>
  )
}

export default function Reservas() {
  const [zonaSel, setZonaSel] = useState(zonasComunes[0].id)
  const [horarioSel, setHorarioSel] = useState('')
  const [lista] = useState(reservas)
  const [diaSel, setDiaSel] = useState(() => primerDiaConReserva(reservas))
  const [modalConfirm, setModalConfirm] = useState(false)

  const zona = zonasComunes.find((z) => z.id === zonaSel)
  const reservasDia = diaSel ? lista.filter((r) => r.fecha === diaSel) : []
  const puedeSolicitar = Boolean(horarioSel && diaSel)

  const confirmar = () => {
    setModalConfirm(false)
    setHorarioSel('')
  }

  return (
    <div>
      <PageHeader
        title="Reservas"
        subtitle="Zonas comunes · Calendario y solicitudes"
        actions={
          <Button icon={CalendarRange} onClick={() => setModalConfirm(true)} disabled={!puedeSolicitar}>
            Solicitar reserva
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Calendario de reservas"
            subtitle="Las fichas muestran la zona reservada en cada día"
          />
          <div className="px-5 pb-1 pt-4">
            <Calendar
              reservas={lista}
              selected={diaSel}
              onSelect={setDiaSel}
            />
          </div>
          <DetalleDia fecha={diaSel} reservas={reservasDia} />
        </Card>

        <div className="space-y-4">
          <ZonaSelector
            zonas={zonasComunes}
            seleccion={zonaSel}
            onSeleccionar={(id) => {
              setZonaSel(id)
              setHorarioSel('')
            }}
          />
          <HorarioSelector zona={zona} seleccion={horarioSel} onSeleccionar={setHorarioSel} />
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader title="Mis reservas" subtitle="Historial de solicitudes" />
        <div className="pt-2">
          <Table
            rowKey="id"
            data={lista}
            columns={[
              { key: 'zona', header: 'Zona', render: (r) => <span className="font-semibold text-slate-800">{r.zona}</span> },
              { key: 'fecha', header: 'Fecha' },
              { key: 'horario', header: 'Horario' },
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
            ]}
          />
        </div>
      </Card>

      <Modal
        open={modalConfirm}
        onClose={() => setModalConfirm(false)}
        title="Confirmar solicitud"
        subtitle="Detalle de tu reserva"
        icon={CalendarRange}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalConfirm(false)}>
              Cancelar
            </Button>
            <Button icon={CheckCircle2} iconRight onClick={confirmar}>
              Confirmar reserva
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Zona</span>
              <span className="font-semibold text-slate-900">{zona?.nombre}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Fecha</span>
              <span className="font-semibold text-slate-900">{diaSel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Horario</span>
              <span className="font-semibold text-slate-900">{horarioSel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
              <span className="text-slate-500">Estado</span>
              <StatusBadge status="Pendiente" />
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Al confirmar, la solicitud quedará pendiente de aprobación por la administración.
          </p>
        </div>
      </Modal>
    </div>
  )
}