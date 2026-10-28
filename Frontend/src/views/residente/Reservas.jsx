import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarCheck, CalendarRange, Check, Clock, Users, X } from 'lucide-react'
import { Button, Card, CardHeader, EmptyState, Modal, PageHeader, StatusBadge } from '../../components/ui'
import IlustracionZona from '../../components/reservas/IlustracionZona'
import { estadoReserva } from '../../lib/labels'
import { cn } from '../../lib/utils'
import { colorZona } from '../../lib/zonas'
import { reservasAgenda, zonas } from '../../data/mock'

// Usuario en sesión (mock): Juan Pérez, Torre 2 · 304
const YO = { nombre: 'Juan Pérez', apartamentoId: 12, apartamento: 'Torre 2 · 304' }
const DIAS_A_MOSTRAR = 14
const OCUPAN = ['APROBADA', 'PENDIENTE']

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const claveDia = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fechaLarga = (d) => `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
const deClave = (clave) => {
  const [y, m, d] = clave.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const partesFranja = (franja) => franja.split('-')
const duracion = (franja) => {
  const [a, b] = partesFranja(franja).map((h) => {
    const [hh, mm] = h.split(':').map(Number)
    return hh + mm / 60
  })
  const horas = b - a
  return `${String(horas).replace('.5', ',5')} ${horas === 1 ? 'hora' : 'horas'}`
}

function estadoFranja(lista, zonaId, dia, franja, ahora) {
  const [ini, fin] = partesFranja(franja)
  const desde = `${dia}T${ini}:00`
  const hasta = `${dia}T${fin}:00`
  if (new Date(desde) <= ahora) return 'pasada'
  const cruce = lista.some(
    (r) =>
      r.zonaComunId === zonaId &&
      OCUPAN.includes(r.estado) &&
      r.fechaInicio < hasta &&
      r.fechaFin > desde,
  )
  return cruce ? 'ocupada' : 'libre'
}

function Paso({ numero, titulo, ayuda, activo = true, children }) {
  return (
    <section className={cn('transition-opacity', !activo && 'pointer-events-none opacity-40')} aria-disabled={!activo}>
      <div className="mb-3 flex items-center gap-3">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            activo ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500',
          )}
        >
          {numero}
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">{titulo}</h2>
          {ayuda && <p className="text-xs text-slate-500">{ayuda}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function TarjetaZona({ zona, seleccionada, onElegir }) {
  const color = colorZona(zona.id)
  return (
    <button
      type="button"
      aria-pressed={seleccionada}
      onClick={() => onElegir(zona.id)}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-white text-left outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        seleccionada ? cn('border-transparent ring-2', color.anillo) : 'border-slate-200',
      )}
    >
      <div className="aspect-[16/10] overflow-hidden">
        <IlustracionZona nombre={zona.nombre} className="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <AnimatePresence>
        {seleccionada && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className={cn('absolute right-3 top-3 flex size-7 items-center justify-center rounded-full shadow-card', color.solido)}
          >
            <Check className="size-4" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
      <div className="p-4">
        <p className={cn('font-bold', seleccionada ? color.texto : 'text-slate-900')}>{zona.nombre}</p>
        <p className="mt-0.5 text-xs text-slate-500">{zona.descripcion}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Users className="size-3.5" />
          Hasta {zona.capacidad} personas
        </p>
      </div>
    </button>
  )
}

function Fila({ etiqueta, valor }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
      <span className="text-slate-500">{etiqueta}</span>
      {valor ? (
        <span className="text-right font-semibold text-slate-900">{valor}</span>
      ) : (
        <span className="text-slate-400">Sin elegir</span>
      )}
    </div>
  )
}

export default function Reservas() {
  const [ahora] = useState(() => new Date())
  const [lista, setLista] = useState(reservasAgenda)
  const [zonaId, setZonaId] = useState(null)
  const [dia, setDia] = useState(null)
  const [franja, setFranja] = useState(null)
  const [enviada, setEnviada] = useState(null)
  const [aCancelar, setACancelar] = useState(null)

  const zona = zonas.find((z) => z.id === zonaId)
  const dias = Array.from({ length: DIAS_A_MOSTRAR }, (_, i) =>
    claveDia(new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i)),
  )
  const libresEn = (d) => zona.franjas.filter((f) => estadoFranja(lista, zona.id, d, f, ahora) === 'libre').length

  const elegirZona = (id) => {
    setZonaId(id)
    setFranja(null)
    setEnviada(null)
  }
  const elegirDia = (d) => {
    setDia(d)
    setFranja(null)
    setEnviada(null)
  }

  const solicitar = () => {
    const [ini, fin] = partesFranja(franja)
    const nueva = {
      id: Math.max(...lista.map((r) => r.id)) + 1,
      zonaComunId: zona.id,
      zonaComunNombre: zona.nombre,
      apartamentoId: YO.apartamentoId,
      fechaInicio: `${dia}T${ini}:00`,
      fechaFin: `${dia}T${fin}:00`,
      estado: 'PENDIENTE',
      residente: YO.nombre,
      apartamento: YO.apartamento,
    }
    setLista([...lista, nueva])
    setEnviada(nueva)
    setFranja(null)
  }

  const nuevaReserva = () => {
    setEnviada(null)
    setZonaId(null)
    setDia(null)
  }

  const cancelar = () => {
    setLista(lista.map((r) => (r.id === aCancelar.id ? { ...r, estado: 'CANCELADA' } : r)))
    setACancelar(null)
  }

  const mias = lista
    .filter((r) => r.apartamentoId === YO.apartamentoId && new Date(r.fechaFin) >= ahora)
    .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio))

  return (
    <div>
      <PageHeader
        title="Reservar zona común"
        subtitle="Elige la zona, el día y el horario. La administración aprobará tu solicitud."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <Paso numero={1} titulo="¿Qué zona quieres usar?">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zonas.map((z) => (
                <TarjetaZona key={z.id} zona={z} seleccionada={z.id === zonaId} onElegir={elegirZona} />
              ))}
            </div>
          </Paso>

          <Paso
            numero={2}
            titulo="Elige el día"
            ayuda={zona ? `Disponibilidad de ${zona.nombre} en las próximas dos semanas` : 'Primero elige una zona'}
            activo={Boolean(zona)}
          >
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
              {dias.map((d) => {
                const fecha = deClave(d)
                const libres = zona ? libresEn(d) : null
                const sel = d === dia
                const lleno = libres === 0
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={lleno}
                    aria-pressed={sel}
                    onClick={() => elegirDia(d)}
                    className={cn(
                      'flex w-[4.5rem] shrink-0 flex-col items-center rounded-lg border px-2 py-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                      sel
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50',
                      lleno && 'bg-slate-50 text-slate-400',
                    )}
                  >
                    <span className={cn('text-xs font-medium', sel ? 'text-brand-100' : 'text-slate-500')}>
                      {d === dias[0] ? 'Hoy' : DIAS[fecha.getDay()].slice(0, 3)}
                    </span>
                    <span className="text-xl font-bold leading-tight">{fecha.getDate()}</span>
                    <span className={cn('text-2xs', sel ? 'text-brand-100' : 'text-slate-500')}>
                      {MESES[fecha.getMonth()].slice(0, 3)}
                    </span>
                    {zona && (
                      <span
                        className={cn(
                          'mt-1.5 text-2xs font-semibold',
                          sel ? 'text-white' : lleno ? 'text-slate-400' : 'text-brand-700',
                        )}
                      >
                        {lleno ? 'Sin cupo' : `${libres} ${libres === 1 ? 'libre' : 'libres'}`}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Paso>

          <Paso
            numero={3}
            titulo="Elige el horario"
            ayuda={dia ? fechaLarga(deClave(dia)) : 'Primero elige un día'}
            activo={Boolean(zona && dia)}
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(zona && dia ? zona.franjas : ['', '', '']).map((f, i) => {
                if (!f) return <div key={i} className="h-16 rounded-lg border border-dashed border-slate-200" />
                const estado = estadoFranja(lista, zona.id, dia, f, ahora)
                const sel = f === franja
                const [ini, fin] = partesFranja(f)
                return (
                  <button
                    key={f}
                    type="button"
                    disabled={estado !== 'libre'}
                    aria-pressed={sel}
                    onClick={() => setFranja(f)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                      sel
                        ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50',
                      estado !== 'libre' && 'border-slate-200 bg-slate-50 hover:bg-slate-50',
                    )}
                  >
                    <Clock className={cn('size-4 shrink-0', sel ? 'text-brand-600' : 'text-slate-400')} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block text-sm font-semibold',
                          estado === 'libre' ? 'text-slate-900' : 'text-slate-400 line-through',
                        )}
                      >
                        {ini} – {fin}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {estado === 'libre' ? duracion(f) : estado === 'ocupada' ? 'Ya está reservado' : 'Este horario ya pasó'}
                      </span>
                    </span>
                    {sel && <Check className="size-4 text-brand-600" strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          </Paso>
        </div>

        <aside className="xl:sticky xl:top-0 xl:self-start">
          <Card className="overflow-hidden">
            <div className="aspect-[16/9] border-b border-slate-200">
              {zona ? (
                <IlustracionZona key={zona.id} nombre={zona.nombre} />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
                  <CalendarRange className="size-8" strokeWidth={1.5} />
                  <span className="text-xs font-medium">Elige una zona para empezar</span>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {enviada ? (
                <motion.div
                  key="enviada"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 text-center"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
                    className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-600 text-white"
                  >
                    <Check className="size-6" strokeWidth={3} />
                  </motion.span>
                  <p className="mt-3 text-lg font-bold text-slate-900">Solicitud enviada</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {enviada.zonaComunNombre} · {fechaLarga(new Date(enviada.fechaInicio))},{' '}
                    {enviada.fechaInicio.slice(11, 16)} – {enviada.fechaFin.slice(11, 16)}
                  </p>
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    Te avisaremos cuando la administración la apruebe.
                  </p>
                  <Button variant="secondary" className="mt-4 w-full" onClick={nuevaReserva}>
                    Hacer otra reserva
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="resumen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
                  <h2 className="text-sm font-bold text-slate-900">Tu reserva</h2>
                  <div className="mt-2 divide-y divide-slate-100">
                    <Fila etiqueta="Zona" valor={zona?.nombre} />
                    <Fila etiqueta="Día" valor={dia && fechaLarga(deClave(dia))} />
                    <Fila etiqueta="Horario" valor={franja?.replace('-', ' – ')} />
                  </div>
                  <Button
                    className="mt-4 w-full"
                    size="lg"
                    icon={CalendarCheck}
                    disabled={!(zona && dia && franja)}
                    onClick={solicitar}
                  >
                    Solicitar reserva
                  </Button>
                  <p className="mt-3 text-center text-xs text-slate-500">
                    {!zona
                      ? 'Elige una zona, un día y un horario.'
                      : !dia
                        ? 'Ahora elige el día.'
                        : !franja
                          ? 'Solo falta el horario.'
                          : 'Quedará pendiente hasta que la administración la apruebe.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </aside>
      </div>

      <Card className="mt-8">
        <CardHeader title="Mis próximas reservas" subtitle={`${YO.apartamento}`} />
        {mias.length ? (
          <ul className="divide-y divide-slate-100 px-5 pb-2 pt-2">
            {mias.map((r) => {
              const est = estadoReserva[r.estado]
              const cancelable = OCUPAN.includes(r.estado)
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                  <span className={cn('h-10 w-1.5 shrink-0 rounded-full', colorZona(r.zonaComunId).punto)} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{r.zonaComunNombre}</p>
                    <p className="text-xs text-slate-500">
                      {fechaLarga(new Date(r.fechaInicio))} · {r.fechaInicio.slice(11, 16)} – {r.fechaFin.slice(11, 16)}
                    </p>
                  </div>
                  <StatusBadge status={est.label} tone={est.tone} />
                  {cancelable && (
                    <Button size="sm" variant="ghost" icon={X} onClick={() => setACancelar(r)}>
                      Cancelar
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={CalendarRange}
              title="No tienes reservas próximas"
              description="Cuando solicites una zona común aparecerá aquí."
            />
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(aCancelar)}
        onClose={() => setACancelar(null)}
        title="Cancelar reserva"
        subtitle={
          aCancelar
            ? `${aCancelar.zonaComunNombre} · ${fechaLarga(new Date(aCancelar.fechaInicio))}, ${aCancelar.fechaInicio.slice(11, 16)}`
            : ''
        }
        icon={X}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setACancelar(null)}>
              Conservar reserva
            </Button>
            <Button variant="danger" onClick={cancelar}>
              Cancelar reserva
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">El horario quedará libre para otros residentes.</p>
      </Modal>
    </div>
  )
}
