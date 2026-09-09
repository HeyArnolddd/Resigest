import { useState } from 'react'
import { Card, PageHeader, StatusBadge, Table } from '../../components/ui'
import { cn } from '../../lib/utils'

const registrosBitacora = [
  { id: 1, hora: '22:41', persona: 'María Camila Reyes', apartamento: 'T2 · 305', tipo: 'Visitante', estado: 'Completado', dia: 'Ayer' },
  { id: 2, hora: '21:05', persona: 'Repartidor Rappi', apartamento: 'T1 · 204', tipo: 'Domicilio', estado: 'Completado', dia: 'Ayer' },
  { id: 3, hora: '19:33', persona: 'Carlos Medina', apartamento: 'T3 · 501', tipo: 'Visitante', estado: 'Completado', dia: 'Ayer' },
  { id: 4, hora: '18:12', persona: 'Técnico de internet', apartamento: 'T2 · 208', tipo: 'Servicio', estado: 'Completado', dia: 'Ayer' },
  { id: 5, hora: '10:24', persona: 'Laura Martínez', apartamento: 'T2 · 305', tipo: 'Visitante', estado: 'En portería', dia: 'Hoy' },
  { id: 6, hora: '09:58', persona: 'Repartidor Rappi', apartamento: 'T3 · 501', tipo: 'Domicilio', estado: 'Completado', dia: 'Hoy' },
  { id: 7, hora: '09:31', persona: 'Pedro Sánchez', apartamento: 'T1 · 103', tipo: 'Visitante', estado: 'Completado', dia: 'Hoy' },
  { id: 8, hora: '09:12', persona: 'Repartidor Uber Eats', apartamento: 'T2 · 208', tipo: 'Domicilio', estado: 'Completado', dia: 'Hoy' },
  { id: 9, hora: '08:47', persona: 'Técnico de TV', apartamento: 'T3 · 410', tipo: 'Servicio', estado: 'Completado', dia: 'Hoy' },
  { id: 10, hora: '08:02', persona: 'Valentina López', apartamento: 'T1 · 201', tipo: 'Visitante', estado: 'Completado', dia: 'Hoy' },
]

const filtros = ['Hoy', 'Ayer', 'Todos']

export default function Bitacora() {
  const [filtro, setFiltro] = useState('Hoy')
  const datos = filtro === 'Todos' ? registrosBitacora : registrosBitacora.filter((r) => r.dia === filtro)

  return (
    <div>
      <PageHeader
        title="Bitácora"
        subtitle="Historial de ingresos y salidas del conjunto"
        actions={
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {filtros.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  filtro === f ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <Card>
        <div className="pt-2">
          <Table
            rowKey="id"
            data={datos}
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
    </div>
  )
}