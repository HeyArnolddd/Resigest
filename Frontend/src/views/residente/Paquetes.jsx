import { useState } from 'react'
import { BellRing, PackageCheck, Truck } from 'lucide-react'
import { Button, Card, PageHeader, StatusBadge, Table } from '../../components/ui'
import { paquetes } from '../../data/mock'

export default function Paquetes() {
  const [lista, setLista] = useState(paquetes)
  const pendientes = lista.filter((p) => p.estado === 'Ha llegado')

  const confirmarEntrega = (id) =>
    setLista(lista.map((p) => (p.id === id ? { ...p, estado: 'Entregado' } : p)))

  return (
    <div>
      <PageHeader
        title="Paquetes"
        subtitle="Correspondencia y paquetes recibidos en portería"
      />

      {pendientes.length > 0 && (
        <div className="animate-fade-up mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <BellRing className="size-4" strokeWidth={2} />
          </span>
          <div className="flex-1 text-sm">
            <p className="font-bold text-slate-900">
              Tienes {pendientes.length} {pendientes.length === 1 ? 'paquete' : 'paquetes'} esperando
            </p>
            <p className="text-xs text-slate-500">
              Recógelos en la portería principal en horario de 6:00 a. m. a 10:00 p. m.
            </p>
          </div>
        </div>
      )}

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={lista}
            columns={[
              {
                key: 'paquete',
                header: 'Paquete',
                render: (r) => (
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        r.estado === 'Entregado' ? 'bg-success-bg text-success-strong' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {r.estado === 'Entregado' ? (
                        <PackageCheck className="h-4 w-4" strokeWidth={2} />
                      ) : (
                        <Truck className="h-4 w-4" strokeWidth={2} />
                      )}
                    </span>
                    <span className="font-semibold text-slate-800">{r.empresa}</span>
                  </div>
                ),
              },
              { key: 'guia', header: 'N.º de guía', render: (r) => <span className="font-mono text-xs">{r.guia}</span> },
              { key: 'descripcion', header: 'Descripción' },
              { key: 'fecha', header: 'Fecha' },
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
              {
                key: 'acciones',
                header: '',
                align: 'right',
                render: (r) =>
                  r.estado === 'Ha llegado' ? (
                    <Button size="sm" variant="outline" onClick={() => confirmarEntrega(r.id)}>
                      Confirmar entrega
                    </Button>
                  ) : null,
              },
            ]}
          />
        </div>
      </Card>
    </div>
  )
}