import { useState } from 'react'
import { motion } from 'motion/react'
import { Calendar, CheckCircle2, MapPin, Plus } from 'lucide-react'
import { Button, Field, Input, Modal, Select, Textarea, UploadBox } from '../../components/ui'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import Avance from '../../components/incidencias/Avance'
import { CATEGORIAS, aVistaIncidencia, estilosEstado, puntoPrioridad } from '../../lib/incidencias'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'

const formVacio = {
  titulo: '',
  descripcion: '',
  categoria: 'PLOMERIA',
  ubicacion: 'Mi apartamento',
  prioridad: 'MEDIA',
  evidencia: null,
}

const ubicaciones = ['Mi apartamento', 'Torre 1', 'Torre 2', 'Torre 3', 'Zonas comunes']
const prioridades = [
  ['BAJA', 'Baja'],
  ['MEDIA', 'Media'],
  ['ALTA', 'Alta'],
]

export default function Incidencias() {
  const { datos, cargando, error, recargar } = useApi('/api/incidencias', { size: 100, sort: 'id,desc' }, { content: [] })
  const lista = datos.content.map(aVistaIncidencia)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [reportada, setReportada] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [form, setForm] = useState(formVacio)
  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const enviar = async () => {
    setErrorForm('')
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      setErrorForm('Escribe un título y una descripción.')
      return
    }
    setEnviando(true)
    try {
      const creada = await api.post('/api/incidencias', {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        ubicacion: form.ubicacion,
        prioridad: form.prioridad,
        categoria: form.categoria,
      })
      if (form.evidencia) {
        const datosArchivo = new FormData()
        datosArchivo.append('archivo', form.evidencia)
        await api.subir(`/api/incidencias/${creada.id}/evidencias`, datosArchivo)
      }
      setReportada(true)
      setModalAbierto(false)
      setForm(formVacio)
      recargar()
    } catch (e) {
      setErrorForm(e.message)
    } finally {
      setEnviando(false)
    }
  }

  const contar = (...estados) => lista.filter((i) => estados.includes(i.estado)).length
  const resumen = [
    ['Nuevas', contar('Nueva'), 'bg-sky-500'],
    ['En proceso', contar('En proceso'), 'bg-warning'],
    ['Resueltas', contar('Resuelta'), 'bg-success'],
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
          {lista.length} {lista.length === 1 ? 'reporte' : 'reportes'}
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

      {error && (
        <p role="alert" className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-strong">
          {error.message}
        </p>
      )}
      {cargando && lista.length === 0 && <p className="text-sm text-slate-500">Cargando incidencias…</p>}
      {!cargando && !error && lista.length === 0 && (
        <p className="text-sm text-slate-500">Aún no has reportado incidencias.</p>
      )}

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
                  {inc.estado}
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

              {inc.estado === 'Resuelta' && inc.solucion && (
                <div className="mt-4 rounded-xl bg-success-bg p-3.5 ring-1 ring-green-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-success-strong">Solución aplicada</p>
                  <p className="mt-1 text-sm text-slate-700">{inc.solucion}</p>
                </div>
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
            <Button onClick={enviar} disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="¿Qué tipo de problema es?" required>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Categoría">
              {CATEGORIAS.map(({ clave, etiqueta }) => (
                <button
                  key={clave}
                  type="button"
                  role="radio"
                  aria-checked={form.categoria === clave}
                  onClick={() => setForm({ ...form, categoria: clave })}
                  className={cn(
                    'overflow-hidden rounded-xl border text-left outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500',
                    form.categoria === clave ? 'border-brand-500 ring-2 ring-brand-500' : 'border-slate-200 hover:border-brand-300',
                  )}
                >
                  <IlustracionIncidencia categoria={etiqueta} className="h-14" />
                  <span className="block px-2 py-1.5 text-xs font-semibold text-slate-700">{etiqueta}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Título" required>
            <Input placeholder="Ej. Fuga de agua en el baño" maxLength={200} value={form.titulo} onChange={cambiar('titulo')} />
          </Field>
          <Field label="Descripción de la incidencia" required>
            <Textarea placeholder="Describe brevemente qué sucede…" maxLength={1000} value={form.descripcion} onChange={cambiar('descripcion')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ubicación" required>
              <Select value={form.ubicacion} onChange={cambiar('ubicacion')}>
                {ubicaciones.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </Select>
            </Field>
            <Field label="Prioridad" required>
              <Select value={form.prioridad} onChange={cambiar('prioridad')}>
                {prioridades.map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>
                    {etiqueta}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Evidencia" hint="Opcional — una foto o captura del problema">
            <UploadBox
              hint="Adjuntar evidencia (foto o documento)"
              archivo={form.evidencia}
              onChange={(archivo) => setForm({ ...form, evidencia: archivo })}
            />
          </Field>
          {errorForm && (
            <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger-strong">
              {errorForm}
            </p>
          )}
        </div>
      </Modal>
    </div>
  )
}
