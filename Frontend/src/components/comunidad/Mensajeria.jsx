import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, CheckCheck, Lock, PenSquare, Search, Send, Users, X } from 'lucide-react'
import { Avatar, Button } from '../ui'
import { mensajesComunidad, mensajesPrivados, vecinosChat } from '../../data/mock'
import { cn } from '../../lib/utils'

// Chat del residente: la conversación comunitaria y los mensajes privados con otros
// residentes. A la izquierda la lista de conversaciones; a la derecha la conversación abierta.
// En pantallas angostas se ve una cosa a la vez.

const YO = { id: 1, nombre: 'Juan Pérez', apartamento: 'T2 · 304' }
const COMUNIDAD = 'comunidad'
// Los mocks toman el 09/09/2026 como "hoy"
const HOY = '2026-09-09'

const hora = (iso) => iso.slice(11, 16)
const dia = (iso) => (iso.startsWith(HOY) ? 'Hoy' : 'Ayer')
const ahoraIso = () => {
  const d = new Date()
  return `${HOY}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:00`
}
// El chat comunitario del mock solo trae la hora; se ubica en el día de hoy
const comunidadInicial = mensajesComunidad.map((m) => ({ ...m, fecha: `${HOY}T${m.hora}:00` }))

export default function Mensajeria() {
  const [grupo, setGrupo] = useState(comunidadInicial)
  const [privados, setPrivados] = useState(mensajesPrivados)
  const [activa, setActiva] = useState(COMUNIDAD)
  const [sinLeer, setSinLeer] = useState({ [COMUNIDAD]: 0, 8: 2 })
  const [abiertas, setAbiertas] = useState([])
  const [eligiendo, setEligiendo] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [enChat, setEnChat] = useState(false) // solo afecta a pantallas angostas
  const [borrador, setBorrador] = useState('')
  const caja = useRef(null)

  const vecino = (id) => vecinosChat.find((v) => v.id === id)
  const conQuien = (m) => (m.remitenteId === YO.id ? m.destinatarioId : m.remitenteId)

  // Conversaciones privadas: con quien haya mensajes o se haya abierto una nueva, la más reciente arriba
  const conversaciones = [...new Set([...privados.map(conQuien), ...abiertas])]
    .map((id) => ({ ...vecino(id), ultimo: privados.filter((m) => conQuien(m) === id).at(-1) }))
    // Los ids crecen con cada mensaje; las conversaciones nuevas sin mensajes van arriba
    .sort((a, b) => (b.ultimo?.id ?? Number.MAX_SAFE_INTEGER) - (a.ultimo?.id ?? Number.MAX_SAFE_INTEGER))

  const esGrupo = activa === COMUNIDAD
  const contacto = esGrupo ? null : vecino(activa)
  const hilo = esGrupo
    ? grupo.map((m) => ({ id: m.id, mio: m.autor === YO.nombre, autor: m.autor, detalle: m.torre, texto: m.texto, fecha: m.fecha }))
    : privados
        .filter((m) => conQuien(m) === activa)
        .map((m) => ({ id: m.id, mio: m.remitenteId === YO.id, autor: contacto.nombre, texto: m.contenido, fecha: m.fecha }))
  const dias = [...new Set(hilo.map((m) => dia(m.fecha)))]

  // Al cambiar de conversación o enviar, la caja baja al último mensaje (sin mover la página)
  useEffect(() => {
    const c = caja.current
    if (c) c.scrollTo({ top: c.scrollHeight })
  }, [activa, hilo.length])

  const abrir = (id) => {
    setActiva(id)
    setSinLeer((s) => ({ ...s, [id]: 0 }))
    setEnChat(true)
    setEligiendo(false)
    setBusqueda('')
    setBorrador('')
  }

  const nuevoPrivado = (id) => {
    if (!abiertas.includes(id)) setAbiertas((a) => [...a, id])
    abrir(id)
  }

  const enviar = (e) => {
    e.preventDefault()
    const texto = borrador.trim()
    if (!texto) return
    if (esGrupo) {
      setGrupo((g) => [...g, { id: Date.now(), autor: YO.nombre, torre: YO.apartamento, hora: ahoraIso().slice(11, 16), texto, fecha: ahoraIso() }])
    } else {
      setPrivados((p) => [...p, { id: Date.now(), remitenteId: YO.id, destinatarioId: activa, contenido: texto, fecha: ahoraIso() }])
    }
    setBorrador('')
  }

  const texto = busqueda.trim().toLowerCase()
  const candidatos = vecinosChat.filter((v) => !texto || v.nombre.toLowerCase().includes(texto) || v.apartamento.toLowerCase().includes(texto))
  const totalSinLeer = Object.values(sinLeer).reduce((s, n) => s + n, 0)

  return (
    <div className="flex h-[600px] md:grid md:h-[640px] md:grid-cols-[240px_1fr] lg:h-0 lg:min-h-[560px] lg:flex-1">
      {/* Lista de conversaciones */}
      <aside className={cn('min-h-0 w-full flex-col border-slate-100 bg-white md:flex md:border-r', enChat ? 'hidden' : 'flex')}>
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            Mensajes
            {totalSinLeer > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold leading-4 text-white">{totalSinLeer}</span>}
          </h2>
          <button
            type="button"
            onClick={() => setEligiendo((v) => !v)}
            aria-label={eligiendo ? 'Cancelar mensaje nuevo' : 'Escribir mensaje privado'}
            className="flex size-8 items-center justify-center rounded-lg text-brand-700 outline-none transition-colors hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {eligiendo ? <X className="size-4" /> : <PenSquare className="size-4" />}
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {eligiendo ? (
            <motion.div key="elegir" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="flex min-h-0 flex-1 flex-col">
              <p className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mensaje privado a…</p>
              <label className="relative mx-4 mt-2 block">
                <span className="sr-only">Buscar residente</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre o apto…"
                  className="w-full rounded-full bg-slate-100 py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-500"
                />
              </label>
              <ul className="mt-2 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                {candidatos.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => nuevoPrivado(v.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Avatar nombre={v.nombre} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">{v.nombre}</span>
                        <span className="block text-[11px] text-slate-400">{v.apartamento}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.ul key="lista" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
              <li>
                <Fila
                  activa={esGrupo}
                  onClick={() => abrir(COMUNIDAD)}
                  icono={
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Users className="size-4" />
                    </span>
                  }
                  titulo="Chat comunitario"
                  detalle={`${grupo.at(-1).autor.split(' ')[0]}: ${grupo.at(-1).texto}`}
                  hora={hora(grupo.at(-1).fecha)}
                  sinLeer={sinLeer[COMUNIDAD]}
                />
              </li>
              <li className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Privados</li>
              {conversaciones.map((c) => (
                <li key={c.id}>
                  <Fila
                    activa={activa === c.id}
                    onClick={() => abrir(c.id)}
                    icono={<Avatar nombre={c.nombre} size="md" />}
                    titulo={c.nombre}
                    detalle={c.ultimo ? `${c.ultimo.remitenteId === YO.id ? 'Tú: ' : ''}${c.ultimo.contenido}` : 'Nueva conversación'}
                    hora={c.ultimo ? (dia(c.ultimo.fecha) === 'Hoy' ? hora(c.ultimo.fecha) : 'Ayer') : ''}
                    sinLeer={sinLeer[c.id] ?? 0}
                  />
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </aside>

      {/* Conversación */}
      <section className={cn('min-h-0 min-w-0 w-full flex-col md:flex', enChat ? 'flex' : 'hidden')}>
        {esGrupo ? (
          <header className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-3.5 text-white">
            <svg viewBox="0 0 200 60" className="pointer-events-none absolute -right-4 bottom-0 h-14 w-52 opacity-10" aria-hidden="true">
              <path d="M10 60 V30 h22 V60 M40 60 V14 h26 V60 M74 60 V24 h20 V60 M102 60 V8 h28 V60 M138 60 V28 h20 V60 M166 60 V18 h24 V60" className="fill-white" />
            </svg>
            <BotonVolver onClick={() => setEnChat(false)} claro />
            <div className="relative min-w-0 flex-1">
              <h3 className="font-bold">Chat comunitario</h3>
              <p className="flex items-center gap-1.5 text-xs text-brand-100">
                <span className="size-2 rounded-full bg-lime-300 ring-2 ring-lime-300/30" />
                12 en línea · 128 residentes
              </p>
            </div>
          </header>
        ) : (
          <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
            <BotonVolver onClick={() => setEnChat(false)} />
            <Avatar nombre={contacto.nombre} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bold text-slate-900">{contacto.nombre}</h3>
              <p className="text-xs text-slate-500">{contacto.apartamento}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              <Lock className="size-3" /> Privado
            </span>
          </header>
        )}

        <div
          ref={caja}
          className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 bg-[radial-gradient(rgb(0_122_51/0.07)_1px,transparent_1.2px)] bg-[length:16px_16px] px-4 py-5 sm:px-5"
        >
          {hilo.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Avatar nombre={contacto.nombre} size="lg" />
              <p className="text-sm font-semibold text-slate-800">Escríbele a {contacto.nombre.split(' ')[0]}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Lock className="size-3" /> Solo ustedes dos verán esta conversación.
              </p>
            </div>
          ) : (
            dias.map((d) => (
              <div key={d}>
                <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 [&:not(:first-child)]:mt-4">
                  <span className="h-px flex-1 bg-slate-200" />
                  {d}
                  <span className="h-px flex-1 bg-slate-200" />
                </p>
                <ul className="space-y-3">
                  {hilo
                    .filter((m) => dia(m.fecha) === d)
                    .map((m, i, arr) => {
                      // En privado no se repite el avatar en mensajes seguidos del mismo autor
                      const continua = !esGrupo && arr[i + 1]?.mio === m.mio
                      return (
                        <motion.li
                          key={m.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn('flex items-end gap-2.5', m.mio && 'flex-row-reverse')}
                        >
                          {m.mio ? (
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">JP</span>
                          ) : continua ? (
                            <span className="size-8 shrink-0" />
                          ) : (
                            <Avatar nombre={m.autor} size="sm" />
                          )}
                          <div className={cn('min-w-0 max-w-[85%] sm:max-w-md', m.mio && 'text-right')}>
                            {esGrupo && !m.mio && (
                              <p className="mb-1 text-xs font-semibold text-slate-700">
                                {m.autor} <span className="font-normal text-slate-400">· {m.detalle}</span>
                              </p>
                            )}
                            <div
                              className={cn(
                                'inline-block rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed shadow-sm',
                                m.mio ? 'rounded-br-md bg-brand-600 text-white' : 'rounded-bl-md bg-white text-slate-700 ring-1 ring-slate-200/70',
                              )}
                            >
                              {m.texto}
                              <span className={cn('ml-2 inline-flex translate-y-0.5 items-center gap-0.5 text-[10px]', m.mio ? 'text-brand-100' : 'text-slate-400')}>
                                {hora(m.fecha)}
                                {m.mio && <CheckCheck className="size-3.5" />}
                              </span>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                </ul>
              </div>
            ))
          )}
        </div>

        <form onSubmit={enviar} className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
          <label htmlFor="mensaje-chat" className="sr-only">
            {esGrupo ? 'Mensaje para la comunidad' : `Mensaje privado para ${contacto.nombre}`}
          </label>
          <input
            id="mensaje-chat"
            type="text"
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            placeholder={esGrupo ? 'Escribe un mensaje a la comunidad…' : `Mensaje privado a ${contacto.nombre.split(' ')[0]}…`}
            className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
          <Button type="submit" icon={Send} disabled={!borrador.trim()} aria-label="Enviar mensaje">
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </form>
      </section>
    </div>
  )
}

function Fila({ activa, onClick, icono, titulo, detalle, hora: cuando, sinLeer }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activa}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
        activa ? 'bg-brand-50' : 'hover:bg-slate-50',
      )}
    >
      {icono}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn('truncate text-sm', sinLeer ? 'font-bold text-slate-900' : 'font-semibold text-slate-800')}>{titulo}</span>
          <span className={cn('shrink-0 text-[10px] tabular-nums', sinLeer ? 'font-bold text-brand-700' : 'text-slate-400')}>{cuando}</span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-xs', sinLeer ? 'font-medium text-slate-700' : 'text-slate-500')}>{detalle}</span>
          {sinLeer > 0 && (
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{sinLeer}</span>
          )}
        </span>
      </span>
    </button>
  )
}

Fila.propTypes = {
  activa: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  icono: PropTypes.node.isRequired,
  titulo: PropTypes.string.isRequired,
  detalle: PropTypes.string.isRequired,
  hora: PropTypes.string,
  sinLeer: PropTypes.number,
}

function BotonVolver({ onClick, claro }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Volver a las conversaciones"
      className={cn(
        'relative -ml-1 flex size-8 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-2 md:hidden',
        claro ? 'text-white hover:bg-white/10 focus-visible:ring-white' : 'text-slate-600 hover:bg-slate-100 focus-visible:ring-brand-500',
      )}
    >
      <ArrowLeft className="size-5" />
    </button>
  )
}

BotonVolver.propTypes = { onClick: PropTypes.func.isRequired, claro: PropTypes.bool }
