import { motion } from 'motion/react'
import { Building2, Phone, Shield, Siren, Wrench } from 'lucide-react'
import { Titulo } from '../../components/ui/Panel'
import AgendaEventos from '../../components/comunidad/AgendaEventos'
import CarteleraComunicados from '../../components/comunidad/CarteleraComunicados'
import Mensajeria from '../../components/comunidad/Mensajeria'
import { aparecer, tarjeta } from '../../lib/panel'
import { fmtFechaLarga, residenteApi } from '../../lib/residente'
import { useCarga } from '../../lib/useCarga'
import { cn } from '../../lib/utils'

const iconoRol = { PORTERO: Shield, ADMINISTRADOR: Building2, MANTENIMIENTO: Wrench }
const ORDEN = ['PORTERO', 'ADMINISTRADOR', 'MANTENIMIENTO']

// Cada sección se carga por separado: lo que llega primero se muestra primero
const cargarComunicados = () =>
  residenteApi.comunicados().then((lista) =>
    [...lista]
      .sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion))
      .map((c) => ({ id: c.id, titulo: c.titulo, contenido: c.cuerpo, fecha: fmtFechaLarga(c.fechaPublicacion), autor: c.autorNombre })),
  )
// Personal y administración con su teléfono (el de los residentes es privado)
const cargarContactos = () =>
  residenteApi.directorio().then((d) => d.filter((u) => u.rol !== 'RESIDENTE').sort((a, b) => ORDEN.indexOf(a.rol) - ORDEN.indexOf(b.rol)))

// Hojas de calendario y filas en gris mientras cargan, con la misma forma que el contenido real
function AgendaCargando() {
  return (
    <ol className="space-y-3" role="status" aria-label="Cargando agenda">
      {[0, 1].map((i) => (
        <li key={i} className="flex gap-3.5">
          <span className="flex w-[52px] shrink-0 flex-col overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
            <span className="h-4 animate-pulse bg-slate-200" />
            <span className="mx-auto my-1.5 h-5 w-6 animate-pulse rounded bg-slate-100" />
          </span>
          <span className="flex-1 space-y-2 py-1">
            <span className="block h-3 w-3/4 animate-pulse rounded bg-slate-100" />
            <span className="block h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />
          </span>
        </li>
      ))}
    </ol>
  )
}

function ContactosCargando() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex items-center gap-3 py-2.5" aria-hidden="true">
          <span className="size-9 shrink-0 animate-pulse rounded-lg bg-brand-50" />
          <span className="flex-1 space-y-1.5">
            <span className="block h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            <span className="block h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
          </span>
          <span className="h-3 w-16 animate-pulse rounded bg-slate-100" />
        </li>
      ))}
    </>
  )
}

export default function Comunidad() {
  const { datos: comunicados } = useCarga(cargarComunicados, 'comunidad:comunicados')
  const { datos: eventos } = useCarga(residenteApi.eventos, 'comunidad:eventos')
  const { datos: contactos } = useCarga(cargarContactos, 'comunidad:contactos')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Comunidad</h1>
        <p className="mt-1 text-sm text-slate-500">Comunicados, agenda, chat comunitario, mensajes privados y contactos del conjunto</p>
      </div>

      <motion.div {...aparecer(0)}>
        <CarteleraComunicados comunicados={comunicados ?? []} cargando={!comunicados} />
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
            <div className="mt-4">
              {!eventos ? (
                <AgendaCargando />
              ) : eventos.length ? (
                <AgendaEventos eventos={eventos.slice(0, 5)} />
              ) : (
                <p className="rounded-xl bg-slate-50 px-4 py-5 text-center text-xs text-slate-500">
                  No hay eventos próximos. La administración publicará aquí asambleas, mantenimientos y actividades.
                </p>
              )}
            </div>
          </motion.section>

          {/* Directorio */}
          <motion.section {...aparecer(3)} className={cn(tarjeta, 'p-5')}>
            <Titulo>Contactos del conjunto</Titulo>
            <ul className="mt-3 divide-y divide-slate-100" aria-busy={!contactos}>
              {!contactos && <ContactosCargando />}
              {contactos?.map((c) => {
                const Icono = iconoRol[c.rol] ?? Phone
                return (
                  <li key={c.id} className="flex items-center gap-3 py-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <Icono className="size-4" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{c.nombreCompleto}</p>
                      <p className="truncate text-xs text-slate-500">{c.detalle}</p>
                    </div>
                    {c.telefono ? (
                      <a
                        href={`tel:${c.telefono.replace(/\s/g, '')}`}
                        className="shrink-0 whitespace-nowrap rounded text-xs font-semibold text-slate-600 tabular-nums outline-none hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {c.telefono}
                      </a>
                    ) : (
                      <span className="shrink-0 text-[11px] text-slate-400">Sin teléfono</span>
                    )}
                  </li>
                )
              })}
              {/* La línea de emergencias no depende del API: se ve desde el primer momento */}
              <li className="flex items-center gap-3 py-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger-bg text-danger-strong">
                  <Siren className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">Emergencias</p>
                  <p className="truncate text-xs text-slate-500">Policía, bomberos y ambulancia</p>
                </div>
                <a href="tel:123" className="shrink-0 rounded text-xs font-semibold text-danger-strong tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-danger">
                  123
                </a>
              </li>
            </ul>
          </motion.section>
        </div>
      </div>
    </div>
  )
}
