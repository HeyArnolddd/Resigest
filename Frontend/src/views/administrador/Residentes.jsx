import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, PageHeader, StatusBadge, Table } from '../../components/ui'
import { residentes } from '../../data/mock'

export default function Residentes() {
  const [query, setQuery] = useState('')
  const filtrados = residentes.filter((r) =>
    r.nombre.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div>
      <PageHeader
        title="Residentes"
        subtitle={`${residentes.length} de 128 registrados · 3 torres`}
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar residente…"
              className="h-10 w-64 rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            />
          </div>
        }
      />

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={filtrados}
            columns={[
              { key: 'nombre', header: 'Residente', render: (r) => <span className="font-semibold text-slate-800">{r.nombre}</span> },
              { key: 'apartamento', header: 'Apartamento' },
              { key: 'celular', header: 'Celular', render: (r) => <span className="font-mono text-xs">{r.celular}</span> },
              {
                key: 'estadoCuenta',
                header: 'Estado de cuenta',
                render: (r) => (
                  <span className={`font-medium ${r.estadoCuenta === 'Al día' ? 'text-success-strong' : 'text-warning-strong'}`}>
                    {r.estadoCuenta}
                  </span>
                ),
              },
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} dot={false} /> },
            ]}
          />
        </div>
      </Card>
    </div>
  )
}