import { useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Building2, Clock, LogOut, Plus, RotateCcw, Search, UserRoundCheck } from 'lucide-react'
import { Avatar, Button, EmptyState } from '../../components/ui'
import { aparecer, tarjeta } from '../../lib/panel'
import { esDeHoy, estiloTipo, hora, ingresosDelDia, porteriaApi } from '../../lib/porteria'
import { useCarga } from '../../lib/useCarga'
import { cn } from '../../lib/utils'
import RegistrarVisitante from './RegistrarVisitante'

const FILTROS = ['Todos', 'Visitante', 'Domicilio', 'Servicio']
const plural = { Visitante: 'Visitantes', Domicilio: 'Domicilios', Servicio: 'Servicios' }

// Cada ingreso como un gafete de visitante colgado de su cinta
function GafeteVisitante({ ingreso, onSalida, ocupado }) {
  const tipo = estiloTipo(ingreso.tipo)
  const Icono = tipo.icono

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(tarjeta, 'relative flex flex-col overflow-hidden', ingreso.dentro && 'ring-2 ring-amber-300')}
    >
      <div className={cn('relative flex h-11 items-center justify-between px-4', tipo.banda)}>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold">
          <Icono className="size-3.5" strokeWidth={2.2} />
          {ingreso.tipo}
          {ingreso.empresa && <span className="font-semibold opacity-80">· {ingreso.empresa}</span>}
        </span>
        {/* Ranura de la cinta */}
        <span className="absolute left-1/2 top-3 h-2 w-10 -translate-x-1/2 rounded-full bg-black/25" />
        <span className="font-mono text-[11px] font-semibold opacity-75">#{String(ingreso.id).padStart(3, '0')}</span>
      </div>

      <div className="flex items-center gap-3.5 p-4">
        <Avatar nombre={ingreso.persona} size="lg" className="size-12 text-base" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-slate-900">{ingreso.persona}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5" /> {ingreso.apartamento}
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="size-3.5" /> {esDeHoy(ingreso.fechaIngreso) ? ingreso.hora : `${new Date(ingreso.fechaIngreso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · ${ingreso.hora}`}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-dashed border-slate-200 px-4 py-3">
        {ingreso.dentro ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-warning-strong">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-warning/60" />
                <span className="relative size-2 rounded-full bg-warning" />
              </span>
              Dentro del conjunto
            </span>
            <Button size="sm" variant="secondary" icon={LogOut} disabled={ocupado} onClick={() => onSalida(ingreso)}>
              Registrar salida
            </Button>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-success-strong">
            <span className="size-2 rounded-full bg-success" />
            Salió a las {hora(ingreso.fechaSalida)}
          </span>
        )}
      </div>
    </motion.article>
  )
}

GafeteVisitante.propTypes = {
  ingreso: PropTypes.shape({
    id: PropTypes.number.isRequired,
    persona: PropTypes.string.isRequired,
    apartamento: PropTypes.string.isRequired,
    hora: PropTypes.string.isRequired,
    tipo: PropTypes.string.isRequired,
    empresa: PropTypes.string,
    dentro: PropTypes.bool.isRequired,
    fechaIngreso: PropTypes.string.isRequired,
    fechaSalida: PropTypes.string,
  }).isRequired,
  onSalida: PropTypes.func.isRequired,
  ocupado: PropTypes.bool,
}

export default function Visitantes() {
  const { datos: lista, error, recargar } = useCarga(ingresosDelDia)
  const [modal, setModal] = useState(false)
  const [filtro, setFiltro] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [errorSalida, setErrorSalida] = useState('')

  const registros = lista ?? []
  const texto = busqueda.trim().toLowerCase()
  const visibles = registros.filter(
    (i) => (filtro === 'Todos' || i.tipo === filtro) && (!texto || i.persona.toLowerCase().includes(texto) || i.apartamento.toLowerCase().includes(texto)),
  )
  const deHoy = registros.filter((i) => esDeHoy(i.fechaIngreso))
  const contar = (t) => deHoy.filter((i) => i.tipo === t).length
  const dentro = registros.filter((i) => i.dentro).length

  const registrarSalida = async (ingreso) => {
    setOcupado(true)
    setErrorSalida('')
    try {
      await porteriaApi.registrarSalida(ingreso.id)
      recargar()
    } catch (e) {
      setErrorSalida(e.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visitantes</h1>
          <p className="mt-1 text-sm text-slate-500">Ingresos de hoy y quienes siguen dentro del conjunto</p>
        </div>
        <Button onClick={() => setModal(true)} icon={Plus}>
          Registrar visitante
        </Button>
      </div>

      {/* Resumen */}
      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4')}>
        <p className="text-sm font-bold text-slate-900">{deHoy.length === 1 ? '1 ingreso hoy' : `${deHoy.length} ingresos hoy`}</p>
        {FILTROS.slice(1).map((t) => (
          <p key={t} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={cn('size-2.5 rounded-full', estiloTipo(t).punto)} />
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">{contar(t)}</span>
            {plural[t]}
          </p>
        ))}
        {dentro > 0 && (
          <p className="flex items-center gap-2 rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning-strong sm:ml-auto">
            {dentro === 1 ? '1 persona dentro del conjunto' : `${dentro} personas dentro del conjunto`}
          </p>
        )}
      </motion.div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrar por tipo">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filtro === f}
              onClick={() => setFiltro(f)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                filtro === f ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <label className="relative w-full sm:ml-auto sm:w-64">
          <span className="sr-only">Buscar por nombre o apartamento</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar nombre o apto…"
            className="w-full rounded-full bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </label>
      </div>

      {errorSalida && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger-strong">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {errorSalida}
        </p>
      )}

      {error ? (
        <div className={tarjeta}>
          <EmptyState
            icon={AlertCircle}
            title="No se pudieron cargar los ingresos"
            description={error}
            action={
              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                Intentar de nuevo
              </Button>
            }
          />
        </div>
      ) : !lista ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Cargando ingresos">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn(tarjeta, 'h-40 animate-pulse')} />
          ))}
        </div>
      ) : visibles.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibles.map((i) => (
              <GafeteVisitante key={i.id} ingreso={i} onSalida={registrarSalida} ocupado={ocupado} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className={cn(tarjeta, 'flex flex-col items-center gap-2 px-6 py-12 text-center')}>
          <UserRoundCheck className="size-8 text-slate-300" />
          <p className="text-sm font-bold text-slate-900">{registros.length ? 'Sin ingresos con este filtro' : 'Todavía no hay ingresos hoy'}</p>
          <p className="text-xs text-slate-500">
            {registros.length ? 'Cambia el filtro o la búsqueda para ver otros registros.' : 'Cuando registres a un visitante, domicilio o técnico aparecerá aquí.'}
          </p>
        </div>
      )}

      <RegistrarVisitante open={modal} onClose={() => setModal(false)} onRegistrado={recargar} />
    </div>
  )
}
