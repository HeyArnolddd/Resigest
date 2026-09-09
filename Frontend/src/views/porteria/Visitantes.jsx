import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Card, PageHeader, StatusBadge, Table } from '../../components/ui'
import { ingresos } from '../../data/mock'
import RegistrarVisitante from './RegistrarVisitante'

export default function Visitantes() {
  const [modal, setModal] = useState(false)
  const [lista, setLista] = useState(ingresos)

  return (
    <div>
      <PageHeader
        title="Visitantes"
        subtitle="Control de ingresos del día"
        actions={
          <Button onClick={() => setModal(true)} icon={Plus}>
            Registrar visitante
          </Button>
        }
      />

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={lista}
            columns={[
              { key: 'hora', header: 'Hora', render: (r) => <span className="font-medium">{r.hora}</span> },
              { key: 'persona', header: 'Persona', render: (r) => <span className="font-semibold text-slate-800">{r.persona}</span> },
              { key: 'apartamento', header: 'Apartamento' },
              { key: 'tipo', header: 'Tipo', render: (r) => <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{r.tipo}</span> },
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
            ]}
          />
        </div>
      </Card>

      <RegistrarVisitante
        open={modal}
        onClose={() => setModal(false)}
        onRegistrado={(d) => setLista((l) => [{ ...d, id: l.length + 1 }, ...l])}
      />
    </div>
  )
}