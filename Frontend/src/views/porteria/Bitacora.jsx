import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { aparecer, tarjeta } from '../../lib/panel'
import { estiloTipo } from '../../lib/porteria'
import { cn } from '../../lib/utils'

const registrosBitacora = [
  { id: 1, hora: '22:41', persona: 'María Camila Reyes', apartamento: 'T2 · 305', tipo: 'Visitante', estado: 'Completado', dia: 'Ayer' },
  { id: 2, hora: '21:05', persona: 'Repartidor Rappi', apartamento: 'T1 · 204', tipo: 'Domicilio', estado: 'Completado', dia: 'Ayer' },
  { id: 3, hora: '19:33', persona: 'Carlos Medina', apartamento: 'T3 · 501', tipo: 'Visitante', estado: 'Completado', dia: 'Ayer' },
  { id: 4, hora: '18:12', persona: 'Técnico de internet', apartamento: 'T2 · 208', tipo: 'Servicio', estado: 'Completado', dia: 'Ayer' },
  { id: 5, hora: '10:24', persona: 'Laura Martínez', apartamento: 'T2 · 305', tipo: 'Visitante', estado: 'En portería', dia: 'Hoy' },
  { id: 6, hora: '09:58', persona: 'Repartidor Rappi', apartamento: 'T3 · 501', tipo: 'Domicilio', estado: 'Completado', dia: 'Hoy' },
  { id: 7, hora: '09:31', persona: 'Pedro Sánchez', apartamento: 'T1 · 103', tipo: 'Visitante', estado: 'Completado', dia: 'Hoy' },
  { id: 8, hora: '09:12', persona: 'Repartidor Uber Eats', apartamento: 'T2 · 208', tipo: 'Domicilio', estado: 'Completado', dia: 'Hoy' },
  { id: 9, hora: '08:47', persona: 'Técnico de TV', apartamento: 'T3 · 410', tipo: 'Servicio', estado: 'Completado', dia: 'Hoy' },
  { id: 10, hora: '08:02', persona: 'Valentina López', apartamento: 'T1 · 201', tipo: 'Visitante', estado: 'Completado', dia: 'Hoy' },
]

const filtros = ['Hoy', 'Ayer', 'Todos']
// Los mocks toman el 09/09/2026 como "hoy"
const titulosDia = { Hoy: 'Hoy · miércoles 9 de septiembre', Ayer: 'Ayer · martes 8 de septiembre' }

const LINEA = 'bg-[repeating-linear-gradient(180deg,transparent_0_43px,rgb(14_116_144/0.14)_43px_44px)]'

export default function Bitacora() {
  const [filtro, setFiltro] = useState('Hoy')
  const datos = filtro === 'Todos' ? registrosBitacora : registrosBitacora.filter((r) => r.dia === filtro)
  const dias = ['Hoy', 'Ayer'].filter((d) => datos.some((r) => r.dia === d))
  const contar = (t) => datos.filter((r) => r.tipo === t).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bitácora</h1>
          <p className="mt-1 text-sm text-slate-500">Historial de ingresos y salidas del conjunto</p>
        </div>
        <div className={cn(tarjeta, 'flex rounded-xl p-1')} role="tablist" aria-label="Filtrar por día">
          {filtros.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filtro === f}
              onClick={() => setFiltro(f)}
              className={cn(
                'relative rounded-lg px-4 py-1.5 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500',
                filtro === f ? 'text-white' : 'text-slate-600 hover:text-slate-900',
              )}
            >
              {filtro === f && (
                <motion.span layoutId="filtro-bitacora" className="absolute inset-0 rounded-lg bg-brand-600 shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{f}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Resumen */}
      <motion.div {...aparecer(0)} className={cn(tarjeta, 'flex flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4')}>
        <p className="text-sm font-bold text-slate-900">{datos.length} registros</p>
        {['Visitante', 'Domicilio', 'Servicio'].map((t) => (
          <p key={t} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={cn('size-2.5 rounded-full', estiloTipo(t).punto)} />
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">{contar(t)}</span>
            {t === 'Servicio' ? 'Servicios' : `${t}s`}
          </p>
        ))}
      </motion.div>

      {/* Libro de minutas */}
      <motion.section {...aparecer(1)} className="relative">
        {/* Argollas */}
        <div className="absolute inset-x-6 -top-3 z-10 flex justify-around" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={cn('h-7 w-3 rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow', i > 5 && 'hidden sm:block')} />
          ))}
        </div>

        <div className={cn(tarjeta, 'overflow-hidden rounded-xl')}>
          <div className="h-6 bg-brand-700" />
          <div className="relative bg-[#fffdf7] pb-6 pt-4">
            {/* Margen rojo */}
            <span className="absolute inset-y-0 left-14 w-px bg-rose-300 sm:left-20" aria-hidden="true" />

            <AnimatePresence mode="wait">
              <motion.div key={filtro} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                {dias.map((dia) => (
                  <div key={dia}>
                    <h2 className="pl-[4.25rem] pr-4 font-tiza text-2xl font-bold leading-[44px] text-brand-800 sm:pl-24 sm:text-[28px]">
                      {titulosDia[dia]}
                    </h2>
                    <ul className={LINEA}>
                      {datos
                        .filter((r) => r.dia === dia)
                        .map((r) => {
                          const tipo = estiloTipo(r.tipo)
                          const Icono = tipo.icono
                          return (
                            <li key={r.id} className="flex min-h-11 items-center gap-3 pr-4">
                              <span className="w-14 shrink-0 pr-2 text-right font-mono text-xs font-semibold text-slate-500 tabular-nums sm:w-20 sm:pr-3">
                                {r.hora}
                              </span>
                              <span className={cn('ml-1 flex size-7 shrink-0 items-center justify-center rounded-full ring-1', tipo.icon)}>
                                <Icono className="size-3.5" strokeWidth={2.2} />
                              </span>
                              <p className="min-w-0 flex-1 truncate text-sm text-slate-700">
                                <span className="font-semibold text-slate-900">{r.persona}</span>
                                <span className="text-slate-400"> → </span>
                                {r.apartamento}
                              </p>
                              <span className={cn('hidden shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold sm:inline', tipo.chip)}>{r.tipo}</span>
                              {r.estado === 'En portería' ? (
                                <span className="shrink-0 font-tiza text-lg font-bold text-amber-600">
                                  <span className="sm:hidden" aria-label="En portería">•••</span>
                                  <span className="hidden sm:inline">en portería</span>
                                </span>
                              ) : (
                                <span className="shrink-0 font-tiza text-lg font-bold text-brand-600">
                                  ✓<span className="hidden sm:inline"> completado</span>
                                </span>
                              )}
                            </li>
                          )
                        })}
                    </ul>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.section>
    </div>
  )
}
