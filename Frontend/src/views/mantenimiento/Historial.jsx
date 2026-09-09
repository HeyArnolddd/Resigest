import { Card, PageHeader, StatusBadge, Table } from '../../components/ui'
import { incidencias } from '../../data/mock'

export default function Historial() {
  const resueltas = incidencias.filter((i) => i.estado === 'Resuelta')

  return (
    <div>
      <PageHeader
        title="Historial"
        subtitle={`Incidencias resueltas · ${resueltas.length} completadas`}
      />

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={resueltas}
            columns={[
              { key: 'titulo', header: 'Incidencia', render: (r) => <span className="font-semibold text-slate-800">{r.titulo}</span> },
              { key: 'ubicacion', header: 'Ubicación' },
              { key: 'fecha', header: 'Fecha' },
              { key: 'prioridad', header: 'Prioridad', render: (r) => (
                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${r.prioridad === 'Alta' ? 'bg-danger-bg text-danger-strong' : r.prioridad === 'Media' ? 'bg-warning-bg text-warning-strong' : 'bg-slate-100 text-slate-600'}`}>
                  {r.prioridad}
                </span>
              )},
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
            ]}
          />
        </div>
      </Card>
    </div>
  )
}