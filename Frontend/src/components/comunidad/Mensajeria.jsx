import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, ArrowLeft, Building2, CheckCheck, Lock, MessagesSquare, PenSquare, Search, Send, Users, X } from 'lucide-react'
import { Avatar, Button } from '../ui'
import { hora } from '../../lib/porteria'
import { residenteApi } from '../../lib/residente'
import { guardarCache, leerCache } from '../../lib/useCarga'
import { useSesion } from '../../lib/sesion'
import { cn, iniciales } from '../../lib/utils'

// Chat del conjunto: el grupo de toda la comunidad y los mensajes privados con cualquier persona.
// A la izquierda las conversaciones; a la derecha la abierta. En pantallas angostas se ve una
// cosa a la vez. Se actualiza cada pocos segundos para traer los mensajes nuevos.

const CADA_CONVERSACION = 8_000
const CADA_LISTA = 30_000
// Chat comunitario (general o de una torre) como si fuera una conversación más
const aCanal = (c) => ({
  usuarioId: `canal-${c.torreId ?? 'general'}`,
  torreId: c.torreId,
  nombre: c.nombre,
  detalle: c.torreId ? 'Residentes de la torre y administración' : 'Residentes, portería, mantenimiento y administración',
  grupo: true,
})

// Mensaje del grupo → misma forma que un mensaje privado, con el autor
const deComunidad = (m) => ({ id: m.id, remitenteId: m.autorId, contenido: m.contenido, fecha: m.fecha, autor: m.autorNombre, detalle: m.detalle })

const diaDe = (iso) => {
  const hoy = new Date().toLocaleDateString('en-CA')
  const ayer = new Date(Date.now() - 86_400_000).toLocaleDateString('en-CA')
  const d = iso.slice(0, 10)
  if (d === hoy) return 'Hoy'
  if (d === ayer) return 'Ayer'
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
}

export default function Mensajeria() {
  const { usuario } = useSesion()
  const [conversaciones, setConversaciones] = useState(() => leerCache('chat:conversaciones') ?? null)
  // Chats comunitarios del usuario con su último mensaje: [{ ...canal, ultimo }]
  const [canales, setCanales] = useState(() => leerCache('chat:canales') ?? [])
  const [directorio, setDirectorio] = useState(() => leerCache('chat:directorio') ?? [])
  const [activa, setActiva] = useState(null) // { usuarioId, nombre, detalle }
  const [hilo, setHilo] = useState([])
  const [eligiendo, setEligiendo] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [enChat, setEnChat] = useState(false) // solo afecta a pantallas angostas
  const [borrador, setBorrador] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const caja = useRef(null)

  const cargarConversaciones = useCallback(() => {
    residenteApi
      .conversaciones()
      .then((c) => {
        guardarCache('chat:conversaciones', c)
        setConversaciones(c)
      })
      .catch((e) => setError(e.message))
    residenteApi
      .canalesComunidad()
      .then((lista) =>
        Promise.all(lista.map((c) => residenteApi.comunidad(c.torreId).then((m) => ({ ...aCanal(c), ultimo: m.at(-1) ?? null })))),
      )
      .then((c) => {
        guardarCache('chat:canales', c)
        setCanales(c)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    cargarConversaciones()
    const t = setInterval(cargarConversaciones, CADA_LISTA)
    return () => clearInterval(t)
  }, [cargarConversaciones])

  // La conversación abierta se refresca sola para ver las respuestas
  useEffect(() => {
    if (!activa) return
    let vigente = true
    const pedir = activa.grupo ? () => residenteApi.comunidad(activa.torreId).then((l) => l.map(deComunidad)) : () => residenteApi.mensajes(activa.usuarioId)
    const cargar = () =>
      pedir()
        .then((m) => vigente && setHilo(m))
        .catch(() => {})
    cargar()
    const t = setInterval(cargar, CADA_CONVERSACION)
    return () => {
      vigente = false
      clearInterval(t)
    }
  }, [activa])

  // Al cambiar de conversación o llegar mensajes, la caja baja al último (sin mover la página)
  useEffect(() => {
    const c = caja.current
    if (c) c.scrollTo({ top: c.scrollHeight })
  }, [activa, hilo.length])

  // El directorio solo hace falta para escribir un mensaje nuevo: se pide al abrir esa lista
  useEffect(() => {
    if (!eligiendo || directorio.length) return
    residenteApi
      .directorio()
      .then((d) => {
        guardarCache('chat:directorio', d)
        setDirectorio(d)
      })
      .catch(() => {})
  }, [eligiendo, directorio.length])

  const abrir = (contacto) => {
    setActiva(contacto)
    setHilo([])
    setEnChat(true)
    setEligiendo(false)
    setBusqueda('')
    setBorrador('')
    setError('')
  }

  const enviar = async (e) => {
    e.preventDefault()
    const texto = borrador.trim()
    if (!texto || !activa) return
    setEnviando(true)
    setError('')
    try {
      const mensaje = activa.grupo ? deComunidad(await residenteApi.enviarComunidad(texto, activa.torreId)) : await residenteApi.enviarMensaje(activa.usuarioId, texto)
      setHilo((h) => [...h, mensaje])
      setBorrador('')
      cargarConversaciones()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const texto = busqueda.trim().toLowerCase()
  const candidatos = directorio.filter((v) => !texto || v.nombreCompleto.toLowerCase().includes(texto) || v.detalle.toLowerCase().includes(texto))
  const mensajes = hilo.map((m) => ({ id: m.id, mio: m.remitenteId === usuario.id, texto: m.contenido, fecha: m.fecha, autor: m.autor ?? activa?.nombre, detalle: m.detalle, autorId: m.remitenteId }))
  const esGrupo = Boolean(activa?.grupo)
  const dias = [...new Set(mensajes.map((m) => diaDe(m.fecha)))]

  return (
    <div className="flex h-[600px] md:grid md:h-[640px] md:grid-cols-[260px_1fr] lg:h-0 lg:min-h-[560px] lg:flex-1">
      {/* Lista de conversaciones */}
      <aside className={cn('min-h-0 w-full flex-col border-slate-100 bg-white md:flex md:border-r', enChat ? 'hidden' : 'flex')}>
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
          <h2 className="text-sm font-bold text-slate-900">Mensajes</h2>
          <button
            type="button"
            onClick={() => setEligiendo((v) => !v)}
            aria-label={eligiendo ? 'Cancelar mensaje nuevo' : 'Escribir mensaje nuevo'}
            title={eligiendo ? 'Cancelar' : 'Mensaje nuevo'}
            className="flex size-8 items-center justify-center rounded-lg text-brand-700 outline-none transition-colors hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {eligiendo ? <X className="size-4" /> : <PenSquare className="size-4" />}
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {eligiendo ? (
            <motion.div key="elegir" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="flex min-h-0 flex-1 flex-col">
              <p className="px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mensaje nuevo a…</p>
              <label className="relative mx-4 mt-2 block">
                <span className="sr-only">Buscar persona</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre, apto o cargo…"
                  className="w-full rounded-full bg-slate-100 py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-500"
                />
              </label>
              <ul className="mt-2 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
                {candidatos.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => abrir({ usuarioId: v.id, nombre: v.nombreCompleto, detalle: v.detalle })}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Avatar nombre={v.nombreCompleto} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">{v.nombreCompleto}</span>
                        <span className="block truncate text-[11px] text-slate-400">{v.detalle}</span>
                      </span>
                    </button>
                  </li>
                ))}
                {candidatos.length === 0 && <li className="px-2 py-4 text-center text-xs text-slate-500">Nadie coincide con la búsqueda.</li>}
              </ul>
            </motion.div>
          ) : (
            <motion.ul key="lista" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
              {canales.length > 0 && <li className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Comunidad</li>}
              {canales.map((c) => (
                <li key={c.usuarioId}>
                  <Fila
                    activa={activa?.usuarioId === c.usuarioId}
                    onClick={() => abrir(c)}
                    icono={
                      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-white', c.torreId ? 'bg-brand-800' : 'bg-brand-600')}>
                        {c.torreId ? <Building2 className="size-4" /> : <Users className="size-4" />}
                      </span>
                    }
                    titulo={c.nombre}
                    detalle={c.ultimo ? `${c.ultimo.autorId === usuario.id ? 'Tú' : c.ultimo.autorNombre.split(' ')[0]}: ${c.ultimo.contenido}` : 'Aún sin mensajes'}
                    hora={c.ultimo ? (diaDe(c.ultimo.fecha) === 'Hoy' ? hora(c.ultimo.fecha) : diaDe(c.ultimo.fecha)) : ''}
                  />
                </li>
              ))}
              <li className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Privados</li>
              {conversaciones === null && !error && (
                <li className="space-y-2 px-2 py-2" role="status" aria-label="Cargando conversaciones">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="block h-10 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </li>
              )}
              {conversaciones?.length === 0 && (
                <li className="px-3 py-4 text-center">
                  <MessagesSquare className="mx-auto size-7 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">Sin mensajes privados</p>
                  <p className="mt-1 text-xs text-slate-500">Escríbele a un vecino, a portería o a la administración.</p>
                  <Button size="sm" variant="outline" icon={PenSquare} className="mt-3" onClick={() => setEligiendo(true)}>
                    Mensaje nuevo
                  </Button>
                </li>
              )}
              {conversaciones?.map((c) => (
                <li key={c.usuarioId}>
                  <Fila
                    activa={activa?.usuarioId === c.usuarioId}
                    onClick={() => abrir(c)}
                    icono={<Avatar nombre={c.nombre} size="md" />}
                    titulo={c.nombre}
                    detalle={`${c.ultimoEsMio ? 'Tú: ' : ''}${c.ultimoMensaje}`}
                    hora={diaDe(c.fecha) === 'Hoy' ? hora(c.fecha) : diaDe(c.fecha)}
                  />
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </aside>

      {/* Conversación */}
      <section className={cn('min-h-0 min-w-0 w-full flex-col md:flex', enChat ? 'flex' : 'hidden')}>
        {activa ? (
          <>
            {esGrupo ? (
              <header className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-3.5 text-white">
                <svg viewBox="0 0 200 60" className="pointer-events-none absolute -right-4 bottom-0 h-14 w-52 opacity-10" aria-hidden="true">
                  <path d="M10 60 V30 h22 V60 M40 60 V14 h26 V60 M74 60 V24 h20 V60 M102 60 V8 h28 V60 M138 60 V28 h20 V60 M166 60 V18 h24 V60" className="fill-white" />
                </svg>
                <BotonVolver onClick={() => setEnChat(false)} claro />
                <div className="relative min-w-0 flex-1">
                  <h3 className="truncate font-bold">{activa.nombre}</h3>
                  <p className="truncate text-xs text-brand-100">{activa.detalle}</p>
                </div>
              </header>
            ) : (
              <header className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
                <BotonVolver onClick={() => setEnChat(false)} />
                <Avatar nombre={activa.nombre} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-slate-900">{activa.nombre}</h3>
                  <p className="truncate text-xs text-slate-500">{activa.detalle}</p>
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
              {mensajes.length === 0 ? (
                esGrupo ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Users className="size-6" />
                    </span>
                    <p className="text-sm font-semibold text-slate-800">Saluda a tus vecinos</p>
                    <p className="max-w-xs text-xs text-slate-500">
                      {activa.torreId ? 'Solo los residentes de tu torre y la administración verán lo que escribas aquí.' : 'Todo el conjunto verá lo que escribas aquí.'} Sé amable y
                      respetuoso.
                    </p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                    <Avatar nombre={activa.nombre} size="lg" />
                    <p className="text-sm font-semibold text-slate-800">Escríbele a {activa.nombre.split(' ')[0]}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <Lock className="size-3" /> Solo ustedes dos verán esta conversación.
                    </p>
                  </div>
                )
              ) : (
                dias.map((d) => (
                  <div key={d}>
                    <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 [&:not(:first-child)]:mt-4">
                      <span className="h-px flex-1 bg-slate-200" />
                      {d}
                      <span className="h-px flex-1 bg-slate-200" />
                    </p>
                    <ul className="space-y-3">
                      {mensajes
                        .filter((m) => diaDe(m.fecha) === d)
                        .map((m, i, arr) => {
                          // No se repite el avatar en mensajes seguidos del mismo autor
                          const continua = arr[i + 1]?.autorId === m.autorId
                          return (
                            <motion.li key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('flex items-end gap-2.5', m.mio && 'flex-row-reverse')}>
                              {continua ? (
                                <span className="size-8 shrink-0" />
                              ) : m.mio ? (
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{iniciales(usuario.nombreCompleto)}</span>
                              ) : (
                                <Avatar nombre={m.autor} size="sm" />
                              )}
                              <div className={cn('min-w-0 max-w-[85%] sm:max-w-md', m.mio && 'text-right')}>
                                {esGrupo && !m.mio && arr[i - 1]?.autorId !== m.autorId && (
                                  <p className="mb-1 text-xs font-semibold text-slate-700">
                                    {m.autor} <span className="font-normal text-slate-400">· {m.detalle}</span>
                                  </p>
                                )}
                                <div
                                  className={cn(
                                    'inline-block whitespace-pre-line rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed shadow-sm',
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

            {error && (
              <p role="alert" className="flex items-center gap-2 bg-danger-bg px-4 py-2 text-xs font-medium text-danger-strong">
                <AlertCircle className="size-4 shrink-0" /> {error}
              </p>
            )}
            <form onSubmit={enviar} className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
              <label htmlFor="mensaje-chat" className="sr-only">
                {esGrupo ? `Mensaje para el ${activa.nombre.toLowerCase()}` : `Mensaje privado para ${activa.nombre}`}
              </label>
              <input
                id="mensaje-chat"
                type="text"
                maxLength={1000}
                value={borrador}
                onChange={(e) => setBorrador(e.target.value)}
                placeholder={esGrupo ? (activa.torreId ? 'Escribe a tus vecinos de torre…' : 'Escribe a todo el conjunto…') : `Mensaje para ${activa.nombre.split(' ')[0]}…`}
                className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-500"
              />
              <Button type="submit" icon={Send} disabled={!borrador.trim() || enviando} aria-label="Enviar mensaje">
                <span className="hidden sm:inline">Enviar</span>
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-slate-50/70 bg-[radial-gradient(rgb(0_122_51/0.07)_1px,transparent_1.2px)] bg-[length:16px_16px] px-6 text-center">
            <MessagesSquare className="size-10 text-brand-300" />
            <p className="text-sm font-semibold text-slate-700">Elige una conversación</p>
            <p className="max-w-xs text-xs text-slate-500">O escribe un mensaje nuevo a un vecino, a portería o a la administración.</p>
          </div>
        )}
      </section>
    </div>
  )
}

function Fila({ activa, onClick, icono, titulo, detalle, hora: cuando }) {
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
          <span className="truncate text-sm font-semibold text-slate-800">{titulo}</span>
          <span className="shrink-0 text-[10px] tabular-nums text-slate-400">{cuando}</span>
        </span>
        <span className="block truncate text-xs text-slate-500">{detalle}</span>
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
