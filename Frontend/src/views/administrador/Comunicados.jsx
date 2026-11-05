import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Send } from 'lucide-react'
import { Button, Field, Input, Textarea } from '../../components/ui'
import { api } from '../../lib/api'
import { aComunicado } from '../../lib/datos'
import { useApi } from '../../lib/useApi'
import { Titulo } from '../../components/ui/Panel'
import CarteleraComunicados from '../../components/comunidad/CarteleraComunicados'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const hoy = () => new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function Comunicados() {
  const { datos, recargar } = useApi('/api/comunicados', undefined, [])
  const publicados = datos.map(aComunicado)
  const [publicado, setPublicado] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')

  const publicar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await api.post('/api/comunicados', { titulo: titulo.trim(), cuerpo: contenido.trim() })
      setPublicado(true)
      setTitulo('')
      setContenido('')
      recargar()
      setTimeout(() => setPublicado(false), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const borrador = {
    id: 'borrador',
    titulo: titulo || 'Título del comunicado',
    categoria: 'Aviso',
    fecha: hoy(),
    contenido: contenido || 'Aquí verás el contenido tal como lo leerán los residentes en la cartelera.',
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Comunicados</h1>
        <p className="mt-1 text-sm text-slate-500">Publica información oficial en la cartelera del conjunto</p>
      </div>

      <AnimatePresence>
        {publicado && (
          <motion.div
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
          <form onSubmit={publicar} className="mt-4 space-y-4">
            <Field label="Título" required>
              <Input name="titulo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Corte de agua este sábado" />
            </Field>
            <Field label="Contenido" required>
              <Textarea
                name="contenido"
                required
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                className="min-h-28"
                placeholder="Escribe el contenido del comunicado…"
              />
            </Field>
            {error && (
              <p role="alert" className="rounded-lg bg-danger-bg px-3 py-2 text-sm font-medium text-danger-strong">
                {error}
              </p>
            )}
            <div className="flex justify-end">
              <Button type="submit" icon={Send} disabled={enviando}>
                {enviando ? 'Publicando…' : 'Publicar comunicado'}
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
        <CarteleraComunicados comunicados={publicados} titulo="Publicados" columnas="sm:grid-cols-2 xl:grid-cols-3" />
      </motion.section>
    </div>
  )
}
