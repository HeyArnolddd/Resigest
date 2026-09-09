import {
  CalendarRange,
  FileCheck2,
  TriangleAlert,
  Users,
  Wallet,
} from 'lucide-react'
import { Card, CardHeader, PageHeader, StatCard, StatusBadge } from '../../components/ui'
import { incidencias, pagosManuales, recaudoMensual, reservasPendientes } from '../../data/mock'

export default function Dashboard({ onNavigate }) {
  const activas = incidencias.filter((i) => !['Resuelta'].includes(i.estado))
  const maxRecaudo = Math.max(...recaudoMensual.map((r) => r.valor))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visión general del conjunto residencial"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Users}
          label="Residentes"
          value="128"
          sub="3 torres · 40 aptos"
          tone="primary"
          onClick={() => onNavigate('residentes')}
        />
        <StatCard
          icon={Wallet}
          label="Recaudado"
          value="$4.2M"
          sub="2026 · ytd"
          tone="success"
          onClick={() => onNavigate('finanzas')}
        />
        <StatCard
          icon={FileCheck2}
          label="Pagos manuales"
          value={String(pagosManuales.length)}
          sub="Pendientes de revisión"
          tone="warning"
          onClick={() => onNavigate('finanzas')}
        />
        <StatCard
          icon={CalendarRange}
          label="Reservas pendientes"
          value={String(reservasPendientes.length)}
          sub="Por aprobar"
          tone="violet"
          onClick={() => onNavigate('reservas')}
        />
        <StatCard
          icon={TriangleAlert}
          label="Incidencias activas"
          value={String(activas.length)}
          sub="Nuevas y en proceso"
          tone="danger"
          onClick={() => onNavigate('incidencias')}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recaudo mensual</h3>
              <p className="mt-0.5 text-xs text-slate-500">Cuotas de administración · Millones COP</p>
            </div>
            <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-strong">
              +5% vs agosto
            </span>
          </div>
          <div className="mt-5 flex h-44 items-end gap-3 border-b border-slate-200 pb-px">
            {recaudoMensual.map((r) => (
              <div key={r.mes} className="group flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                  {r.valor.toFixed(1)}
                </span>
                <div
                  className="w-full w-12 rounded-t-lg bg-brand-600 transition-all group-hover:bg-brand-700"
                  style={{ height: `${(r.valor / maxRecaudo) * 100}%` }}
                />
                <span className="text-xs font-medium text-slate-500">{r.mes}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Reservas pendientes"
              subtitle="Solicitudes por aprobar"
              action={
                <button type="button" onClick={() => onNavigate('reservas')} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Gestionar
                </button>
              }
            />
            <div className="px-5 py-3">
              {reservasPendientes.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{r.residente}</p>
                    <p className="text-xs text-slate-500">{r.zona} · {r.fecha}</p>
                  </div>
                  <StatusBadge status={r.estado} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Últimas incidencias"
              subtitle="Recientes del conjunto"
              action={
                <button type="button" onClick={() => onNavigate('incidencias')} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  Ver todas
                </button>
              }
            />
            <div className="px-5 py-3">
              {incidencias.slice(0, 3).map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{i.titulo}</p>
                    <p className="text-xs text-slate-500">{i.ubicacion}</p>
                  </div>
                  <StatusBadge status={i.estado} dot={false} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}