import { useState } from 'react'
import { motion } from 'motion/react'
import { AlertCircle, Calendar, Check, CheckCircle2, MapPin, Plus, RotateCcw, Wrench } from 'lucide-react'
import { ArchivoProtegido, Button, CampoArchivo, EmptyState, Field, Input, Modal, Select, Textarea } from '../../components/ui'
import IlustracionIncidencia from '../../components/incidencias/IlustracionIncidencia'
import Avance from '../../components/incidencias/Avance'
import { CATEGORIAS, estilosEstado, incidenciasApi, prioridadApi, puntoPrioridad } from '../../lib/incidencias'
import { aparecer, tarjeta } from '../../lib/panel'
import { useSesion } from '../../lib/sesion'
import { useCarga } from '../../lib/useCarga'
import { cn } from '../../lib/utils'

const OTRAS_UBICACIONES = ['Pasillo o escaleras de mi torre', 'Ascensor', 'Zonas comunes', 'Parqueadero', 'Portería']
const PRIORIDADES = [
  ['Baja', 'Puede esperar'],
  ['Media', 'Afecta el uso normal'],
  ['Alta', 'Riesgo o daño grave'],
]

function nuevoReporte(apartamento) {
  return { categoria: CATEGORIAS[0], titulo: '', descripcion: '', ubicacion: apartamento ?? OTRAS_UBICACIONES[0], prioridad: 'Media' }
}

export default function Incidencias() {
  const { usuario } = useSesion()
  // El residente reporta para su apartamento; portería también usa esta pantalla sin apartamento
  const miApartamento = usuario.apartamento
  const { datos: lista, error, recargar } = useCarga(incidenciasApi.mias, 'res:incidencias')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [reporte, setReporte] = useState(() => nuevoReporte(miApartamento))
  const [foto, setFoto] = useState(null)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [reportada, setReportada] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [reabriendo, setReabriendo] = useState(null)
  const [comentario, setComentario] = useState('')
  const [errorConfirmacion, setErrorConfirmacion] = useState('')

  // Sí: la incidencia queda confirmada. No: vuelve a mantenimiento con el comentario
  const confirmar = async (inc, solucionado, texto) => {
    if (!solucionado && !texto?.trim()) {
      setErrorConfirmacion('Cuéntale a mantenimiento qué sigue fallando.')
      return
    }
    setConfirmando(true)
    setErrorConfirmacion('')
    try {
      await incidenciasApi.confirmar(inc.id, solucionado, solucionado ? null : texto.trim())
      setReabriendo(null)
      setComentario('')
      recargar()
    } catch (e) {
      setErrorConfirmacion(e.message)
    } finally {
      setConfirmando(false)
    }
  }

  const incidencias = lista ?? []
  const contar = (...estados) => incidencias.filter((i) => estados.includes(i.estado)).length
  const resumen = [
    ['Nuevas', contar('Nueva', 'Asignada'), 'bg-sky-500'],
    ['En proceso', contar('En proceso'), 'bg-warning'],
    ['Por confirmar', contar('Por confirmar'), 'bg-success'],
    ['Confirmadas', contar('Confirmada'), 'bg-brand-700'],
  ]

  const cambiar = (campo) => (valor) => {
    setReporte((r) => ({ ...r, [campo]: valor }))
    setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  const abrir = () => {
    setReporte(nuevoReporte(miApartamento))
    setFoto(null)
    setErrores({})
    setErrorGeneral('')
    setModalAbierto(true)
  }

  const enviar = async (e) => {
    e.preventDefault()
    const encontrados = {}
    if (!reporte.titulo.trim()) encontrados.titulo = 'Escribe un título corto, por ejemplo "Fuga en el lavamanos".'
    if (!reporte.descripcion.trim()) encontrados.descripcion = 'Cuéntanos qué ocurre.'
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setEnviando(true)
    setErrorGeneral('')
    try {
      const creada = await incidenciasApi.reportar({
        titulo: reporte.titulo.trim(),
        descripcion: reporte.descripcion.trim(),
        ubicacion: reporte.ubicacion,
        categoria: reporte.categoria,
        prioridad: prioridadApi(reporte.prioridad),
      })
      // La foto se adjunta una vez creada la incidencia
      if (foto) await incidenciasApi.agregarEvidencia(creada.id, foto)
      setModalAbierto(false)
      setReportada(true)
      recargar()
    } catch (err) {
      if (Object.keys(err.erroresCampo).length) setErrores(err.erroresCampo)
      else setErrorGeneral(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Incidencias</h1>
          <p className="mt-1 text-sm text-slate-500">Reporta y da seguimiento a las novedades de tu unidad</p>
        </div>
        <Button onClick={abrir} icon={Plus}>
          Reportar incidencia
        </Button>
      </div>

      {/* Resumen por estado */}
      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4')}>
        <p className="text-sm font-bold text-slate-900">{lista ? (incidencias.length === 1 ? '1 reporte' : `${incidencias.length} reportes`) : 'Cargando…'}</p>
        {resumen.map(([etiqueta, n, punto]) => (
          <p key={etiqueta} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={cn('size-2.5 rounded-full', punto)} />
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">{lista ? n : '–'}</span>
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
        <div role="status" className="animate-fade-up flex items-center gap-3 rounded-xl border border-success/30 bg-success-bg px-4 py-3 text-sm text-success-strong">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="font-medium">Incidencia reportada. La administración la revisará y asignará a un técnico.</span>
        </div>
      )}

      {error ? (
        <div className={tarjeta}>
          <EmptyState
            icon={AlertCircle}
            title="No se pudieron cargar tus incidencias"
            description={error}
            action={
              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                Intentar de nuevo
              </Button>
            }
          />
        </div>
      ) : !lista ? (
        <div className="grid gap-5 lg:grid-cols-2" role="status" aria-label="Cargando incidencias">
          {[0, 1].map((i) => (
            <div key={i} className={cn(tarjeta, 'h-52 animate-pulse')} />
          ))}
        </div>
      ) : incidencias.length === 0 ? (
        <div className={cn(tarjeta, 'flex flex-col items-center gap-2 px-6 py-12 text-center')}>
          <span className="flex size-12 items-center justify-center rounded-full bg-success-bg text-success-strong">
            <CheckCircle2 className="size-6" />
          </span>
          <p className="text-sm font-bold text-slate-900">No has reportado incidencias</p>
          <p className="max-w-sm text-xs text-slate-500">Si algo se daña en tu apartamento o en las zonas comunes, repórtalo aquí y sigue cómo avanza.</p>
          <Button size="sm" icon={Plus} className="mt-2" onClick={abrir}>
            Reportar incidencia
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {incidencias.map((inc, n) => (
            <motion.article key={inc.id} {...aparecer(n + 1)} className={cn(tarjeta, 'flex flex-col overflow-hidden sm:flex-row')}>
              <IlustracionIncidencia categoria={inc.categoria} className="h-32 shrink-0 sm:h-auto sm:w-36" />

              <div className="flex min-w-0 flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">{inc.codigo}</span>
                    <span className="text-[11px] font-medium text-slate-400">{inc.categoria}</span>
                  </span>
                  <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1', estilosEstado[inc.estado])}>
                    {inc.estado}
                  </span>
                </div>

                <h2 className="mt-2.5 text-base font-bold leading-snug text-slate-900">{inc.titulo}</h2>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">{inc.descripcion}</p>

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

                {inc.evidencias.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {inc.evidencias.map((url) => (
                      <ArchivoProtegido key={url} url={url} alt={`Evidencia de ${inc.titulo}`} className="size-16" />
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <Avance estado={inc.paso} />
                </div>

                {inc.tecnico && !inc.terminada && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Wrench className="size-3.5" /> A cargo de <span className="font-semibold text-slate-700">{inc.tecnico}</span>
                  </p>
                )}
                {inc.estado === 'En proceso' && inc.observacion && (
                  <p className="mt-3 rounded-xl bg-warning-bg px-3.5 py-2.5 text-xs text-warning-strong">
                    <span className="font-semibold">La reabriste:</span> {inc.observacion}
                  </p>
                )}
                {inc.terminada && (
                  <div className={cn('mt-4 rounded-xl p-3.5', inc.estado === 'Por confirmar' ? 'bg-brand-50 ring-1 ring-brand-100' : 'bg-success-bg')}>
                    <div className="flex gap-3">
                      {inc.fotoSolucionUrl && <ArchivoProtegido url={inc.fotoSolucionUrl} alt="Foto del trabajo terminado" className="size-20 shrink-0" />}
                      <div className="min-w-0 text-xs">
                        <p className="font-semibold text-slate-800">{inc.tecnico ? `${inc.tecnico} la resolvió` : 'Mantenimiento la resolvió'}</p>
                        {inc.solucion && <p className="mt-1 text-slate-600">{inc.solucion}</p>}
                      </div>
                    </div>
                    {inc.estado === 'Por confirmar' ? (
                      <div className="mt-3 border-t border-brand-100 pt-3">
                        <p className="text-sm font-semibold text-brand-800">¿Quedó solucionado el problema?</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button size="sm" icon={Check} disabled={confirmando} onClick={() => confirmar(inc, true)}>
                            Sí, quedó bien
                          </Button>
                          <Button size="sm" variant="secondary" icon={RotateCcw} disabled={confirmando} onClick={() => setReabriendo(inc)}>
                            No, sigue el problema
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-success-strong">
                        <CheckCircle2 className="size-4 shrink-0" /> Confirmaste que quedó solucionada. ¡Gracias!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(reabriendo)}
        onClose={() => setReabriendo(null)}
        title="El problema sigue"
        subtitle={reabriendo?.titulo}
        icon={RotateCcw}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReabriendo(null)}>
              Cancelar
            </Button>
            <Button disabled={confirmando} onClick={() => confirmar(reabriendo, false, comentario)}>
              {confirmando ? 'Enviando…' : 'Devolver a mantenimiento'}
            </Button>
          </>
        }
      >
        <Field label="¿Qué sigue fallando?" htmlFor="inc-reabrir" required error={errorConfirmacion} hint="Mantenimiento recibirá este comentario y volverá a revisarla.">
          <Textarea
            id="inc-reabrir"
            maxLength={500}
            value={comentario}
            onChange={(e) => {
              setComentario(e.target.value)
              setErrorConfirmacion('')
            }}
            placeholder="Ej. Ya no gotea el lavamanos, pero ahora sale agua por debajo del mueble"
          />
        </Field>
      </Modal>

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
            <Button type="submit" form="form-incidencia" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </>
        }
      >
        <form id="form-incidencia" onSubmit={enviar} noValidate className="space-y-4">
          <Field label="¿Qué tipo de problema es?" required>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Categoría">
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={reporte.categoria === c}
                  onClick={() => cambiar('categoria')(c)}
                  className={cn(
                    'overflow-hidden rounded-xl border text-left outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500',
                    reporte.categoria === c ? 'border-brand-500 ring-2 ring-brand-500' : 'border-slate-200 hover:border-brand-300',
                  )}
                >
                  <IlustracionIncidencia categoria={c} className="h-14" />
                  <span className="block px-2 py-1.5 text-xs font-semibold text-slate-700">{c}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Título" htmlFor="inc-titulo" required error={errores.titulo}>
            <Input id="inc-titulo" maxLength={200} value={reporte.titulo} onChange={(e) => cambiar('titulo')(e.target.value)} placeholder="Ej. Fuga en el lavamanos del baño" />
          </Field>
          <Field label="¿Qué ocurre?" htmlFor="inc-desc" required error={errores.descripcion}>
            <Textarea id="inc-desc" maxLength={1000} value={reporte.descripcion} onChange={(e) => cambiar('descripcion')(e.target.value)} placeholder="Describe el problema y desde cuándo pasa…" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="¿Dónde?" htmlFor="inc-ubicacion" required>
              <Select id="inc-ubicacion" value={reporte.ubicacion} onChange={(e) => cambiar('ubicacion')(e.target.value)}>
                {miApartamento && <option value={miApartamento}>Mi apartamento ({miApartamento})</option>}
                {OTRAS_UBICACIONES.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </Select>
            </Field>
            <Field label="Prioridad" htmlFor="inc-prioridad" required>
              <Select id="inc-prioridad" value={reporte.prioridad} onChange={(e) => cambiar('prioridad')(e.target.value)}>
                {PRIORIDADES.map(([p, desc]) => (
                  <option key={p} value={p}>
                    {p} · {desc}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Foto del problema" htmlFor="inc-foto" hint="Opcional. Ayuda a mantenimiento a entender el daño antes de ir.">
            <CampoArchivo id="inc-foto" value={foto} onChange={setFoto} texto="Toca para tomar o elegir una foto" />
          </Field>
          {errorGeneral && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger-strong">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {errorGeneral}
            </p>
          )}
        </form>
      </Modal>
    </div>
  )
}
