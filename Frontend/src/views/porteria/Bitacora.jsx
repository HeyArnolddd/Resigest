import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { Button, EmptyState } from '../../components/ui'
import { aparecer, tarjeta } from '../../lib/panel'
import { estiloTipo, fechaApi, hora, porteriaApi } from '../../lib/porteria'
import { useCarga } from '../../lib/useCarga'
import { cn } from '../../lib/utils'

const FILTROS = [
  ['Hoy', 0],
  ['Ayer', 1],
  ['7 días', 6],
]
const TIPOS = ['Visitante', 'Domicilio', 'Servicio']
const plural = { Visitante: 'Visitantes', Domicilio: 'Domicilios', Servicio: 'Servicios' }

const LINEA = 'bg-[repeating-linear-gradient(180deg,transparent_0_43px,rgb(14_116_144/0.14)_43px_44px)]'

// "2026-11-04" → "Hoy · miércoles 4 de noviembre"
function tituloDia(dia) {
  const fecha = new Date(`${dia}T12:00`).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  if (dia === fechaApi()) return `Hoy · ${fecha}`
  if (dia === fechaApi(-1)) return `Ayer · ${fecha}`
  return fecha.charAt(0).toUpperCase() + fecha.slice(1)
}

// Los últimos 7 días, ordenados del más reciente al más antiguo
const cargar = () => porteriaApi.bitacora(fechaApi(-6), fechaApi()).then((l) => [...l].sort((a, b) => b.fechaIngreso.localeCompare(a.fechaIngreso)))

export default function Bitacora() {
  const { datos: registros, error, recargar } = useCarga(cargar, 'port:bitacora')
  const [filtro, setFiltro] = useState('Hoy')

  const dias = FILTROS.find(([f]) => f === filtro)[1]
  const desde = filtro === 'Ayer' ? fechaApi(-1) : fechaApi(-dias)
  const hasta = filtro === 'Ayer' ? fechaApi(-1) : fechaApi()
  const datos = (registros ?? []).filter((r) => {
    const dia = r.fechaIngreso.slice(0, 10)
    return dia >= desde && dia <= hasta
  })
  const porDia = [...new Set(datos.map((r) => r.fechaIngreso.slice(0, 10)))]
  const contar = (t) => datos.filter((r) => r.tipo === t).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bitácora</h1>
          <p className="mt-1 text-sm text-slate-500">Historial de ingresos y salidas del conjunto</p>
        </div>
        <div className={cn(tarjeta, 'flex rounded-xl p-1')} role="tablist" aria-label="Filtrar por día">
          {FILTROS.map(([f]) => (
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
        <p className="text-sm font-bold text-slate-900">{datos.length === 1 ? '1 registro' : `${datos.length} registros`}</p>
        {TIPOS.map((t) => (
          <p key={t} className="flex items-center gap-2 text-sm text-slate-600">
            <span className={cn('size-2.5 rounded-full', estiloTipo(t).punto)} />
            <span className="text-lg font-extrabold text-slate-900 tabular-nums">{contar(t)}</span>
            {plural[t]}
          </p>
        ))}
      </motion.div>

      {error ? (
        <div className={tarjeta}>
          <EmptyState
            icon={AlertCircle}
            title="No se pudo cargar la bitácora"
            description={error}
            action={
              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={recargar} className="mt-2">
                Intentar de nuevo
              </Button>
            }
          />
        </div>
      ) : (
        /* Libro de minutas */
        <motion.section {...aparecer(1)} className="relative">
          {/* Argollas */}
          <div className="absolute inset-x-6 -top-3 z-10 flex justify-around" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className={cn('h-7 w-3 rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 shadow', i > 5 && 'hidden sm:block')} />
            ))}
          </div>

          <div className={cn(tarjeta, 'overflow-hidden rounded-xl')}>
            <div className="h-6 bg-brand-700" />
            <div className="relative min-h-48 bg-[#fffdf7] pb-6 pt-4">
              {/* Margen rojo */}
              <span className="absolute inset-y-0 left-14 w-px bg-rose-300 sm:left-20" aria-hidden="true" />

              {!registros ? (
                <p className="pl-[4.25rem] font-tiza text-2xl text-slate-400 sm:pl-24" role="status">
                  Abriendo el libro…
                </p>
              ) : datos.length === 0 ? (
                <div className="pl-[4.25rem] pr-4 sm:pl-24">
                  <p className="font-tiza text-2xl font-bold leading-[44px] text-brand-800 sm:text-[28px]">{filtro === 'Hoy' ? tituloDia(fechaApi()) : 'Sin anotaciones'}</p>
                  <p className="font-tiza text-xl leading-[44px] text-slate-500">Nadie ha ingresado en este periodo.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={filtro} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }}>
                    {porDia.map((dia) => (
                      <div key={dia}>
                        <h2 className="pl-[4.25rem] pr-4 font-tiza text-2xl font-bold leading-[44px] text-brand-800 sm:pl-24 sm:text-[28px]">{tituloDia(dia)}</h2>
                        <ul className={LINEA}>
                          {datos
                            .filter((r) => r.fechaIngreso.startsWith(dia))
                            .map((r) => {
                              const tipo = estiloTipo(r.tipo)
                              const Icono = tipo.icono
                              return (
                                <li key={r.id} className="flex min-h-11 items-center gap-3 pr-4">
                                  <span className="w-14 shrink-0 pr-2 text-right font-mono text-xs font-semibold text-slate-500 tabular-nums sm:w-20 sm:pr-3">{r.hora}</span>
                                  <span className={cn('ml-1 flex size-7 shrink-0 items-center justify-center rounded-full ring-1', tipo.icon)}>
                                    <Icono className="size-3.5" strokeWidth={2.2} />
                                  </span>
                                  <p className="min-w-0 flex-1 truncate text-sm text-slate-700">
                                    <span className="font-semibold text-slate-900">{r.persona}</span>
                                    <span className="text-slate-400"> → </span>
                                    {r.apartamento}
                                  </p>
                                  <span className={cn('hidden shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold sm:inline', tipo.chip)}>{r.tipo}</span>
                                  {r.dentro ? (
                                    <span className="shrink-0 font-tiza text-lg font-bold text-amber-600">
                                      <span className="sm:hidden" aria-label="Dentro del conjunto">•••</span>
                                      <span className="hidden sm:inline">dentro</span>
                                    </span>
                                  ) : (
                                    <span className="shrink-0 font-tiza text-lg font-bold text-brand-600">
                                      ✓<span className="hidden sm:inline"> salió {hora(r.fechaSalida)}</span>
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
              )}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  )
}
