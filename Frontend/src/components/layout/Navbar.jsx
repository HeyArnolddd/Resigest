import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff, CheckCheck, Menu, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import Logo from '../ui/Logo'
import { IconButton } from '../ui/Button'
import { api } from '../../lib/api'

const CADA_MINUTO = 60_000
const fmtFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export default function Navbar({ role, onOpenMenu, onExit }) {
  const [abierto, setAbierto] = useState(false)
  // El API devuelve solo las no leídas; al marcarlas se quitan de la lista
  const [lista, setLista] = useState([])
  const noLeidas = lista.length

  const cargar = useCallback(() => {
    api('/notificaciones/no-leidas')
      .then((n) => setLista([...n].sort((a, b) => b.fechaEnvio.localeCompare(a.fechaEnvio))))
      .catch(() => {})
  }, [])

  useEffect(() => {
    cargar()
    const t = setInterval(cargar, CADA_MINUTO)
    return () => clearInterval(t)
  }, [cargar])

  const marcar = (ids) => {
    setLista((l) => l.filter((n) => !ids.includes(n.id)))
    ids.forEach((id) => api(`/notificaciones/${id}/leida`, { method: 'PATCH' }).catch(() => {}))
  }
  const marcarTodas = () => marcar(lista.map((n) => n.id))

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:gap-4 sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <IconButton
          icon={Menu}
          label="Abrir menú"
          className="lg:hidden"
          onClick={onOpenMenu}
        />
        {/* En pantallas muy angostas solo cabe el isotipo */}
        <Logo subtitulo={false} className="lg:hidden [&_p]:max-[374px]:hidden" />
        <div className="hidden min-w-0 items-center gap-3 leading-tight lg:flex">
          <div>
            <p className="text-sm font-bold text-slate-900">Conjunto Residencial Los Robles</p>
            <p className="text-xs text-slate-500">Bucaramanga</p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
            Portal {role.nombre.toLowerCase()}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="relative">
          <IconButton
            icon={Bell}
            label="Notificaciones"
            onClick={() => setAbierto((v) => !v)}
          />
          {noLeidas > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-2xs font-bold text-white">
              {noLeidas}
            </span>
          )}
          {abierto && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setAbierto(false)} />
              <div className="animate-scale-in fixed inset-x-3 top-16 z-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-pop sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Notificaciones</p>
                  {noLeidas > 0 && (
                    <button
                      type="button"
                      onClick={marcarTodas}
                      className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Marcar todas
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {lista.length === 0 && (
                    <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
                      <BellOff className="size-6 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">Estás al día</p>
                      <p className="text-xs text-slate-500">Aquí te avisaremos de reservas, pagos, paquetes e incidencias.</p>
                    </div>
                  )}
                  {lista.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => marcar([n.id])}
                      className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-slate-50"
                    >
                      <span
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          n.leida ? 'bg-slate-200' : 'bg-brand-600',
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{n.titulo}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.mensaje}</p>
                        <p className="mt-1 text-xs font-medium text-slate-400">{fmtFecha(n.fechaEnvio)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-2 rounded-lg px-1 py-1">
          <Avatar nombre={role.usuario} size="md" />
          <div className="hidden leading-tight md:block">
            <p className="text-xs font-bold text-slate-800">{role.usuario}</p>
            <p className="text-xs text-slate-500">{role.detalle}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onExit}
          aria-label="Cerrar sesión"
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 sm:px-3"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  )
}