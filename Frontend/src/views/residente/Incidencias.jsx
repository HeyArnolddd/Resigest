import { useState } from 'react'
import { motion } from 'motion/react'
import { Calendar, Check, CheckCircle2, MapPin, Plus, RotateCcw, X } from 'lucide-react'
import { Button, Field, Modal, Select, Textarea, UploadBox } from '../../components/ui'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import Avance from '../../components/incidencias/Avance'
import { estilosEstado, puntoPrioridad } from '../../lib/incidencias'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

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
  const [categoriaNueva, setCategoriaNueva] = useState(categorias[0])

  const responder = (id, respuesta) => {
    setLista(lista.map((i) => (i.id === id ? { ...i, estado: respuesta === 'si' ? 'Evaluada' : 'Reabierta' } : i)))
  }

  const contar = (...estados) => lista.filter((i) => estados.includes(i.estado)).length
  const resumen = [
    ['Nuevas', contar('Nueva'), 'bg-sky-500'],
    ['En proceso', contar('En proceso', 'Reabierta'), 'bg-warning'],
    ['Resueltas', contar('Resuelta', 'Evaluada'), 'bg-success'],
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incidencias</h1>
          <p className="mt-1 text-sm text-slate-500">Reporta y da seguimiento a las novedades de tu unidad</p>
        </div>
        <Button onClick={() => setModalAbierto(true)} icon={Plus}>
          Reportar incidencia
        </Button>
      </div>

      {/* Resumen por estado */}
      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4')}>
        <p className="text-sm font-bold text-slate-900">
          {lista.length} reportes
        </p>
        {resumen.map(([etiqueta, n, punto]) => (
          <p key={etiqueta} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={cn('size-2.5 rounded-full', punto)} />
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">{n}</span>
            {etiqueta}
          </p>
        ))}
        <div className="ml-auto hidden h-2.5 w-56 overflow-hidden rounded-full bg-slate-100 sm:flex" aria-hidden="true">
          {resumen.map(([etiqueta, n, punto]) => (
            <span key={etiqueta} style={{ flexGrow: n }} className={cn('h-full', punto)} />
          ))}
        </div>
      </motion.div>

      {reportada && (
        <div className="animate-fade-up flex items-center gap-3 rounded-xl border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-strong">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="font-medium">Incidencia reportada correctamente. Quedó en estado &quot;Nueva&quot;.</span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {lista.map((inc, n) => (
          <motion.article key={inc.id} {...aparecer(n + 1)} className={cn(tarjeta, 'flex flex-col overflow-hidden sm:flex-row')}>
            <IlustracionIncidencia categoria={inc.categoria} className="h-32 shrink-0 sm:h-auto sm:w-36" />

            <div className="flex min-w-0 flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">{inc.id}</span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1',
                    estilosEstado[inc.estado],
                  )}
                >
                  {inc.estado === 'Evaluada' ? 'Solución confirmada' : inc.estado}
                </span>
              </div>

              <h2 className="mt-2.5 text-base font-bold leading-snug text-slate-900">{inc.titulo}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{inc.descripcion}</p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" /> {inc.ubicacion}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" /> {inc.fecha}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={cn('size-2 rounded-full', puntoPrioridad[inc.prioridad])} />
                  Prioridad {inc.prioridad.toLowerCase()}
                </span>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <Avance estado={inc.estado} />
              </div>

              {inc.estado === 'Resuelta' && (
                <div className="mt-4 rounded-xl bg-brand-50 p-3.5 ring-1 ring-brand-100">
                  <p className="text-sm font-semibold text-brand-800">¿La incidencia fue solucionada?</p>
                  <div className="mt-2.5 flex gap-2">
                    <Button size="sm" onClick={() => responder(inc.id, 'si')} icon={Check}>
                      Correcto
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => responder(inc.id, 'no')} icon={X}>
                      Incorrecto
                    </Button>
                  </div>
                </div>
              )}
              {inc.estado === 'Evaluada' && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-success-bg px-3.5 py-2.5 text-xs font-medium text-success-strong">
                  <CheckCircle2 className="size-4 shrink-0" /> Gracias por confirmar. La incidencia quedó cerrada.
                </p>
              )}
              {inc.estado === 'Reabierta' && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-danger-bg px-3.5 py-2.5 text-xs font-medium text-danger-strong">
                  <RotateCcw className="size-4 shrink-0" /> La reabrimos. Mantenimiento volverá a revisarla.
                </p>
              )}
            </div>
          </motion.article>
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
          <Field label="¿Qué tipo de problema es?" required>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Categoría">
              {categorias.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={categoriaNueva === c}
                  onClick={() => setCategoriaNueva(c)}
                  className={cn(
                    'overflow-hidden rounded-xl border text-left outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500',
                    categoriaNueva === c ? 'border-brand-500 ring-2 ring-brand-500' : 'border-slate-200 hover:border-brand-300',
                  )}
                >
                  <IlustracionIncidencia categoria={c} className="h-14" />
                  <span className="block px-2 py-1.5 text-xs font-semibold text-slate-700">{c}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Descripción de la incidencia" required>
            <Textarea placeholder="Describe brevemente qué sucede…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ubicación" required>
              <Select defaultValue="Torre 2">
                {ubicaciones.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </Select>
            </Field>
            <Field label="Apartamento" hint="Si el reporte es comunitario, indica la zona común">
              <Select defaultValue="Torre 2 · Apto 304">
                <option>Torre 1 · Apto 101</option>
                <option>Torre 1 · Apto 204</option>
                <option>Torre 2 · Apto 304</option>
                <option>Torre 3 · Apto 502</option>
              </Select>
            </Field>
          </div>
          <Field label="Evidencia" hint="Opcional — fotos o capturas del problema">
            <UploadBox hint="Adjuntar evidencia (foto o documento)" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
