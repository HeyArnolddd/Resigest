import { useState } from 'react'
import { BellRing, PackagePlus } from 'lucide-react'
import { Button, Card, PageHeader, StatusBadge, Table } from '../../components/ui'
import { paquetesPorteria } from '../../data/mock'
import RegistrarPaquete from './RegistrarPaquete'

export default function Paquetes() {
  const [modal, setModal] = useState(false)
  const [lista, setLista] = useState(paquetesPorteria)
  const [ultimo, setUltimo] = useState(null)

  const registrado = (d) => {
    setUltimo(d)
    setLista((l) => [d, ...l])
  }

  return (
    <div>
      <PageHeader
        title="Paquetes"
        subtitle="Correspondencia recibida en portería"
        actions={
          <Button onClick={() => setModal(true)} icon={PackagePlus}>
            Registrar paquete
          </Button>
        }
      />

      {ultimo && (
        <div className="animate-fade-up mb-4 flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm">
          <BellRing className="h-4 w-4 shrink-0 text-brand-600" />
          <p className="font-medium text-slate-800">
            <span className="font-bold">{ultimo.empresa} ({ultimo.guia})</span> → {ultimo.apartamento}. Estado:{" "}
            <span className="font-bold text-warning-strong">Ha llegado</span>. Se notificó al residente.
          </p>
        </div>
      )}

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={lista}
            columns={[
              { key: 'empresa', header: 'Paquete', render: (r) => <span className="font-semibold text-slate-800">{r.empresa}</span> },
              { key: 'guia', header: 'Guía', render: (r) => <span className="font-mono text-xs">{r.guia}</span> },
              { key: 'apartamento', header: 'Apartamento' },
              { key: 'fecha', header: 'Fecha' },
              { key: 'estado', header: 'Estado', render: (r) => <StatusBadge status={r.estado} /> },
            ]}
          />
        </div>
      </Card>

      <RegistrarPaquete open={modal} onClose={() => setModal(false)} onRegistrado={registrado} />
    </div>
  )
}