import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, BellRing, HandHelping, PackageCheck, PackagePlus, RotateCcw, Search, X } from 'lucide-react'
import { ArchivoProtegido, Button, EmptyState, Field, Input, Modal } from '../../components/ui'
import { Titulo } from '../../components/ui/Panel'
import IlustracionPaquete from '../../components/paquetes/IlustracionPaquete'
import { aparecer, tarjeta } from '../../lib/panel'
import { esDeHoy, hora, porteriaApi } from '../../lib/porteria'
import { useCarga } from '../../lib/useCarga'
import { cn } from '../../lib/utils'
import RegistrarPaquete from './RegistrarPaquete'

const POR_REPISA = 4
const MAX_ENTREGADOS = 15
const fmtDia = (iso) => (esDeHoy(iso) ? 'Hoy' : new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }))

const cargarTodo = () => Promise.all([porteriaApi.paquetes(), porteriaApi.directorio()]).then(([paquetes, directorio]) => ({ paquetes, directorio }))

// Repisa sin paquetes: archivadores y una matera para que no se vea vacía
function DecoRepisa() {
  return (
    <svg viewBox="0 0 400 80" preserveAspectRatio="xMidYMax meet" className="-mb-2 block h-24 w-full" aria-hidden="true">
      {[
        ['fill-brand-600', 18, 62],
        ['fill-sky-500', 40, 56],
        ['fill-amber-400', 62, 64],
        ['fill-brand-700', 84, 58],
      ].map(([color, x, alto]) => (
        <g key={x}>
          <rect x={x} y={80 - alto} width="20" height={alto} rx="2" className={color} />
          <rect x={x + 5} y={80 - alto + 10} width="10" height="14" rx="1.5" className="fill-white/80" />
          <circle cx={x + 10} cy={80 - 12} r="3" className="fill-black/20" />
        </g>
      ))}
      <rect x="112" y="40" width="20" height="40" rx="2" transform="rotate(14 122 80)" className="fill-slate-400" />
      {/* Libro de minutas */}
      <rect x="200" y="66" width="70" height="14" rx="2" className="fill-brand-800" />
      <rect x="204" y="54" width="62" height="12" rx="2" className="fill-amber-200" />
      {/* Matera: hojas en abanico que salen del centro */}
      <g>
        {[
          [-58, 0.8, 'fill-brand-600'],
          [-30, 1, 'fill-brand-500'],
          [0, 1.15, 'fill-brand-600'],
          [30, 1, 'fill-brand-500'],
          [58, 0.8, 'fill-brand-400'],
        ].map(([giro, escala, color]) => (
          <g key={giro} transform={`translate(360 56) rotate(${giro}) scale(${escala})`}>
            <path d="M0 0 C-8 -10 -8 -28 0 -40 C8 -28 8 -10 0 0 Z" className={color} />
            <path d="M0 -4 V-34" strokeWidth="1.2" strokeLinecap="round" className="stroke-white/40" />
          </g>
        ))}
      </g>
      <rect x="340" y="52" width="40" height="8" rx="2" className="fill-[#b8935f]" />
      <path d="M343 60 h34 l-4 20 h-26 z" className="fill-[#c9a877]" />
    </svg>
  )
}

// Paquete en la estantería: caja con su rótulo de apartamento
function PaqueteEnRepisa({ paquete, onEntregar }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="flex flex-col items-center"
    >
      <IlustracionPaquete descripcion={paquete.descripcion} className="-mb-1 h-16 w-20" />
      <div className="w-full rounded-lg bg-white p-2.5 text-center shadow-[0_6px_14px_-8px_rgb(60_40_10/0.6)]">
        <p className="text-sm font-extrabold leading-tight text-slate-900">{paquete.apartamento.replace('Torre ', 'T').replace(' – Apto ', ' · ')}</p>
        <p className="truncate text-[11px] text-slate-500">{paquete.empresa}</p>
        <p className="truncate font-mono text-[10px] text-slate-400">
          {paquete.guia ?? `${fmtDia(paquete.fechaRecepcion)} · ${hora(paquete.fechaRecepcion)}`}
        </p>
        <button
          type="button"
          onClick={() => onEntregar(paquete)}
          className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white outline-none transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
        >
          <HandHelping className="size-3.5" /> Entregar
        </button>
      </div>
    </motion.li>
  )
}

PaqueteEnRepisa.propTypes = {
  paquete: PropTypes.shape({
    id: PropTypes.number.isRequired,
    apartamento: PropTypes.string.isRequired,
    empresa: PropTypes.string.isRequired,
    guia: PropTypes.string,
    descripcion: PropTypes.string,
    fechaRecepcion: PropTypes.string.isRequired,
  }).isRequired,
  onEntregar: PropTypes.func.isRequired,
}

// Pide el nombre de quien recibe; sugiere a los residentes del apartamento
function Entregar({ paquete, directorio, onClose, onEntregado }) {
  const residentes = directorio.filter((u) => u.rol === 'RESIDENTE' && u.detalle === paquete.apartamento)
  const [nombre, setNombre] = useState(residentes.length === 1 ? residentes[0].nombreCompleto : '')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const entregar = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('Escribe el nombre de quien recibe el paquete.')
      return
    }
    setGuardando(true)
    try {
      onEntregado(await porteriaApi.entregarPaquete(paquete.id, nombre.trim()))
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Entregar paquete"
      subtitle={`${paquete.apartamento} · ${paquete.empresa}`}
      icon={HandHelping}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-entrega" icon={PackageCheck} disabled={guardando}>
            {guardando ? 'Entregando…' : 'Confirmar entrega'}
          </Button>
        </>
      }
    >
      {paquete.fotoUrl && <ArchivoProtegido url={paquete.fotoUrl} alt="Foto del paquete" className="mb-4 h-40 w-full rounded-xl" />}
      <form id="form-entrega" onSubmit={entregar} noValidate>
        <Field
          label="¿Quién lo recibe?"
          htmlFor="entrega-nombre"
          required
          error={error}
          hint={residentes.length ? 'Elige a un residente del apartamento o escribe otro nombre.' : undefined}
        >
          <Input
            id="entrega-nombre"
            list="residentes-apto"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              setError('')
            }}
            placeholder="Nombre de quien recibe"
            autoFocus
          />
          <datalist id="residentes-apto">
            {residentes.map((r) => (
              <option key={r.id} value={r.nombreCompleto} />
            ))}
          </datalist>
        </Field>
      </form>
    </Modal>
  )
}

Entregar.propTypes = {
  paquete: PropTypes.object.isRequired,
  directorio: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onEntregado: PropTypes.func.isRequired,
}

export default function Paquetes() {
  const { datos, error, recargar } = useCarga(cargarTodo, 'port:paquetes')
  const [modal, setModal] = useState(false)
  const [entregando, setEntregando] = useState(null)
  const [ultimo, setUltimo] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const lista = datos?.paquetes ?? []
  const texto = busqueda.trim().toLowerCase()
  const coincide = (p) => !texto || [p.apartamento, p.guia, p.empresa].some((v) => v?.toLowerCase().includes(texto))
  const enEstante = lista.filter((p) => p.enPorteria && coincide(p))
  const entregados = lista.filter((p) => !p.enPorteria && coincide(p)).slice(0, MAX_ENTREGADOS)
  const totalEstante = lista.filter((p) => p.enPorteria).length

  // La estantería se arma en repisas de hasta 4 paquetes; siempre se ven al menos dos
  const repisas = Array.from({ length: Math.max(Math.ceil(enEstante.length / POR_REPISA), 2) }, (_, i) =>
    enEstante.slice(i * POR_REPISA, (i + 1) * POR_REPISA),
  )

  const registrado = (d) => {
    setUltimo(d)
    recargar()
  }

  const entregado = () => {
    setEntregando(null)
    recargar()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Paquetes</h1>
          <p className="mt-1 text-sm text-slate-500">Correspondencia recibida en portería</p>
        </div>
        <Button onClick={() => setModal(true)} icon={PackagePlus}>
          Registrar paquete
        </Button>
      </div>

      <AnimatePresence>
        {ultimo && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm ring-1 ring-brand-200"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
              <BellRing className="size-4" />
            </span>
            <p className="min-w-0 flex-1 text-slate-700">
              <span className="font-bold text-slate-900">
                {ultimo.empresa}
                {ultimo.guia && ` (${ultimo.guia})`}
              </span>{' '}
              quedó en la estantería para <span className="font-bold text-slate-900">{ultimo.apartamento}</span>. Se le avisó al residente.
            </p>
            <button
              type="button"
              onClick={() => setUltimo(null)}
              aria-label="Cerrar aviso"
              className="rounded-md p-1 text-slate-400 outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <label className="relative block sm:w-80">
        <span className="sr-only">Buscar por apartamento, guía o empresa</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar apto, guía o empresa…"
          className="w-full rounded-full bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-500"
        />
      </label>

      {error && (
        <div className={tarjeta}>
          <EmptyState
            icon={AlertCircle}
            title="No se pudieron cargar los paquetes"
            description={error}
            action={
              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                Intentar de nuevo
              </Button>
            }
          />
        </div>
      )}

      {!error && !datos && <div className={cn(tarjeta, 'h-80 animate-pulse')} role="status" aria-label="Cargando paquetes" />}

      {datos && (
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Estantería */}
          <motion.section {...aparecer(0)} className="lg:col-span-2">
            <div className="rounded-xl bg-[#a8875a] p-1 shadow-[0_18px_36px_-18px_rgb(15_23_42/0.45)]">
              <div className="rounded-lg bg-[#c9a877] p-2.5 sm:p-3">
                <div className="rounded-sm bg-[#efe3cf] shadow-[inset_0_2px_10px_rgb(0_0_0/0.15)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
                    <h2 className="rounded-md bg-white/85 px-3 py-1 text-sm font-bold text-slate-900 shadow-sm">Estantería de portería</h2>
                    <span className="rounded-md bg-brand-700 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">{totalEstante} por entregar</span>
                  </div>

                  {repisas.map((repisa, r) => (
                    <div key={r} className="px-3 pt-5 sm:px-4">
                      {repisa.length > 0 ? (
                        <ul className="grid grid-cols-2 gap-3 px-1 sm:grid-cols-4">
                          <AnimatePresence mode="popLayout">
                            {repisa.map((p) => (
                              <PaqueteEnRepisa key={p.id} paquete={p} onEntregar={setEntregando} />
                            ))}
                          </AnimatePresence>
                        </ul>
                      ) : r === 0 ? (
                        <p className="flex h-32 items-center justify-center text-center text-sm font-medium text-[#8a6a40]">
                          {texto ? 'Ningún paquete coincide con la búsqueda.' : 'La estantería está vacía. No hay paquetes por entregar.'}
                        </p>
                      ) : (
                        <DecoRepisa />
                      )}
                      {/* Tabla de la repisa */}
                      <div className="mt-2 h-3 rounded-sm bg-gradient-to-b from-[#b8935f] to-[#9c7a4c] shadow-[0_4px_6px_-2px_rgb(60_40_10/0.4)]" />
                    </div>
                  ))}
                  <div className="h-4" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Entregados */}
          <motion.section {...aparecer(1)} className={cn(tarjeta, 'p-5')}>
            <Titulo>Entregados</Titulo>
            {entregados.length > 0 ? (
              <ol className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-[17px] before:top-2 before:w-px before:bg-slate-200">
                <AnimatePresence initial={false}>
                  {entregados.map((p) => (
                    <motion.li key={p.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="relative flex items-center gap-3">
                      <span className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-success-bg text-success-strong ring-4 ring-white">
                        <PackageCheck className="size-4" strokeWidth={2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {p.apartamento} <span className="font-normal text-slate-500">· {p.empresa}</span>
                        </p>
                        <p className="truncate text-[11px] text-slate-400">Recibió {p.entregadoA}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-400 tabular-nums">
                        {fmtDia(p.fechaEntrega)} · {hora(p.fechaEntrega)}
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ol>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                {texto ? 'Ningún paquete entregado coincide con la búsqueda.' : 'Aquí aparecen los paquetes que entregues.'}
              </p>
            )}
          </motion.section>
        </div>
      )}

      <RegistrarPaquete open={modal} onClose={() => setModal(false)} onRegistrado={registrado} />
      {entregando && <Entregar paquete={entregando} directorio={datos.directorio} onClose={() => setEntregando(null)} onEntregado={entregado} />}
    </div>
  )
}
