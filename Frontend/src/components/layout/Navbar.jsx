import { useState } from 'react'
import { Bell, CheckCheck, Menu, RotateCcw } from 'lucide-react'
import { cn } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import { IconButton } from '../ui/Button'
import { notificaciones } from '../../data/mock'

export default function Navbar({ role, onOpenMenu, onExit }) {
  const [abierto, setAbierto] = useState(false)
  const [lista, setLista] = useState(notificaciones)
  const noLeidas = lista.filter((n) => !n.leida).length

  const marcarTodas = () => setLista(lista.map((n) => ({ ...n, leida: true })))

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <IconButton
          icon={Menu}
          label="Abrir menú"
          className="lg:hidden"
          onClick={onOpenMenu}
        />
        <span className="text-sm font-semibold text-slate-400">ResiGest</span>
        <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
        <span className="hidden text-sm font-semibold text-slate-600 sm:block">
          {role.nombre}
        </span>
      </div>

      <div className="flex items-center gap-2">
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
              <div className="animate-scale-in absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-pop">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Notificaciones</p>
                  <button
                    type="button"
                    onClick={marcarTodas}
                    className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcar todas
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {lista.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setLista(lista.map((x) => (x.id === n.id ? { ...x, leida: true } : x)))}
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
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{n.detalle}</p>
                        <p className="mt-1 text-xs font-medium text-slate-400">{n.fecha}</p>
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
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Cambiar rol</span>
        </button>
      </div>
    </header>
  )
}