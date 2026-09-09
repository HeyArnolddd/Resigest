import { Home, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import Avatar from '../ui/Avatar'

export default function Sidebar({ role, active, onSelect, onExit, mobile = false }) {
  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white',
        mobile ? 'relative' : 'hidden lg:flex',
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
          <Home className="size-4" strokeWidth={2} />
        </span>
        <div className="leading-tight">
          <p className="text-base font-extrabold tracking-tight text-slate-900">ResiGest</p>
          <p className="text-2xs font-medium uppercase tracking-wider text-slate-400">
            Gestión residencial
          </p>
        </div>
      </div>

      <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <Avatar nombre={role.usuario} size="md" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-xs font-bold text-slate-800">{role.usuario}</p>
          <p className="truncate text-xs text-slate-500">{role.nombre}</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-3">
        <p className="px-2 pb-2 text-2xs font-semibold uppercase tracking-wider text-slate-400">
          Menú
        </p>
        {role.nav.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-600" />
              )}
              <Icon className="size-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={onExit}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="size-4" strokeWidth={2} />
          Cambiar de rol
        </button>
      </div>
    </aside>
  )
}