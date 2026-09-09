import { ArrowRight, Home } from 'lucide-react'
import { motion } from 'motion/react'
import { rolCards } from '../config/roles'

export default function RoleSelector({ onSelect }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-50 p-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 500px at 15% -10%, rgba(5,150,105,0.08), transparent 60%), radial-gradient(700px 500px at 110% 110%, rgba(5,150,105,0.06), transparent 55%)',
        }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-3xl">
        <div className="animate-fade-up mb-10 text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            <Home className="h-7 w-7" strokeWidth={2} />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            ResiGest
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
            Selecciona el tipo de usuario
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rolCards.map((rol, i) => {
            const Icon = rol.icon
            return (
              <motion.button
                key={rol.key}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(rol.key)}
                className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 text-left hover:border-brand-200"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${rol.tint}`}>
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-slate-900">{rol.nombre}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">{rol.descripcion}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand-600" />
              </motion.button>
            )
          })}
        </div>

        <p className="animate-fade-up mt-10 text-center text-xs text-slate-400">
          Prototipo visual · Storyboard de ResiGest — Ingeniería de Sistemas
        </p>
      </div>
    </div>
  )
}