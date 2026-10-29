import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Megaphone, Send, Users, Waves } from 'lucide-react'
import { Button, Field, Input, Textarea } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import CarteleraComunicados from '../../components/comunidad/CarteleraComunicados'
import { comunicados } from '../../data/mock'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const destinatarios = ['Todos los residentes', 'Torre 1', 'Torre 2', 'Torre 3']
const categorias = [
  ['Aviso', Megaphone, 'bg-brand-50 text-brand-700 ring-brand-500'],
  ['Asamblea', Users, 'bg-violet-50 text-violet-700 ring-violet-500'],
  ['Zonas comunes', Waves, 'bg-sky-50 text-sky-700 ring-sky-500'],
]
const hoy = () => new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function Comunicados() {
  const [publicados, setPublicados] = useState(() => comunicados.map((c) => ({ ...c, destino: 'Todos los residentes' })))
  const [publicado, setPublicado] = useState(false)
  const [destino, setDestino] = useState(destinatarios[0])
  const [categoria, setCategoria] = useState('Aviso')
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')

  const publicar = (e) => {
    e.preventDefault()
    const nuevo = { id: Date.now(), titulo, categoria, fecha: hoy(), contenido, destino }
    setPublicados((p) => [nuevo, ...p])
    setPublicado(true)
    setTitulo('')
    setContenido('')
    setTimeout(() => setPublicado(false), 4000)
  }

  const borrador = {
    id: 'borrador',
    titulo: titulo || 'Título del comunicado',
    categoria,
    fecha: hoy(),
    contenido: contenido || 'Aquí verás el contenido tal como lo leerán los residentes en la cartelera.',
    destino,
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
            <Field label="Categoría" required>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Categoría">
                {categorias.map(([c, Icono, tono]) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={categoria === c}
                    onClick={() => setCategoria(c)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold outline-none ring-1 transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
                      categoria === c ? cn(tono, 'ring-2') : 'text-slate-600 ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <Icono className="size-5" strokeWidth={2} />
                    {c}
                  </button>
                ))}
              </div>
            </Field>
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
            <Field label="Destinatarios" required>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Destinatarios">
                {destinatarios.map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={destino === d}
                    onClick={() => setDestino(d)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-semibold outline-none ring-1 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                      destino === d ? 'bg-brand-600 text-white ring-brand-600' : 'text-slate-600 ring-slate-300 hover:bg-slate-50',
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex justify-end">
              <Button type="submit" icon={Send}>
                Publicar comunicado
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
