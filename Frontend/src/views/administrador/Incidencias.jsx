import { useState } from 'react'
import { Card, PageHeader, StatusBadge, Table } from '../../components/ui'
import { cn } from '../../lib/utils'
import { incidencias } from '../../data/mock'

const filtros = ['Todas', 'Nueva', 'En proceso', 'Resuelta', 'Evaluada']

export default function Incidencias() {
  const [filtro, setFiltro] = useState('Todas')

  const visible = filtro === 'Todas' ? incidencias : incidencias.filter((i) => i.estado === filtro)

  return (
    <div>
      <PageHeader title="Incidencias" subtitle="Todas las solicitudes del conjunto" />

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
              {f === 'Todas' ? incidencias.length : incidencias.filter((i) => i.estado === f).length}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={visible}
            columns={[
              {
                key: 'titulo',
                header: 'Incidencia',
                render: (r) => (
                  <div>
                    <p className="font-semibold text-slate-800">{r.titulo}</p>
                    <p className="text-xs text-slate-500">{r.categoria} · {r.prioridad}</p>
                  </div>
                ),
              },
              { key: 'solicitante', header: 'Residente' },
              { key: 'ubicacion', header: 'Ubicación' },
              { key: 'fecha', header: 'Fecha' },
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
            ]}
          />
        </div>
      </Card>
    </div>
  )
}