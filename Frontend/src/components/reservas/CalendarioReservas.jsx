import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'
import { colorZona } from '../../lib/zonas'
import { Button, IconButton } from '../ui'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const VISTAS = [
  { key: 'mes', label: 'Mes' },
  { key: 'semana', label: 'Semana' },
  { key: 'dia', label: 'Día' },
]

// Franja visible en las vistas por horas
const HORA_INICIO = 6
const HORA_FIN = 23
const ALTO_HORA = 48
const CHIPS_POR_DIA = 3

// Solo se agenda lo que ocupa la zona
const ESTADOS_VISIBLES = ['APROBADA', 'PENDIENTE']

const claveDia = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const sumarDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const inicioSemana = (d) => sumarDias(d, -((d.getDay() + 6) % 7))
const diaSemana = (d) => (d.getDay() + 6) % 7
const horaDecimal = (d) => d.getHours() + d.getMinutes() / 60
const fmtHora = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

function tituloPeriodo(vista, fecha) {
  if (vista === 'mes') return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`
  if (vista === 'dia') {
    return `${DIAS[diaSemana(fecha)]} ${fecha.getDate()} de ${MESES[fecha.getMonth()].toLowerCase()}`
  }
  const ini = inicioSemana(fecha)
  const fin = sumarDias(ini, 6)
  const mesIni = ini.getMonth() === fin.getMonth() ? '' : ` ${MESES_CORTOS[ini.getMonth()]}`
  return `${ini.getDate()}${mesIni} – ${fin.getDate()} ${MESES_CORTOS[fin.getMonth()]} ${fin.getFullYear()}`
}

// Reparte en carriles lado a lado solo los grupos de eventos que se cruzan entre sí
function enCarriles(eventos) {
  const ubicados = []
  let grupo = []
  let finCarril = []
  let finGrupo = 0

  const cerrarGrupo = () => {
    for (const e of grupo) ubicados.push({ ...e, total: finCarril.length })
    grupo = []
    finCarril = []
  }

  for (const e of [...eventos].sort((a, b) => a.ini - b.ini)) {
    if (grupo.length && e.ini >= finGrupo) cerrarGrupo()
    let carril = finCarril.findIndex((fin) => fin <= e.ini)
    if (carril === -1) {
      carril = finCarril.length
      finCarril.push(e.fin)
    } else {
      finCarril[carril] = e.fin
    }
    grupo.push({ ...e, carril })
    finGrupo = grupo.length === 1 ? e.fin : Math.max(finGrupo, e.fin)
  }
  cerrarGrupo()
  return ubicados
}

function Evento({ e, zona, detalle, compacto, onSelect, className, style }) {
  const color = colorZona(e.r.zonaComunId)
  const pendiente = e.r.estado === 'PENDIENTE'
  return (
    <button
      type="button"
      onClick={() => onSelect?.(e.r)}
      style={style}
      title={`${e.r.zonaComunNombre} · ${fmtHora(e.ini)}–${fmtHora(e.fin)} · ${e.r.apartamento}${pendiente ? ' · Pendiente' : ''}`}
      className={cn(
        'overflow-hidden rounded-md px-2 text-left text-xs leading-tight outline-none transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
        pendiente ? cn('border border-dashed', color.suave) : color.solido,
        compacto ? 'py-1' : 'py-1.5',
        className,
      )}
    >
      <span className="flex items-center gap-1 font-semibold">
        {pendiente && <Clock className="size-3 shrink-0" strokeWidth={2.5} aria-label="Pendiente" />}
        <span className="truncate">
          {compacto ? `${fmtHora(e.ini)} ${zona}` : `${fmtHora(e.ini)} – ${fmtHora(e.fin)}`}
        </span>
      </span>
      {!compacto && (
        <>
          <span className="mt-0.5 block truncate font-medium">{zona}</span>
          {detalle && <span className="block truncate opacity-85">{detalle}</span>}
        </>
      )}
    </button>
  )
}

Evento.propTypes = {
  e: PropTypes.object.isRequired,
  zona: PropTypes.string,
  detalle: PropTypes.string,
  compacto: PropTypes.bool,
  onSelect: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
}

function VistaMes({ fecha, porDia, hoy, onSelect, onAbrirDia }) {
  const mes = fecha.getMonth()
  const inicio = inicioSemana(new Date(fecha.getFullYear(), mes, 1))
  const ultimo = new Date(fecha.getFullYear(), mes + 1, 0)
  const semanas = Math.ceil((Math.round((ultimo - inicio) / 86400000) + 1) / 7)
  const dias = Array.from({ length: semanas * 7 }, (_, i) => sumarDias(inicio, i))

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {DIAS_CORTOS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-slate-600">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dias.map((d, i) => {
          const fuera = d.getMonth() !== mes
          const eventos = fuera ? [] : (porDia[claveDia(d)] ?? [])
          const esHoy = claveDia(d) === claveDia(hoy)
          return (
            <div
              key={claveDia(d)}
              className={cn(
                'min-h-20 border-slate-200 p-1 sm:min-h-32 sm:p-1.5',
                i % 7 !== 6 && 'border-r',
                i < dias.length - 7 && 'border-b',
                fuera && 'bg-slate-50/70',
              )}
            >
              <button
                type="button"
                onClick={() => onAbrirDia(d)}
                aria-label={`Ver ${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()}`}
                className={cn(
                  'mb-1 flex size-7 items-center justify-center rounded-full text-sm font-semibold outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500',
                  fuera ? 'text-slate-300' : 'text-slate-700',
                  esHoy && 'bg-brand-600 text-white hover:bg-brand-700',
                )}
              >
                {d.getDate()}
              </button>

              {/* Móvil: solo puntos de color por zona */}
              <div className="flex flex-wrap gap-1 px-1 sm:hidden">
                {eventos.map((e) => (
                  <span
                    key={e.r.id}
                    className={cn(
                      'size-2 rounded-full',
                      e.r.estado === 'PENDIENTE'
                        ? cn('border border-dashed bg-white', colorZona(e.r.zonaComunId).suave)
                        : colorZona(e.r.zonaComunId).punto,
                    )}
                  />
                ))}
              </div>

              <div className="hidden flex-col gap-1 sm:flex">
                {eventos.slice(0, CHIPS_POR_DIA).map((e) => (
                  <Evento key={e.r.id} e={e} zona={e.r.zonaComunNombre} compacto onSelect={onSelect} />
                ))}
                {eventos.length > CHIPS_POR_DIA && (
                  <button
                    type="button"
                    onClick={() => onAbrirDia(d)}
                    className="rounded px-2 text-left text-xs font-semibold text-slate-500 hover:text-brand-700"
                  >
                    {eventos.length - CHIPS_POR_DIA} más
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

VistaMes.propTypes = {
  fecha: PropTypes.instanceOf(Date).isRequired,
  porDia: PropTypes.object.isRequired,
  hoy: PropTypes.instanceOf(Date).isRequired,
  onSelect: PropTypes.func,
  onAbrirDia: PropTypes.func.isRequired,
}

// Rejilla de horas compartida por las vistas Semana y Día
function RejillaHoras({ columnas, hoy, onSelect, onAbrirDia, anchoMin }) {
  const horas = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i)
  const alto = horas.length * ALTO_HORA
  const ahora = horaDecimal(hoy)

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <div style={{ minWidth: anchoMin }}>
        <div className="sticky top-0 z-10 flex border-b border-slate-200 bg-slate-50">
          <div className="w-14 shrink-0" />
          {columnas.map((c) => (
            <div key={c.key} className="flex-1 border-l border-slate-200 px-2 py-2 text-center">
              {c.fecha ? (
                <button
                  type="button"
                  onClick={() => onAbrirDia(c.fecha)}
                  className="rounded-md px-2 text-xs font-semibold text-slate-600 outline-none hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  {c.titulo}{' '}
                  <span
                    className={cn(
                      'ml-0.5 inline-flex size-6 items-center justify-center rounded-full text-sm',
                      c.esHoy ? 'bg-brand-600 text-white' : 'text-slate-900',
                    )}
                  >
                    {c.fecha.getDate()}
                  </span>
                </button>
              ) : (
                <span className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
                  <span className={cn('size-2.5 rounded-full', c.punto)} />
                  {c.titulo}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="relative flex" style={{ height: alto }}>
          <div className="relative w-14 shrink-0">
            {horas.map((h, i) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 text-2xs font-medium text-slate-400"
                style={{ top: i * ALTO_HORA }}
              >
                {i === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
              </span>
            ))}
          </div>

          {columnas.map((c) => {
            const ubicados = enCarriles(c.eventos)
            return (
              <div
                key={c.key}
                className={cn('relative flex-1 border-l border-slate-200', c.esHoy && c.fecha && 'bg-brand-50/40')}
              >
                {horas.map((h, i) => (
                  <div key={h} className="absolute inset-x-0 border-t border-slate-100" style={{ top: i * ALTO_HORA }} />
                ))}
                {c.esHoy && ahora >= HORA_INICIO && ahora <= HORA_FIN && (
                  <div
                    className="absolute inset-x-0 z-[5] border-t-2 border-brand-600"
                    style={{ top: (ahora - HORA_INICIO) * ALTO_HORA }}
                  >
                    <span className="absolute -left-1 -top-[5px] size-2 rounded-full bg-brand-600" />
                  </div>
                )}
                {ubicados.map((e) => {
                  const ini = Math.max(horaDecimal(e.ini), HORA_INICIO)
                  const fin = Math.min(horaDecimal(e.fin), HORA_FIN)
                  return (
                    <Evento
                      key={e.r.id}
                      e={e}
                      zona={c.zonaEnEvento ? e.r.zonaComunNombre : e.r.residente}
                      detalle={e.r.apartamento}
                      onSelect={onSelect}
                      className="absolute"
                      style={{
                        top: (ini - HORA_INICIO) * ALTO_HORA + 1,
                        height: Math.max((fin - ini) * ALTO_HORA - 2, 22),
                        left: `calc(${(e.carril / e.total) * 100}% + 2px)`,
                        width: `calc(${100 / e.total}% - 4px)`,
                      }}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

RejillaHoras.propTypes = {
  columnas: PropTypes.array.isRequired,
  hoy: PropTypes.instanceOf(Date).isRequired,
  onSelect: PropTypes.func,
  onAbrirDia: PropTypes.func.isRequired,
  anchoMin: PropTypes.number,
}

export default function CalendarioReservas({ reservas, zonas, onSelect, className }) {
  const [hoy, setHoy] = useState(() => new Date())
  const [vista, setVista] = useState('mes')
  const [fecha, setFecha] = useState(() => new Date())
  const [ocultas, setOcultas] = useState(() => new Set())

  // Mantiene la línea de "ahora" al día
  useEffect(() => {
    const id = setInterval(() => setHoy(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const porDia = useMemo(() => {
    const mapa = {}
    for (const r of reservas) {
      if (!ESTADOS_VISIBLES.includes(r.estado) || ocultas.has(r.zonaComunId)) continue
      const e = { r, ini: new Date(r.fechaInicio), fin: new Date(r.fechaFin) }
      ;(mapa[claveDia(e.ini)] ??= []).push(e)
    }
    for (const lista of Object.values(mapa)) lista.sort((a, b) => a.ini - b.ini)
    return mapa
  }, [reservas, ocultas])

  const mover = (delta) => {
    if (vista === 'mes') setFecha(new Date(fecha.getFullYear(), fecha.getMonth() + delta, 1))
    else setFecha(sumarDias(fecha, delta * (vista === 'semana' ? 7 : 1)))
  }

  const abrirDia = (d) => {
    setFecha(d)
    setVista('dia')
  }

  const alternarZona = (id) => {
    const nuevas = new Set(ocultas)
    if (nuevas.has(id)) nuevas.delete(id)
    else nuevas.add(id)
    setOcultas(nuevas)
  }

  const zonasVisibles = zonas.filter((z) => !ocultas.has(z.id))

  let contenido
  if (vista === 'mes') {
    contenido = <VistaMes fecha={fecha} porDia={porDia} hoy={hoy} onSelect={onSelect} onAbrirDia={abrirDia} />
  } else if (vista === 'semana') {
    const ini = inicioSemana(fecha)
    const columnas = Array.from({ length: 7 }, (_, i) => {
      const d = sumarDias(ini, i)
      return {
        key: claveDia(d),
        fecha: d,
        titulo: DIAS_CORTOS[i],
        esHoy: claveDia(d) === claveDia(hoy),
        eventos: porDia[claveDia(d)] ?? [],
        zonaEnEvento: true,
      }
    })
    contenido = (
      <RejillaHoras columnas={columnas} hoy={hoy} onSelect={onSelect} onAbrirDia={abrirDia} anchoMin={760} />
    )
  } else {
    const delDia = porDia[claveDia(fecha)] ?? []
    const esHoy = claveDia(fecha) === claveDia(hoy)
    const columnas = zonasVisibles.map((z) => ({
      key: z.id,
      titulo: z.nombre,
      punto: colorZona(z.id).punto,
      esHoy,
      eventos: delDia.filter((e) => e.r.zonaComunId === z.id),
    }))
    contenido = columnas.length ? (
      <RejillaHoras
        columnas={columnas}
        hoy={hoy}
        onSelect={onSelect}
        onAbrirDia={abrirDia}
        anchoMin={56 + columnas.length * 150}
      />
    ) : (
      <p className="rounded-lg border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        Activa al menos una zona para ver su agenda.
      </p>
    )
  }

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Vista del calendario" className="inline-flex rounded-lg bg-slate-100 p-1">
          {VISTAS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="tab"
              aria-selected={vista === v.key}
              onClick={() => setVista(v.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 sm:px-4',
                vista === v.key ? 'bg-white text-slate-900 shadow-card' : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <h2 className="order-first w-full text-lg font-bold tracking-tight text-slate-900 sm:order-none sm:ml-2 sm:w-auto sm:flex-1 sm:text-xl">
          {tituloPeriodo(vista, fecha)}
        </h2>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <Button variant="secondary" size="sm" onClick={() => setFecha(new Date())}>
            Hoy
          </Button>
          <IconButton icon={ChevronLeft} label="Anterior" onClick={() => mover(-1)} />
          <IconButton icon={ChevronRight} label="Siguiente" onClick={() => mover(1)} />
        </div>
      </div>

      {contenido}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {zonas.map((z) => {
          const activa = !ocultas.has(z.id)
          return (
            <button
              key={z.id}
              type="button"
              aria-pressed={activa}
              onClick={() => alternarZona(z.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                activa
                  ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  : 'border-transparent bg-slate-100 text-slate-400 line-through',
              )}
            >
              <span className={cn('size-2.5 rounded-full', activa ? colorZona(z.id).punto : 'bg-slate-300')} />
              {z.nombre}
            </button>
          )
        })}
        <span className="flex items-center gap-1.5 text-xs text-slate-500 sm:ml-auto">
          <span className="inline-block h-3 w-5 rounded-sm border border-dashed border-slate-400 bg-slate-50" />
          Pendiente de aprobación
        </span>
      </div>
    </div>
  )
}

CalendarioReservas.propTypes = {
  reservas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      zonaComunId: PropTypes.number.isRequired,
      zonaComunNombre: PropTypes.string.isRequired,
      fechaInicio: PropTypes.string.isRequired,
      fechaFin: PropTypes.string.isRequired,
      estado: PropTypes.string.isRequired,
      residente: PropTypes.string,
      apartamento: PropTypes.string,
    }),
  ).isRequired,
  zonas: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number.isRequired, nombre: PropTypes.string.isRequired }),
  ).isRequired,
  onSelect: PropTypes.func,
  className: PropTypes.string,
}
