import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { ArrowRight, Clock } from 'lucide-react'
import { Titulo, VerMas } from '../../components/ui/Panel'
import EscenaPorteria from '../../components/porteria/EscenaPorteria'
import IlustracionPaquete from '../../components/paquetes/IlustracionPaquete'
import { actividadPorteria, ingresos, paquetesPorteria } from '../../data/mock'
import { aparecer, tarjeta } from '../../lib/panel'
import { estiloTipo } from '../../lib/porteria'
import { useAhora } from '../../lib/useAhora'
import { cn, saludo } from '../../lib/utils'
import RegistrarVisitante from './RegistrarVisitante'
import RegistrarPaquete from './RegistrarPaquete'

// Gafete de visitante para la tarjeta de "Registrar visitante"
function Gafete() {
  return (
    <svg viewBox="0 0 120 104" className="ilus h-full w-full" aria-hidden="true">
      <ellipse cx="60" cy="96" rx="40" ry="4" className="fill-slate-900/10" />
      <path d="M48 4 L60 22 L72 4" strokeWidth="4" strokeLinecap="round" className="fill-none stroke-brand-500" />
      <g className="origin-top [animation:ilus-pendulo_4s_ease-in-out_infinite]">
        <rect x="32" y="20" width="56" height="72" rx="6" className="fill-white stroke-slate-200" strokeWidth="1.5" />
        <rect x="32" y="20" width="56" height="16" rx="6" className="fill-brand-600" />
        <rect x="52" y="25" width="16" height="4" rx="2" className="fill-brand-800" />
        <circle cx="60" cy="52" r="9" className="fill-amber-200" />
        <path d="M46 72 C46 60 74 60 74 72 Z" className="fill-brand-200" />
        <rect x="42" y="78" width="36" height="4" rx="2" className="fill-slate-200" />
        <rect x="48" y="85" width="24" height="3" rx="1.5" className="fill-slate-100" />
      </g>
    </svg>
  )
}

function Accion({ titulo, texto, ilustracion, dato, onClick, indice }) {
  return (
    <motion.button
      type="button"
      {...aparecer(indice)}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        tarjeta,
        'group flex items-center gap-4 p-4 text-left outline-none transition-shadow hover:shadow-[0_1px_2px_rgb(15_23_42/0.04),0_18px_36px_-16px_rgb(0_101_43/0.35)] focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-5',
      )}
    >
      <span className="flex size-20 shrink-0 items-end justify-center rounded-xl bg-brand-50 p-1.5 transition-transform group-hover:-translate-y-0.5 sm:size-24">
        {ilustracion}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-slate-900 sm:text-lg">{titulo}</span>
        <span className="mt-0.5 block text-sm text-slate-500">{texto}</span>
        {dato && <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{dato}</span>}
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-600/25 transition-transform group-hover:translate-x-0.5">
        <ArrowRight className="size-5" />
      </span>
    </motion.button>
  )
}

Accion.propTypes = {
  titulo: PropTypes.string.isRequired,
  texto: PropTypes.string.isRequired,
  ilustracion: PropTypes.node.isRequired,
  dato: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  indice: PropTypes.number.isRequired,
}

export default function Inicio({ onNavigate }) {
  const [modalVisitante, setModalVisitante] = useState(false)
  const [modalPaquete, setModalPaquete] = useState(false)
  const [ingresosLista, setIngresosLista] = useState(ingresos)
  const [paquetesLista, setPaquetesLista] = useState(paquetesPorteria)
  const ahora = useAhora()

  const enPorteria = ingresosLista.filter((i) => i.estado === 'En portería').length
  const porEntregar = paquetesLista.filter((p) => p.estado === 'Ha llegado')
  const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
  const fecha = ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  const indicadores = [
    ['En portería ahora', enPorteria, 'bg-warning'],
    ['Ingresos hoy', ingresosLista.length, 'bg-brand-500'],
    ['Paquetes por entregar', porEntregar.length, 'bg-violet-500'],
  ]

  return (
    <div className="space-y-5">
      {/* Bienvenida del turno */}
      <motion.section {...aparecer(0)} className={cn(tarjeta, 'grid overflow-hidden md:grid-cols-[1fr_minmax(0,380px)]')}>
        <div className="p-6">
          <p className="text-sm font-semibold text-brand-700 first-letter:uppercase">{fecha}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{saludo(ahora)}, Daniel</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Clock className="size-4" /> Turno mañana · Portería principal ·{' '}
            <span className="font-semibold text-slate-700 tabular-nums">{hora}</span>
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-3">
            {indicadores.map(([etiqueta, valor, punto]) => (
              <div key={etiqueta} className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
                <dd className="text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{valor}</dd>
                <dt className="mt-0.5 flex items-start gap-1.5 text-[11px] font-medium leading-tight text-slate-500 sm:text-xs">
                  <span className={cn('mt-1 size-2 shrink-0 rounded-full', punto)} />
                  {etiqueta}
                </dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="hidden items-end bg-gradient-to-b from-brand-50/40 to-brand-50 md:flex">
          <EscenaPorteria className="h-48 w-full" />
        </div>
      </motion.section>

      {/* Acciones rápidas */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Accion
          indice={1}
          titulo="Registrar visitante"
          texto="Ingreso de una persona, domicilio o servicio"
          ilustracion={<Gafete />}
          dato={enPorteria ? `${enPorteria} esperando en portería` : undefined}
          onClick={() => setModalVisitante(true)}
        />
        <Accion
          indice={2}
          titulo="Registrar paquete"
          texto="Recibe la correspondencia y avisa al residente"
          ilustracion={<IlustracionPaquete descripcion="Caja grande" className="h-full w-full" />}
          dato={porEntregar.length ? `${porEntregar.length} en la estantería` : undefined}
          onClick={() => setModalPaquete(true)}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Ingresos recientes */}
        <motion.section {...aparecer(3)} className={cn(tarjeta, 'p-5')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('visitantes')}>Ver todos</VerMas>}>Ingresos recientes</Titulo>
          <ul className="mt-3 divide-y divide-slate-100">
            {ingresosLista.slice(0, 5).map((i) => {
              const tipo = estiloTipo(i.tipo)
              const Icono = tipo.icono
              return (
                <li key={i.id} className="flex items-center gap-3 py-2.5">
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg ring-1', tipo.icon)}>
                    <Icono className="size-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{i.persona}</p>
                    <p className="text-xs text-slate-500">
                      {i.apartamento} · {i.hora}
                    </p>
                  </div>
                  {i.estado === 'En portería' && (
                    <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-warning-strong">
                      <span className="relative flex size-2">
                        <span className="absolute inset-0 animate-ping rounded-full bg-warning/60" />
                        <span className="relative size-2 rounded-full bg-warning" />
                      </span>
                      Esperando
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </motion.section>

        {/* Paquetes por entregar */}
        <motion.section {...aparecer(4)} className={cn(tarjeta, 'p-5')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('paquetes')}>Estantería</VerMas>}>Por entregar</Titulo>
          {porEntregar.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {porEntregar.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-amber-50/60 p-2.5 ring-1 ring-amber-100">
                  <span className="flex size-11 shrink-0 items-end justify-center rounded-lg bg-white p-1 ring-1 ring-amber-100">
                    <IlustracionPaquete descripcion={p.descripcion ?? 'Paquete mediano'} className="w-full" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{p.apartamento}</p>
                    <p className="truncate text-xs text-slate-500">
                      {p.empresa} · <span className="font-mono">{p.guia}</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">{p.fecha.split(' · ')[1]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-success-bg px-3 py-3 text-xs font-medium text-success-strong">
              La estantería está vacía. Todos los paquetes fueron entregados.
            </p>
          )}
        </motion.section>

        {/* Actividad de la jornada */}
        <motion.section {...aparecer(5)} className={cn(tarjeta, 'p-5')}>
          <Titulo accion={<VerMas onClick={() => onNavigate('bitacora')}>Bitácora</VerMas>}>Actividad de la jornada</Titulo>
          <ol className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-slate-200">
            {actividadPorteria.map((a) => {
              const tipo = estiloTipo(a.tipo)
              const Icono = tipo.icono
              return (
                <li key={`${a.hora}-${a.accion}`} className="relative flex gap-3">
                  <span className={cn('z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white', tipo.icon)}>
                    <Icono className="size-3.5" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline justify-between gap-2 text-sm font-semibold text-slate-800">
                      {a.accion}
                      <span className="shrink-0 text-[11px] font-medium text-slate-400 tabular-nums">{a.hora}</span>
                    </p>
                    <p className="truncate text-xs text-slate-500">{a.detalle}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </motion.section>
      </div>

      <RegistrarVisitante
        open={modalVisitante}
        onClose={() => setModalVisitante(false)}
        onRegistrado={(d) => setIngresosLista((l) => [{ ...d, id: Date.now() }, ...l])}
      />
      <RegistrarPaquete
        open={modalPaquete}
        onClose={() => setModalPaquete(false)}
        onRegistrado={(d) => setPaquetesLista((l) => [d, ...l])}
      />
    </div>
  )
}

Inicio.propTypes = { onNavigate: PropTypes.func.isRequired }
