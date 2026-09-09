import { Megaphone, Send } from 'lucide-react'
import { Button, Card, CardHeader, PageHeader } from '../../components/ui'
import { comunicados, mensajesComunidad, notificaciones } from '../../data/mock'

export default function Comunidad() {
  return (
    <div>
      <PageHeader
        title="Comunidad"
        subtitle="Comunicados, notificaciones y chat del conjunto"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Comunicados" subtitle="Información oficial de la administración" />
          <div className="px-5 py-3">
            {comunicados.map((c) => (
              <div key={c.id} className="border-b border-slate-100 py-4 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{c.titulo}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                      <Megaphone className="h-3 w-3" />
                      {c.categoria} · {c.fecha}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.contenido}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Notificaciones" subtitle="Recientes" />
          <div className="px-5 py-2">
            {notificaciones.slice(0, 4).map((n) => (
              <div key={n.id} className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.leida ? 'bg-slate-200' : 'bg-brand-600'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{n.titulo}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.detalle}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Chat comunitario"
          subtitle="Conversación del conjunto residencial · Interfaz simulada"
          action={
            <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-strong">
              128 residentes
            </span>
          }
        />
        <div className="px-5 py-4">
          <div className="space-y-3">
            {mensajesComunidad.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.autor === 'Juan Pérez' ? 'flex-row-reverse' : ''}`}>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    m.autor === 'Juan Pérez' ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {m.autor.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </span>
                <div className={`max-w-md ${m.autor === 'Juan Pérez' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block rounded-lg px-4 py-2 text-sm ${
                      m.autor === 'Juan Pérez'
                        ? 'rounded-tr-md bg-brand-600 text-white'
                        : 'rounded-tl-md bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.texto}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {m.autor} · {m.torre} · {m.hora}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <input
              type="text"
              placeholder="Escribe un mensaje a la comunidad…"
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <Button size="sm" icon={Send}>
              Enviar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}