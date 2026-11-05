import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { BellRing, DoorOpen, Zap } from 'lucide-react'
import { Avatar, Button, Field, Input, Modal, Select } from '../../components/ui'
import CheckAnimado from '../../components/porteria/CheckAnimado'
import { estiloTipo, horaActual } from '../../lib/porteria'
import { cn } from '../../lib/utils'

const TIPOS = [
  ['Visitante', 'Familiar, amigo o invitado'],
  ['Domicilio', 'Comida, mercado o mensajería'],
]

export default function RegistrarVisitante({ open, onClose, onRegistrado }) {
  const [registrado, setRegistrado] = useState(null)
  const [tipo, setTipo] = useState('Visitante')
  const [entregaRapida, setEntregaRapida] = useState(false)

  const cerrar = () => {
    onClose()
    setTimeout(() => {
      setRegistrado(null)
      setTipo('Visitante')
      setEntregaRapida(false)
    }, 200)
  }

  const registrar = (e) => {
    e.preventDefault()
    const datos = {
      hora: horaActual(),
      persona: e.target.nombre.value,
      apartamento: `${e.target.torre.value} · ${e.target.apartamento.value}`,
      tipo,
      estado: tipo === 'Domicilio' && entregaRapida ? 'Completado' : 'En portería',
    }
    setRegistrado(datos)
    onRegistrado?.(datos)
  }

  return (
    <Modal
      open={open}
      onClose={cerrar}
      title={registrado ? 'Ingreso registrado' : 'Registrar visitante'}
      subtitle={registrado ? undefined : 'Diligencia los datos del ingreso'}
      icon={DoorOpen}
      footer={
        registrado ? (
          <Button onClick={cerrar}>Listo</Button>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={cerrar}>
              Cancelar
            </Button>
            <Button type="submit" form="form-visitante">
              Registrar ingreso
            </Button>
          </>
        )
      }
    >
      {registrado ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckAnimado />
          <p className="text-base font-bold text-slate-900">Ingreso registrado correctamente</p>
          {/* Gafete del ingreso */}
          <motion.div
            initial={{ opacity: 0, y: 10, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="w-64 overflow-hidden rounded-xl bg-white text-left shadow-lg ring-1 ring-slate-200"
          >
            <div className={cn('flex h-8 items-center px-3 text-[11px] font-bold', estiloTipo(registrado.tipo).banda)}>{registrado.tipo}</div>
            <div className="flex items-center gap-3 p-3">
              <Avatar nombre={registrado.persona || 'Visitante'} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{registrado.persona}</p>
                <p className="text-xs text-slate-500">
                  {registrado.apartamento} · {registrado.hora}
                </p>
              </div>
            </div>
          </motion.div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <BellRing className="size-4 text-brand-600" />
            Notificación enviada al residente
          </p>
        </div>
      ) : (
        <form id="form-visitante" onSubmit={registrar} className="space-y-4">
          <Field label="Tipo de ingreso" required>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de ingreso">
              {TIPOS.map(([t, desc]) => {
                const estilo = estiloTipo(t)
                const Icono = estilo.icono
                const activo = tipo === t
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setTipo(t)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl p-3 text-left outline-none ring-1 transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
                      activo ? 'bg-brand-50/60 ring-2 ring-brand-500' : 'ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg ring-1', estilo.icon)}>
                      <Icono className="size-5" strokeWidth={2} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900">{t}</span>
                      <span className="block text-[11px] leading-tight text-slate-500">{desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cédula" required>
              <Input name="cedula" required inputMode="numeric" placeholder="1.234.567.890" />
            </Field>
            <Field label="Nombre" required>
              <Input name="nombre" required placeholder="Nombre y apellido" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Torre" required>
              <Select name="torre" defaultValue="T1">
                <option value="T1">Torre 1</option>
                <option value="T2">Torre 2</option>
                <option value="T3">Torre 3</option>
              </Select>
            </Field>
            <Field label="Apartamento" required>
              <Input name="apartamento" required inputMode="numeric" placeholder="Ej. 304" />
            </Field>
          </div>
          {tipo === 'Domicilio' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 overflow-hidden rounded-xl bg-amber-50/60 p-4 ring-1 ring-amber-100"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Zap className="size-4 text-amber-500" /> Entrega rápida
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={entregaRapida}
                  aria-label="Entrega rápida"
                  onClick={() => setEntregaRapida((v) => !v)}
                  className={cn(
                    'relative h-6 w-11 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                    entregaRapida ? 'bg-brand-600' : 'bg-slate-300',
                  )}
                >
                  <span className={cn('absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform', entregaRapida && 'translate-x-full')} />
                </button>
              </div>
              <Field label="Empresa" hint="Con entrega rápida el domiciliario no espera al residente">
                <Select name="empresa" defaultValue="Rappi">
                  <option>Rappi</option>
                  <option>Uber Eats</option>
                  <option>Domicilios.com</option>
                  <option>Otra</option>
                </Select>
              </Field>
            </motion.div>
          )}
        </form>
      )}
    </Modal>
  )
}

RegistrarVisitante.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegistrado: PropTypes.func,
}
