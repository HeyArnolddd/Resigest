import { useState } from 'react'
import { CheckCircle2, Megaphone } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input, PageHeader, StatusBadge, Textarea } from '../../components/ui'
import { cn } from '../../lib/utils'
import { comunicados } from '../../data/mock'

const destinatarios = ['Todos los residentes', 'Torre 1', 'Torre 2', 'Torre 3', 'Administración']

export default function Comunicados() {
  const [publicados, setPublicados] = useState(comunicados)
  const [publicado, setPublicado] = useState(false)
  const [destino, setDestino] = useState('Todos los residentes')

  const publicar = (e) => {
    e.preventDefault()
    const nuevo = {
      id: publicados.length + 1,
      titulo: e.target.titulo.value,
      categoria: 'Comunicado',
      fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      contenido: e.target.contenido.value,
      destino,
    }
    setPublicados((p) => [nuevo, ...p])
    setPublicado(true)
    e.target.reset()
    setTimeout(() => setPublicado(false), 4000)
  }

  return (
    <div>
      <PageHeader title="Comunicados" subtitle="Publica información oficial del conjunto" />

      {publicado && (
        <div className="animate-fade-up mb-4 flex items-center gap-3 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span className="font-medium">Comunicado publicado. Los residentes seleccionados ya pueden verlo.</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
            <Megaphone className="h-4 w-4 text-brand-600" />
            Nuevo comunicado
          </h3>
          <form onSubmit={publicar} className="space-y-4">
            <Field label="Título" required>
              <Input name="titulo" placeholder="Ej. Mantenimiento del agua este sábado" />
            </Field>
            <Field label="Contenido" required>
              <Textarea name="contenido" className="min-h-32" placeholder="Escribe el contenido del comunicado…" />
            </Field>
            <Field label="Destinatarios" required>
              <div className="flex flex-wrap gap-2">
                {destinatarios.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDestino(d)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                      destino === d
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>
            <Button type="submit" className="w-full">
              Publicar comunicado
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Publicados" subtitle={`${publicados.length} comunicados enviados`} />
          <div className="px-5 py-3">
            {publicados.map((c) => (
              <div key={c.id} className="border-b border-slate-100 py-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{c.titulo}</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="Publicado" dot={false} />
                    <span className="text-xs text-slate-400">{c.fecha}</span>
                  </div>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.contenido}</p>
                <p className="mt-1.5 text-xs font-medium text-slate-500">Enviado a: {c.destino}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}