import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, Phone, Search } from 'lucide-react'
import { Avatar } from '../../components/ui'
import { Isotipo } from '../../components/ui/Logo'
import { carteraConjunto, residentes } from '../../data/mock'
import { aparecer, tarjeta } from '../../lib/panel'
import { cn } from '../../lib/utils'

const TORRES = ['Todas', 'T1', 'T2', 'T3']
const CUENTAS = ['Todos', 'Al día', 'En mora']

export default function Residentes() {
  const [query, setQuery] = useState('')
  const [torre, setTorre] = useState('Todas')
  const [cuenta, setCuenta] = useState('Todos')

  const alDia = (r) => r.estadoCuenta === 'Al día'
  const texto = query.trim().toLowerCase()
  const filtrados = residentes.filter(
    (r) =>
      (!texto || r.nombre.toLowerCase().includes(texto) || r.apartamento.toLowerCase().includes(texto)) &&
      (torre === 'Todas' || r.apartamento.startsWith(torre)) &&
      (cuenta === 'Todos' || (cuenta === 'Al día' ? alDia(r) : !alDia(r))),
  )
  const porTorre = TORRES.slice(1).map((t) => [t, residentes.filter((r) => r.apartamento.startsWith(t)).length])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Residentes</h1>
        <p className="mt-1 text-sm text-slate-500">128 registrados en 3 torres · 120 apartamentos</p>
      </div>

      {/* Resumen por torre */}
      <div className="grid gap-5 sm:grid-cols-3">
        {porTorre.map(([t, n], i) => (
          <motion.button
            key={t}
            type="button"
            {...aparecer(i)}
            onClick={() => setTorre(torre === t ? 'Todas' : t)}
            aria-pressed={torre === t}
            className={cn(
              tarjeta,
              'flex items-center gap-4 p-4 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
              torre === t ? 'ring-2 ring-brand-500' : 'hover:-translate-y-0.5',
            )}
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 p-2">
              <Isotipo className="size-full" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-900">Torre {t.slice(1)}</span>
              <span className="block text-xs text-slate-500">40 apartamentos</span>
            </span>
            <span className="text-right">
              <span className="block text-2xl font-extrabold text-slate-900 tabular-nums">{n}</span>
              <span className="block text-[11px] text-slate-400">en el directorio</span>
            </span>
          </motion.button>
        ))}
      </div>

      {/* Filtros */}
      <motion.div {...aparecer(3)} className={cn(tarjeta, 'flex flex-wrap items-center gap-3 p-3')}>
        <label className="relative w-full sm:w-72">
          <span className="sr-only">Buscar por nombre o apartamento</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nombre o apto…"
            className="w-full rounded-full bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Estado de cuenta">
          {CUENTAS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cuenta === c}
              onClick={() => setCuenta(c)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                cuenta === c ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 sm:ml-auto">
          Cartera del conjunto:{' '}
          <span className="font-semibold text-success-strong">{carteraConjunto.alDia} al día</span> ·{' '}
          <span className="font-semibold text-warning-strong">{carteraConjunto.enMora} en mora</span>
        </p>
      </motion.div>

      {filtrados.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtrados.map((r) => {
              const alDiaR = alDia(r)
              const [saldo, meses] = r.estadoCuenta.split(' · ')
              return (
                <motion.article
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  className={cn(tarjeta, 'flex flex-col overflow-hidden')}
                >
                  <div className={cn('h-14', alDiaR ? 'bg-gradient-to-r from-brand-100 to-brand-50' : 'bg-gradient-to-r from-amber-100 to-amber-50')} />
                  <div className="-mt-8 flex flex-1 flex-col items-center px-4 pb-4 text-center">
                    <Avatar nombre={r.nombre} size="lg" className="size-16 text-lg ring-4 ring-white" />
                    <h2 className="mt-2 font-bold text-slate-900">{r.nombre}</h2>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <Building2 className="size-3.5" /> {r.apartamento}
                    </p>
                    <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-slate-400">
                      <Phone className="size-3" /> {r.celular}
                    </p>
                    <div className="mt-auto w-full pt-4">
                      {alDiaR ? (
                        <p className="rounded-xl bg-success-bg px-3 py-2 text-xs font-semibold text-success-strong">Al día con la administración</p>
                      ) : (
                        <p className="rounded-xl bg-warning-bg px-3 py-2 text-xs text-warning-strong">
                          <span className="font-bold">{saldo}</span> en mora · {meses}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className={cn(tarjeta, 'px-6 py-12 text-center')}>
          <p className="text-sm font-bold text-slate-900">Sin resultados</p>
          <p className="mt-1 text-xs text-slate-500">Ningún residente coincide con la búsqueda o los filtros.</p>
        </div>
      )}
    </div>
  )
}
