import { useState } from 'react'
import { Check, Plus, TriangleAlert, X } from 'lucide-react'
import {
  Button,
  Card,
  Field,
  Modal,
  PageHeader,
  Select,
  StatusBadge,
  Textarea,
  UploadBox,
} from '../../components/ui'

const categorias = ['Plomería', 'Eléctrico', 'Carpintería', 'Iluminación', 'Ascensores', 'Zonas comunes', 'Otro']
const ubicaciones = ['Torre 1', 'Torre 2', 'Torre 3', 'Zonas comunes']

const incidenciasIniciales = [
  { id: 'INC-013', titulo: 'Fuga de agua en el baño de la ducha', categoria: 'Plomería', ubicacion: 'Torre 2 · Apto 304', fecha: '07/09/2026', prioridad: 'Alta', estado: 'En proceso', descripcion: 'Se presenta un goteo constante en la ducha del baño principal, incluso con la llave cerrada.' },
  { id: 'INC-012', titulo: 'El ascensor 1 emite un ruido fuerte', categoria: 'Ascensores', ubicacion: 'Torre 1 · Lobby', fecha: '05/09/2026', prioridad: 'Media', estado: 'Nueva', descripcion: 'Al llegar al piso 3 el ascensor 1 presenta un ruido metálico y vibración.' },
  { id: 'INC-010', titulo: 'Cerradura de la puerta principal en mal estado', categoria: 'Carpintería', ubicacion: 'Torre 2 · Apto 304', fecha: '02/09/2026', prioridad: 'Media', estado: 'Nueva', descripcion: 'La cerradura de la puerta principal gira con dificultad y a veces se queda trabada.' },
  { id: 'INC-001', titulo: 'Bombilla quemada en el pasillo del piso 4', categoria: 'Iluminación', ubicacion: 'Torre 2 · Piso 4', fecha: '30/07/2026', prioridad: 'Baja', estado: 'Resuelta', descripcion: 'La bombilla del pasillo del piso 4 está quemada desde hace una semana.' },
]

export default function Incidencias() {
  const [lista, setLista] = useState(incidenciasIniciales)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [reportada, setReportada] = useState(false)

  const responder = (id, respuesta) => {
    setLista(lista.map((i) => (i.id === id ? { ...i, estado: respuesta === 'si' ? 'Evaluada' : 'Reabierta' } : i)))
  }

  return (
    <div>
      <PageHeader
        title="Incidencias"
        subtitle="Reporta y da seguimiento a las novedades de tu unidad"
        actions={
          <Button onClick={() => setModalAbierto(true)} icon={Plus}>
            Reportar incidencia
          </Button>
        }
      />

      {reportada && (
        <div className="animate-fade-up mb-4 flex items-center gap-3 rounded-lg border border-success/30 bg-success-bg px-4 py-3 text-sm text-green-800">
          <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />
          <span className="font-medium">Incidencia reportada correctamente. Quedó en estado "Nueva".</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {lista.map((inc) => (
          <Card key={inc.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    inc.estado === 'Resuelta' || inc.estado === 'Evaluada'
                      ? 'bg-success-bg text-success-strong'
                      : inc.estado === 'En proceso'
                        ? 'bg-warning-bg text-warning-strong'
                        : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  <TriangleAlert className="size-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm font-bold leading-snug text-slate-900">{inc.titulo}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {inc.id} · {inc.ubicacion}
                  </p>
                </div>
              </div>
              <StatusBadge status={inc.estado} />
            </div>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{inc.descripcion}</p>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-md bg-slate-100 px-2 py-1 font-medium">{inc.categoria}</span>
              <span className="rounded-md bg-slate-100 px-2 py-1 font-medium">Prioridad {inc.prioridad.toLowerCase()}</span>
              <span className="ml-auto">{inc.fecha}</span>
            </div>

            {inc.estado === 'Resuelta' && (
              <div className="mt-4 rounded-lg border border-success/30 bg-success-bg p-3">
                <p className="text-sm font-semibold text-green-800">¿La incidencia fue solucionada?</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => responder(inc.id, 'si')} icon={Check}>
                    Correcto
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => responder(inc.id, 'no')} icon={X}>
                    Incorrecto
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Reportar incidencia"
        subtitle="Cuéntanos qué ocurre y dónde"
        icon={Plus}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setReportada(true)
                setModalAbierto(false)
              }}
            >
              Enviar reporte
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Descripción de la incidencia" required>
            <Textarea placeholder="Describe brevemente qué sucede…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoría" required>
              <Select defaultValue={categorias[0]}>
                {categorias.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Ubicación" required>
              <Select defaultValue="Torre 2">
                {ubicaciones.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Apartamento" hint="Si el reporte es comunitario, indica la zona común">
            <Select defaultValue="Torre 2 · Apto 304">
              <option>Torre 1 · Apto 101</option>
              <option>Torre 1 · Apto 204</option>
              <option>Torre 2 · Apto 304</option>
              <option>Torre 3 · Apto 502</option>
            </Select>
          </Field>
          <Field label="Evidencia" hint="Opcional — fotos o capturas del problema">
            <UploadBox hint="Adjuntar evidencia (foto o documento)" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}