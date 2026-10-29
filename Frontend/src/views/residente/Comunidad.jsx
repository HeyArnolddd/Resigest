import { motion } from 'motion/react'
import { Building2, Clock, MapPin, Phone, Shield, Siren, Wrench } from 'lucide-react'
import { Titulo } from '../../components/ui/Panel'
import CarteleraComunicados from '../../components/comunidad/CarteleraComunicados'
import Mensajeria from '../../components/comunidad/Mensajeria'
import { comunicados, contactosConjunto, eventosConjunto } from '../../data/mock'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

// Los mocks toman el 09/09/2026 como "hoy"; con la API será la fecha actual
const HOY = new Date('2026-09-09T00:00:00')
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

const faltan = (fecha) => {
  const dias = Math.round((new Date(`${fecha}T00:00:00`) - HOY) / 86400000)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
}

// Color de la hoja del calendario por tipo de evento
const tonoEvento = {
  mantenimiento: { cabeza: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700' },
  tramite: { cabeza: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  asamblea: { cabeza: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700' },
  evento: { cabeza: 'bg-brand-600', chip: 'bg-brand-50 text-brand-700' },
}

const iconoContacto = { porteria: Shield, administracion: Building2, mantenimiento: Wrench, emergencias: Siren }

export default function Comunidad() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Comunidad</h1>
        <p className="mt-1 text-sm text-slate-500">Comunicados, agenda, chat y mensajes privados</p>
      </div>

      <motion.div {...aparecer(0)}>
        <CarteleraComunicados comunicados={comunicados} />
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Chat comunitario y mensajes privados */}
        <motion.section {...aparecer(1)} className={cn(tarjeta, 'flex flex-col overflow-hidden lg:col-span-2')}>
          <Mensajeria />
        </motion.section>

        <div className="flex flex-col gap-5">
          {/* Agenda del conjunto */}
          <motion.section {...aparecer(2)} className={cn(tarjeta, 'p-5')}>
            <Titulo>Agenda del conjunto</Titulo>
            <ol className="relative mt-4 space-y-3 before:absolute before:bottom-6 before:left-[25px] before:top-6 before:w-px before:bg-slate-200">
              {eventosConjunto.map((e, i) => {
                const fecha = new Date(`${e.fecha}T00:00:00`)
                const tono = tonoEvento[e.tipo] ?? tonoEvento.evento
                return (
                  <li key={e.id} className="relative flex gap-3.5">
                    {/* Hoja de calendario */}
                    <span className="z-10 flex w-[52px] shrink-0 flex-col overflow-hidden rounded-lg bg-white text-center shadow-sm ring-1 ring-slate-200">
                      <span className={cn('py-0.5 text-[10px] font-bold uppercase tracking-wide text-white', tono.cabeza)}>
                        {MESES_CORTOS[fecha.getMonth()]}
                      </span>
                      <span className="pt-0.5 text-lg font-extrabold leading-tight text-slate-900 tabular-nums">{fecha.getDate()}</span>
                      <span className="pb-1 text-[10px] font-medium capitalize text-slate-400">{DIAS_CORTOS[fecha.getDay()]}</span>
                    </span>
                    <div className={cn('min-w-0 flex-1 rounded-xl px-3 py-2', i === 0 && 'bg-brand-50/60 ring-1 ring-brand-100')}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-slate-800">{e.titulo}</p>
                        <span className={cn('shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold', tono.chip)}>
                          {faltan(e.fecha)}
                        </span>
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" /> {e.hora}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" /> {e.lugar}
                        </span>
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </motion.section>

          {/* Directorio */}
          <motion.section {...aparecer(3)} className={cn(tarjeta, 'p-5')}>
            <Titulo>Contactos del conjunto</Titulo>
            <ul className="mt-3 divide-y divide-slate-100">
              {contactosConjunto.map((c) => {
                const Icono = iconoContacto[c.id] ?? Phone
                const urgente = c.id === 'emergencias'
                return (
                  <li key={c.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg',
                        urgente ? 'bg-danger-bg text-danger-strong' : 'bg-brand-50 text-brand-700',
                      )}
                    >
                      <Icono className="size-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">{c.nombre}</p>
                      <p className="truncate text-xs text-slate-500">{c.horario}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 whitespace-nowrap text-xs font-semibold tabular-nums',
                        urgente ? 'text-danger-strong' : 'text-slate-600',
                      )}
                    >
                      {c.telefono}
                    </span>
                  </li>
                )
              })}
            </ul>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
