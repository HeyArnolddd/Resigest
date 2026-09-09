import { useState } from 'react'
import { CalendarDays, MapPin, Paperclip, User } from 'lucide-react'
import { Button, Card, Modal, PageHeader, StatusBadge, Textarea } from '../../components/ui'
import { cn } from '../../lib/utils'
import { incidencias } from '../../data/mock'
import FlujoEstado from './FlujoEstado'

const filtros = ['Todas', 'Nueva', 'En proceso', 'Resuelta']

export default function Incidencias() {
  const [lista, setLista] = useState(incidencias)
  const [filtro, setFiltro] = useState('Todas')
  const [seleccionada, setSeleccionada] = useState(incidencias[0]?.id)
  const [modalRechazo, setModalRechazo] = useState(false)

  const visible = filtro === 'Todas' ? lista : lista.filter((i) => i.estado === filtro)
  const actual = lista.find((i) => i.id === seleccionada) || lista[0]

  const aceptar = () => {
    setLista(lista.map((i) => (i.id === actual.id ? { ...i, estado: 'En proceso' } : i)))
  }
  const marcarResuelta = () => {
    setLista(lista.map((i) => (i.id === actual.id ? { ...i, estado: 'Resuelta' } : i)))
  }
  const rechazar = () => {
    setLista(lista.map((i) => (i.id === actual.id ? { ...i, estado: 'Rechazada' } : i)))
    setModalRechazo(false)
  }

  return (
    <div>
      <PageHeader title="Incidencias" subtitle="Gestión de solicitudes de los residentes" />

      <div className="mb-4 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors',
              filtro === f
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {f}
            <span className="ml-1.5 opacity-70">
              {f === 'Todas' ? lista.length : lista.filter((i) => i.estado === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          {visible.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setSeleccionada(i.id)}
              className={cn(
                'w-full rounded-lg border bg-white p-4 text-left transition-all',
                seleccionada === i.id
                  ? 'border-brand-400 ring-2 ring-brand-100'
                  : 'border-slate-200 hover:border-slate-300',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold leading-snug text-slate-900">{i.titulo}</p>
                <StatusBadge status={i.estado} dot={false} />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {i.ubicacion} · {i.fecha}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-semibold',
                    i.prioridad === 'Alta'
                      ? 'bg-danger-bg text-danger-strong'
                      : i.prioridad === 'Media'
                        ? 'bg-warning-bg text-warning-strong'
                        : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {i.prioridad}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  {i.categoria}
                </span>
              </div>
            </button>
          ))}
        </div>

        <Card className="p-5 lg:col-span-2">
          {actual ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">{actual.titulo}</h2>
                    <StatusBadge status={actual.estado} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {actual.id} · {actual.categoria}
                  </p>
                </div>
                <div className="flex gap-2">
                  {actual.estado === 'Nueva' && (
                    <>
                      <Button variant="secondary" onClick={() => setModalRechazo(true)}>
                        Rechazar solicitud
                      </Button>
                      <Button onClick={aceptar}>Aceptar solicitud</Button>
                    </>
                  )}
                  {actual.estado === 'En proceso' && (
                    <Button variant="success" onClick={marcarResuelta}>
                      Marcar como resuelto
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Flujo de estado</p>
                <div className="mt-3">
                  <FlujoEstado estado={actual.estado} />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Descripción</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{actual.descripcion}</p>
                </div>
                {actual.evidencia && (
                  <div className="sm:col-span-2">
                    <p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <Paperclip className="h-3.5 w-3.5" /> Evidencia
                    </p>
                    <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                      Vista previa del archivo adjunto (simulación)
                    </div>
                  </div>
                )}
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <User className="h-3.5 w-3.5" /> Reportó
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800">{actual.solicitante}</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" /> Fecha
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800">{actual.fecha}</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <MapPin className="h-3.5 w-3.5" /> Ubicación
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800">{actual.ubicacion}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Prioridad</p>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800">{actual.prioridad}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">Selecciona una incidencia para ver su detalle.</p>
          )}
        </Card>
      </div>

      <Modal
        open={modalRechazo}
        onClose={() => setModalRechazo(false)}
        title="Rechazar solicitud"
        subtitle={actual?.titulo}
        icon={null}
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
        <Textarea placeholder="Indica el motivo del rechazo (opcional)…" />
      </Modal>
    </div>
  )
}