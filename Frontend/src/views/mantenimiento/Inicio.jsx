import { CheckCircle2, ClipboardList, TriangleAlert } from 'lucide-react'
import { Button, Card, CardHeader, PageHeader, StatCard, StatusBadge } from '../../components/ui'
import { incidencias } from '../../data/mock'

export default function Inicio({ onNavigate }) {
  const nuevas = incidencias.filter((i) => i.estado === 'Nueva')
  const proceso = incidencias.filter((i) => i.estado === 'En proceso')
  const resueltas = incidencias.filter((i) => i.estado === 'Resuelta')
  const recientes = [...nuevas.slice(0, 4), ...proceso.slice(0, 1)].slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Mantenimiento"
        subtitle="Resumen de solicitudes y trabajo pendiente"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={TriangleAlert}
          label="Nuevas solicitudes"
          value={String(nuevas.length)}
          sub="Requieren revisión"
          tone="primary"
          onClick={() => onNavigate('incidencias')}
        />
        <StatCard
          icon={ClipboardList}
          label="En proceso"
          value={String(proceso.length)}
          sub="Trabajo en curso"
          tone="warning"
          onClick={() => onNavigate('incidencias')}
        />
        <StatCard
          icon={CheckCircle2}
          label="Resueltas"
          value={String(resueltas.length)}
          sub="Completadas este mes"
          tone="success"
          onClick={() => onNavigate('historial')}
        />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Solicitudes recientes"
          subtitle="Incidencias nuevas y en curso"
          action={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('incidencias')}>
              Ver todas
            </Button>
          }
        />
        <div className="px-5 py-2">
          {recientes.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => onNavigate('incidencias')}
              className="flex w-full items-center gap-3 border-b border-slate-100 py-3.5 text-left last:border-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-warning-strong">
                <TriangleAlert className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{i.titulo}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {i.ubicacion} · {i.fecha}
                </p>
              </div>
              <span
                className={`hidden rounded-md px-2 py-1 text-xs font-semibold sm:inline ${
                  i.prioridad === 'Alta' ? 'bg-danger-bg text-danger-strong' : i.prioridad === 'Media' ? 'bg-warning-bg text-warning-strong' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {i.prioridad}
              </span>
              <StatusBadge status={i.estado} />
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}