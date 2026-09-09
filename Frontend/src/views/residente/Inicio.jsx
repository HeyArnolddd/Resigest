import { CalendarRange, Package, TriangleAlert, Wallet } from 'lucide-react'
import { Button, Card, CardHeader, PageHeader, StatCard, StatusBadge } from '../../components/ui'
import { formatCOP } from '../../lib/utils'
import {
  incidencias,
  notificaciones,
  obligaciones,
  paquetes,
  residente,
  reservas,
  saldoPendiente,
} from '../../data/mock'

export default function Inicio({ onNavigate }) {
  const ultimaReserva = reservas.find((r) => r.estado !== 'Rechazada')
  const incidenciasRecientes = incidencias.filter((i) => i.solicitante === residente.nombre)
  const paquetesPendientes = paquetes.filter((p) => p.estado === 'Ha llegado')

  return (
    <div>
      <PageHeader
        title={`Buenos días, ${residente.nombre} 👋`}
        subtitle={`${residente.torre} · Apartamento ${residente.apto}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Estado de cuenta"
          value={formatCOP(saldoPendiente)}
          sub={`${obligaciones.filter((o) => o.estado === 'Pendiente').length} obligaciones por pagar`}
          tone="primary"
          onClick={() => onNavigate('finanzas')}
        />
        <StatCard
          icon={CalendarRange}
          label="Reservas"
          value={`${reservas.filter((r) => r.estado === 'Pendiente').length} reserva pendiente`}
          sub={`${reservas.filter((r) => r.estado === 'Aprobada').length} activas`}
          tone="violet"
          onClick={() => onNavigate('reservas')}
        />
        <StatCard
          icon={Package}
          label="Paquetes"
          value={`${paquetesPendientes.length} paquetes pendientes`}
          sub="Recógelos en portería"
          tone="success"
          onClick={() => onNavigate('paquetes')}
        />
        <StatCard
          icon={TriangleAlert}
          label="Incidencias"
          value={`${incidenciasRecientes.length} en proceso`}
          sub="Sigue su estado en Incidencias"
          tone="warning"
          onClick={() => onNavigate('incidencias')}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Próxima reserva"
            subtitle="Tu reserva más cercana"
            action={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('reservas')}>
                Ver reservas
              </Button>
            }
          />
          <div className="px-5 py-4">
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <CalendarRange className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{ultimaReserva.zona}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {ultimaReserva.fecha} · {ultimaReserva.horario}
                </p>
              </div>
              <StatusBadge status={ultimaReserva.estado} />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Notificaciones recientes" subtitle="Últimas novedades de tu unidad" />
          <div className="px-5 py-2">
            {notificaciones.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.leida ? 'bg-slate-200' : 'bg-brand-600'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{n.titulo}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.detalle}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Incidencias recientes"
            subtitle="Solicitudes reportadas por ti"
            action={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('incidencias')}>
                Ver todas
              </Button>
            }
          />
          <div className="px-5 py-2">
            {incidenciasRecientes.slice(0, 3).map((i) => (
              <div key={i.id} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{i.titulo}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {i.id} · {i.fecha}
                  </p>
                </div>
                <StatusBadge status={i.estado} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Paquetes pendientes"
            subtitle="Esperando por ti en portería"
            action={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('paquetes')}>
                Ver paquetes
              </Button>
            }
          />
          <div className="px-5 py-2">
            {paquetesPendientes.map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-bg text-success-strong">
                  <Package className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{p.empresa}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {p.guia} · {p.fecha}
                  </p>
                </div>
                <StatusBadge status={p.estado} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}