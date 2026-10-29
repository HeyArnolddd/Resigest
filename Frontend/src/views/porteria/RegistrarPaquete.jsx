import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'motion/react'
import { BellRing, Package } from 'lucide-react'
import { Button, Field, Input, Modal, Select } from '../../components/ui'
import CheckAnimado from '../../components/porteria/CheckAnimado'
import IlustracionPaquete from '../../components/paquetes/IlustracionPaquete'
import { horaActual } from '../../lib/porteria'
import { cn } from '../../lib/utils'

const TAMANOS = ['Sobre', 'Caja pequeña', 'Paquete mediano', 'Caja grande']

export default function RegistrarPaquete({ open, onClose, onRegistrado }) {
  const [registrado, setRegistrado] = useState(null)
  const [tamano, setTamano] = useState('Caja pequeña')

  const cerrar = () => {
    onClose()
    setTimeout(() => {
      setRegistrado(null)
      setTamano('Caja pequeña')
    }, 200)
  }

  const registrar = (e) => {
    e.preventDefault()
    const datos = {
      id: `PAQ-${Date.now().toString().slice(-4)}`,
      empresa: e.target.empresa.value,
      guia: e.target.guia.value,
      apartamento: `${e.target.torre.value} · ${e.target.apartamento.value}`,
      fecha: `${new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${horaActual()}`,
      descripcion: tamano,
      estado: 'Ha llegado',
    }
    setRegistrado(datos)
    onRegistrado?.(datos)
  }

  return (
    <Modal
      open={open}
      onClose={cerrar}
      title={registrado ? 'Paquete registrado' : 'Registrar paquete'}
      subtitle={registrado ? undefined : 'Correspondencia recibida en portería'}
      icon={Package}
      footer={
        registrado ? (
          <Button onClick={cerrar}>Listo</Button>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={cerrar}>
              Cancelar
            </Button>
            <Button type="submit" form="form-paquete">
              Registrar paquete
            </Button>
          </>
        )
      }
    >
      {registrado ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckAnimado />
          <p className="text-base font-bold text-slate-900">Paquete registrado correctamente</p>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center gap-3 rounded-xl bg-amber-50/70 p-3 text-left ring-1 ring-amber-100"
          >
            <IlustracionPaquete descripcion={registrado.descripcion} className="h-14 w-16" />
            <div>
              <p className="text-base font-extrabold text-slate-900">{registrado.apartamento}</p>
              <p className="text-xs text-slate-500">
                {registrado.empresa} · <span className="font-mono">{registrado.guia}</span>
              </p>
              <p className="mt-1 text-[11px] font-semibold text-warning-strong">Quedó en la estantería</p>
            </div>
          </motion.div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <BellRing className="size-4 text-brand-600" />
            Se generó una notificación al residente
          </p>
        </div>
      ) : (
        <form id="form-paquete" onSubmit={registrar} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Empresa de mensajería" required>
              <Select name="empresa" defaultValue="Rappi">
                <option>Rappi</option>
                <option>Mercado Libre</option>
                <option>Amazon</option>
                <option>Domicilios.com</option>
                <option>Envia</option>
                <option>Otra</option>
              </Select>
            </Field>
            <Field label="N.º de guía" required>
              <Input name="guia" required placeholder="Ej. RP-4829137" />
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
          <Field label="Tamaño">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Tamaño del paquete">
              {TAMANOS.map((t) => {
                const activo = tamano === t
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={activo}
                    onClick={() => setTamano(t)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl px-2 pb-2.5 pt-2 outline-none ring-1 transition-all focus-visible:ring-2 focus-visible:ring-brand-500',
                      activo ? 'bg-brand-50/60 ring-2 ring-brand-500' : 'ring-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <IlustracionPaquete descripcion={t} className={cn('h-12 w-14 transition-transform', activo && '-translate-y-0.5')} />
                    <span className={cn('text-xs font-semibold', activo ? 'text-brand-700' : 'text-slate-600')}>{t}</span>
                  </button>
                )
              })}
            </div>
          </Field>
        </form>
      )}
    </Modal>
  )
}

RegistrarPaquete.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegistrado: PropTypes.func,
}
