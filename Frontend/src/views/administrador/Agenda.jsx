import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CalendarDays, CalendarPlus, CheckCircle2, RotateCcw } from 'lucide-react'
import { Button, EmptyState, Field, Input, Textarea } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import AgendaEventos from '../../components/comunidad/AgendaEventos'
import { TIPOS_EVENTO, agendaApi } from '../../lib/agenda'
import { aparecer, tarjeta } from '../../lib/panel'
import { useCarga } from '../../lib/useCarga'
import { cn } from '../../lib/utils'

const nuevo = () => ({ titulo: '', descripcion: '', fecha: '', horaInicio: '', horaFin: '', lugar: '', tipo: 'EVENTO' })

// Agenda del conjunto: la administración publica asambleas, mantenimientos programados, trámites y eventos.
// Los residentes la ven en Comunidad.
export default function Agenda() {
  const { datos: eventos, error, recargar } = useCarga(agendaApi.proximos)
  const [form, setForm] = useState(nuevo)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState('')

  const cambiar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }))
    setErrores((x) => ({ ...x, [campo]: undefined }))
  }

  const publicar = async (e) => {
    e.preventDefault()
    const encontrados = {}
    if (!form.titulo.trim()) encontrados.titulo = 'Escribe el nombre del evento.'
    if (!form.fecha) encontrados.fecha = 'Elige la fecha.'
    else if (form.fecha < new Date().toLocaleDateString('en-CA')) encontrados.fecha = 'La fecha no puede ser anterior a hoy.'
    if (!form.horaInicio) encontrados.horaInicio = 'Elige la hora de inicio.'
    if (form.horaFin && form.horaInicio && form.horaFin <= form.horaInicio) encontrados.horaFin = 'Debe ser después de la hora de inicio.'
    if (!form.lugar.trim()) encontrados.lugar = 'Indica dónde será.'
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setGuardando(true)
    setErrorGeneral('')
    try {
      await agendaApi.crear({
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        fecha: form.fecha,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin || null,
        lugar: form.lugar.trim(),
        tipo: form.tipo,
      })
      setAviso(`"${form.titulo.trim()}" quedó en la agenda del conjunto.`)
      setForm(nuevo())
      recargar()
    } catch (err) {
      if (Object.keys(err.erroresCampo).length) setErrores(err.erroresCampo)
      else setErrorGeneral(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async (evento) => {
    setGuardando(true)
    try {
      await agendaApi.eliminar(evento.id)
      setAviso(`Se quitó "${evento.titulo}" de la agenda.`)
      recargar()
    } catch (err) {
      setErrorGeneral(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Agenda</h1>
        <p className="mt-1 text-sm text-slate-500">Asambleas, mantenimientos programados y eventos del conjunto. Los residentes los ven en Comunidad.</p>
      </div>

      <AnimatePresence>
        {aviso && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-strong ring-1 ring-green-200"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="font-medium">{aviso}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        {/* Nuevo evento */}
        <motion.section {...aparecer(0)} className={cn(tarjeta, 'p-5 sm:p-6')}>
          <Titulo>Nuevo evento</Titulo>
          <form onSubmit={publicar} noValidate className="mt-4 space-y-4">
            <Field label="Tipo" required>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Tipo de evento">
                {Object.entries(TIPOS_EVENTO).map(([clave, t]) => (
                  <button
                    key={clave}
                    type="button"
                    role="radio"
                    aria-checked={form.tipo === clave}
                    onClick={() => setForm((f) => ({ ...f, tipo: clave }))}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-semibold outline-none ring-1 transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
                      form.tipo === clave ? cn(t.chip, 'ring-2 ring-current') : 'text-slate-600 ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <span className={cn('size-2.5 rounded-full', t.cabeza)} />
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Nombre del evento" htmlFor="ev-titulo" required error={errores.titulo}>
              <Input id="ev-titulo" maxLength={150} value={form.titulo} onChange={cambiar('titulo')} placeholder="Ej. Asamblea general de copropietarios" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Fecha" htmlFor="ev-fecha" required error={errores.fecha}>
                <Input id="ev-fecha" type="date" value={form.fecha} onChange={cambiar('fecha')} />
              </Field>
              <Field label="Empieza" htmlFor="ev-inicio" required error={errores.horaInicio}>
                <Input id="ev-inicio" type="time" value={form.horaInicio} onChange={cambiar('horaInicio')} />
              </Field>
              <Field label="Termina" htmlFor="ev-fin" error={errores.horaFin} hint="Opcional">
                <Input id="ev-fin" type="time" value={form.horaFin} onChange={cambiar('horaFin')} />
              </Field>
            </div>
            <Field label="Lugar" htmlFor="ev-lugar" required error={errores.lugar}>
              <Input id="ev-lugar" maxLength={150} value={form.lugar} onChange={cambiar('lugar')} placeholder="Ej. Salón Social" />
            </Field>
            <Field label="Detalles" htmlFor="ev-desc" error={errores.descripcion} hint="Opcional. Qué deben saber o llevar los residentes.">
              <Textarea id="ev-desc" maxLength={1000} value={form.descripcion} onChange={cambiar('descripcion')} placeholder="Ej. Se votará el presupuesto del próximo año. Lleva tu poder si no eres el propietario." />
            </Field>
            {errorGeneral && (
              <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger-strong">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {errorGeneral}
              </p>
            )}
            <div className="flex justify-end">
              <Button type="submit" icon={CalendarPlus} disabled={guardando}>
                {guardando ? 'Publicando…' : 'Publicar en la agenda'}
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Próximos eventos */}
        <motion.section {...aparecer(1)} className={cn(tarjeta, 'self-start p-5')}>
          <Titulo>Próximos eventos</Titulo>
          <div className="mt-4">
            {error ? (
              <EmptyState
                icon={AlertCircle}
                title="No se pudo cargar la agenda"
                description={error}
                action={
                  <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                    Intentar de nuevo
                  </Button>
                }
              />
            ) : !eventos ? (
              <div className="space-y-3" role="status" aria-label="Cargando agenda">
                {[0, 1].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : eventos.length === 0 ? (
              <EmptyState icon={CalendarDays} title="La agenda está vacía" description="Los eventos que publiques aparecerán aquí y en la Comunidad de los residentes." />
            ) : (
              <AgendaEventos eventos={eventos} onEliminar={eliminar} ocupado={guardando} />
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
