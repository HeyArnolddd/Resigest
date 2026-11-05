import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle2, RotateCcw, Send } from 'lucide-react'
import { Button, EmptyState, Field, Input, Textarea } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import CarteleraComunicados from '../../components/comunidad/CarteleraComunicados'
import { adminApi, useCarga } from '../../lib/admin'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'
import { useSesion } from '../../lib/sesion'

const fmtFecha = (fecha) => fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
const MAX_CUERPO = 2000

// ComunicadoDTO → hoja de la cartelera (los más recientes primero)
const aHoja = (c) => ({ id: c.id, titulo: c.titulo, contenido: c.cuerpo, fecha: fmtFecha(new Date(c.fechaPublicacion)), autor: c.autorNombre })
const cargar = () => adminApi.comunicados().then((lista) => [...lista].sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion)).map(aHoja))

export default function Comunicados() {
  const { usuario } = useSesion()
  const { datos: publicados, error, recargar } = useCarga(cargar)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [publicado, setPublicado] = useState(false)

  const publicar = async (e) => {
    e.preventDefault()
    const encontrados = {}
    if (!titulo.trim()) encontrados.titulo = 'Escribe un título.'
    if (!contenido.trim()) encontrados.cuerpo = 'Escribe el contenido del comunicado.'
    setErrores(encontrados)
    if (Object.keys(encontrados).length) return

    setPublicando(true)
    setErrorGeneral('')
    try {
      await adminApi.publicarComunicado({ titulo: titulo.trim(), cuerpo: contenido.trim() })
      setTitulo('')
      setContenido('')
      setPublicado(true)
      setTimeout(() => setPublicado(false), 4000)
      recargar()
    } catch (err) {
      if (Object.keys(err.erroresCampo).length) setErrores(err.erroresCampo)
      else setErrorGeneral(err.message)
    } finally {
      setPublicando(false)
    }
  }

  const borrador = {
    id: 'borrador',
    titulo: titulo || 'Título del comunicado',
    fecha: fmtFecha(new Date()),
    contenido: contenido || 'Aquí verás el contenido tal como lo leerán los residentes en la cartelera.',
    autor: usuario.nombreCompleto,
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Comunicados</h1>
        <p className="mt-1 text-sm text-slate-500">Publica información oficial en la cartelera del conjunto. La ven todos los residentes.</p>
      </div>

      <AnimatePresence>
        {publicado && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-strong ring-1 ring-green-200"
          >
            <CheckCircle2 className="size-5 shrink-0" />
            <span className="font-medium">Comunicado publicado. Ya aparece en la cartelera de los residentes.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        {/* Redactar */}
        <motion.section {...aparecer(0)} className={cn(tarjeta, 'p-5 sm:p-6')}>
          <Titulo>Nuevo comunicado</Titulo>
          <form onSubmit={publicar} noValidate className="mt-4 space-y-4">
            <Field label="Título" htmlFor="com-titulo" required error={errores.titulo}>
              <Input id="com-titulo" maxLength={200} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Corte de agua este sábado" />
            </Field>
            <Field
              label="Contenido"
              htmlFor="com-cuerpo"
              required
              error={errores.cuerpo}
              hint={`${contenido.length} de ${MAX_CUERPO} caracteres`}
            >
              <Textarea
                id="com-cuerpo"
                maxLength={MAX_CUERPO}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                className="min-h-36"
                placeholder="Escribe el contenido del comunicado…"
              />
            </Field>
            {errorGeneral && (
              <p role="alert" className="flex items-start gap-2 rounded-lg bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger-strong">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {errorGeneral}
              </p>
            )}
            <div className="flex justify-end">
              <Button type="submit" icon={Send} disabled={publicando}>
                {publicando ? 'Publicando…' : 'Publicar comunicado'}
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Vista previa en vivo */}
        <motion.section {...aparecer(1)} className="lg:self-start">
          <CarteleraComunicados comunicados={[borrador]} titulo="Vista previa" columnas="grid-cols-1" contador={false} />
        </motion.section>
      </div>

      <motion.section {...aparecer(2)}>
        {error ? (
          <div className={tarjeta}>
            <EmptyState
              icon={AlertCircle}
              title="No se pudieron cargar los comunicados"
              description={error}
              action={
                <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                  Intentar de nuevo
                </Button>
              }
            />
          </div>
        ) : publicados ? (
          <CarteleraComunicados comunicados={publicados} titulo="Publicados" columnas="sm:grid-cols-2 xl:grid-cols-3" />
        ) : (
          <div className={cn(tarjeta, 'h-48 animate-pulse')} role="status" aria-label="Cargando comunicados" />
        )}
      </motion.section>
    </div>
  )
}
